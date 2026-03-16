import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendWhatsAppMessage, showTypingIndicator } from '@/lib/whatsapp';
import { generateBudaResponse } from '@/lib/openai';
import { getBuddhaSystemPrompt, WELCOME_MESSAGE, getLimitReachedMessage, getPremiumLimitMessage, getCancelConfirmationMessage, getCancelledMessage, getDeleteDataConfirmationMessage, getDataDeletedMessage, CRISIS_MESSAGE } from '@/lib/prompts/buddha-system';
import { ORACLE_SYSTEM_PROMPT } from '@/lib/prompts/oracle';
import { isCrisisMessage } from '@/lib/crisis-detection';
import { checkRateLimit, incrementMessageCount } from '@/lib/rate-limit';
import { getConversationContext, getUserSummary, saveMessage, getOrCreateConversationId, deleteUserData } from '@/lib/conversation';
import { getStripe } from '@/lib/stripe';
import { getCachedResponse } from '@/lib/response-cache';
import { shouldSplitResponse, getPreludeMessage, shouldPauseConversation, getPauseMessage, getResponseDepth, getDepthInstruction } from '@/lib/scarcity-wisdom';
import { randomBytes } from 'crypto';
import type { WhatsAppMessage } from '@/types';

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || '';

// Normalized message extracted from either Meta or Kapso webhook payloads
interface IncomingMessage {
  from: string;
  id: string;
  type: string;
  text: string;
}

/**
 * Extract the sender phone from a Kapso message object.
 * Kapso stores it in message.kapso.phone_number or message.from or conversation.phone_number.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getKapsoSender(msg: any, event?: any): string {
  return msg.kapso?.phone_number || msg.from || event?.conversation?.phone_number || '';
}

/**
 * Check if a Kapso message is inbound (from user, not from us).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isKapsoInbound(msg: any): boolean {
  const direction = msg.kapso?.direction || msg.direction;
  if (direction && direction !== 'inbound') return false;
  return true;
}

/**
 * Convert a Kapso message object to our normalized format.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function kapsoMessageToIncoming(msg: any, event?: any): IncomingMessage | null {
  if (!isKapsoInbound(msg)) return null;
  return {
    from: getKapsoSender(msg, event),
    id: msg.id || '',
    type: msg.type || '',
    text: msg.type === 'text' ? msg.text?.body || '' : '',
  };
}

/**
 * Extract messages from either Meta or Kapso webhook payloads.
 * - Meta format: { object: 'whatsapp_business_account', entry: [...] }
 * - Kapso v2 batch: { batch: true, data: [{ message, conversation, ... }], batch_info }
 * - Kapso v2 single: { type: '...', message: {...}, conversation: {...} }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractMessages(body: any): IncomingMessage[] {
  // --- Meta Cloud API format ---
  if (body.object === 'whatsapp_business_account' && body.entry) {
    const messages: IncomingMessage[] = [];
    for (const entry of body.entry) {
      for (const change of entry.changes) {
        const msgs = change.value?.messages as WhatsAppMessage[] | undefined;
        if (!msgs) continue;
        for (const msg of msgs) {
          messages.push({
            from: msg.from,
            id: msg.id,
            type: msg.type,
            text: msg.type === 'text' ? msg.text?.body || '' : '',
          });
        }
      }
    }
    return messages;
  }

  // --- Kapso v2 batched format ---
  // { batch: true, data: [{ message: {...}, conversation: {...} }, ...], batch_info: { size: N } }
  if (body.batch === true && Array.isArray(body.data)) {
    const results: IncomingMessage[] = [];
    for (const event of body.data) {
      const msg = event.message;
      if (!msg) continue;
      const incoming = kapsoMessageToIncoming(msg, event);
      if (incoming) results.push(incoming);
    }
    return results;
  }

  // --- Kapso v2 single format ---
  // { type: 'whatsapp.message.received', message: {...}, conversation: {...} }
  if (body.message && body.type) {
    const incoming = kapsoMessageToIncoming(body.message, body);
    return incoming ? [incoming] : [];
  }

  return [];
}

// Webhook verification (GET)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log('[webhook] GET verification:', { mode, tokenMatch: token === VERIFY_TOKEN, hasChallenge: !!challenge });

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// Webhook message handler (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('[webhook] POST received, keys:', Object.keys(body).join(','));
    console.log('[webhook] PAYLOAD:', JSON.stringify(body).substring(0, 2000));

    const messages = extractMessages(body);

    if (messages.length === 0) {
      console.log('[webhook] No inbound messages found in payload');
      return NextResponse.json({ status: 'ok' });
    }

    for (const message of messages) {
      console.log('[webhook] Message received:', { type: message.type, from: message.from, id: message.id });
      if (message.type !== 'text') continue;
      try {
        await handleTextMessage(message.from, message.text, message.id);
        console.log('[webhook] Message handled successfully for', message.from);
      } catch (msgError) {
        console.error('[webhook] Error handling message:', msgError);
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('[webhook] Fatal error:', error);
    return NextResponse.json({ status: 'ok' });
  }
}

// State tracking for confirmation flows
const pendingConfirmations = new Map<string, { type: 'cancel' | 'delete'; expiresAt: number }>();

async function handleTextMessage(from: string, text: string, messageId: string): Promise<void> {
  console.log('[handleMsg] Start:', { from, text: text.substring(0, 50) });

  try {
    // Show typing indicator (also marks message as read)
    await showTypingIndicator(messageId);
  } catch (e) {
    console.error('[handleMsg] showTypingIndicator failed (non-blocking):', e);
  }

  const normalizedText = text.trim().toLowerCase();

  // Check for pending confirmations first
  const pending = pendingConfirmations.get(from);
  if (pending && Date.now() < pending.expiresAt) {
    if (pending.type === 'cancel' && normalizedText.includes('confirmar cancelación')) {
      pendingConfirmations.delete(from);
      await handleCancelConfirmed(from);
      return;
    }
    if (pending.type === 'delete' && normalizedText.includes('confirmar borrado')) {
      pendingConfirmations.delete(from);
      await handleDeleteConfirmed(from);
      return;
    }
  }

  // Crisis detection — always check first
  if (isCrisisMessage(text)) {
    await sendWhatsAppMessage(from, CRISIS_MESSAGE);
    return;
  }

  // Ensure user exists
  console.log('[handleMsg] Ensuring user exists...');
  await ensureUserExists(from);

  // Special commands
  if (normalizedText === 'cancelar premium' || normalizedText === 'cancelar suscripción' || normalizedText === 'cancelar suscripcion') {
    pendingConfirmations.set(from, { type: 'cancel', expiresAt: Date.now() + 5 * 60 * 1000 });
    await sendWhatsAppMessage(from, getCancelConfirmationMessage());
    return;
  }

  if (normalizedText === 'borrar mis datos' || normalizedText === 'eliminar mis datos') {
    pendingConfirmations.set(from, { type: 'delete', expiresAt: Date.now() + 5 * 60 * 1000 });
    await sendWhatsAppMessage(from, getDeleteDataConfirmationMessage());
    return;
  }

  // Premium request — generate token and send link
  if (normalizedText === 'premium' || normalizedText === 'quiero premium' || normalizedText === 'hacerme premium' || normalizedText === 'hazte premium') {
    // Check if already premium
    const { data: existingPremium } = await supabase
      .from('users')
      .select('is_premium, is_vip')
      .eq('user_phone', from)
      .maybeSingle();

    if (existingPremium?.is_premium || existingPremium?.is_vip) {
      await sendWhatsAppMessage(from, 'Ya caminas el sendero Premium. Disfruta de tus conversaciones sin límites. 🙏');
      return;
    }

    await ensureUserExists(from);
    const token = await generatePremiumToken(from);
    const premiumLink = `${APP_URL}/premium?token=${token}`;
    await sendWhatsAppMessage(from, `Si deseas continuar este camino sin límites, puedes activar Premium aquí:\n\n${premiumLink}\n\nIncluye 3 días gratis para explorar con calma.`);
    return;
  }

  // Rate limiting
  console.log('[handleMsg] Checking rate limit...');
  const rateLimit = await checkRateLimit(from);
  if (!rateLimit.allowed) {
    if (rateLimit.isPremium || rateLimit.isVip) {
      await sendWhatsAppMessage(from, getPremiumLimitMessage());
    } else {
      const token = await generatePremiumToken(from);
      const premiumLink = `${APP_URL}/premium?token=${token}`;
      await sendWhatsAppMessage(from, getLimitReachedMessage(premiumLink));
    }
    return;
  }

  // Get user data for scarcity wisdom decisions
  console.log('[handleMsg] Rate limit passed, getting user data...');
  const { data: user } = await supabase
    .from('users')
    .select('total_messages, is_premium, is_vip')
    .eq('user_phone', from)
    .maybeSingle();

  const totalMessages = user?.total_messages || 0;

  // Check if first message (welcome)
  if (user && totalMessages === 0) {
    await sendWhatsAppMessage(from, WELCOME_MESSAGE);
    await incrementMessageCount(from);
    await saveMessage(from, text, WELCOME_MESSAGE, await getOrCreateConversationId(from));
    return;
  }

  // Oracle mode (premium only)
  if (normalizedText === 'oráculo' || normalizedText === 'oraculo' || normalizedText === 'oracle') {
    if (!user?.is_premium && !user?.is_vip) {
      const token = await generatePremiumToken(from);
      const premiumLink = `${APP_URL}/premium?token=${token}`;
      await sendWhatsAppMessage(from, `El Oráculo es una experiencia exclusiva para quienes caminan el sendero Premium.\n\nSi deseas acceder a enseñanzas más profundas, puedes hacerlo aquí:\n\n${premiumLink}`);
      return;
    }

    // Oracle: GPT-4o call (the API latency IS the natural "thinking" delay)
    const response = await generateBudaResponse(ORACLE_SYSTEM_PROMPT, [{ role: 'user', content: 'Oráculo' }], 'gpt-4o');
    await incrementMessageCount(from);
    await saveMessage(from, text, response, await getOrCreateConversationId(from));
    await sendWhatsAppMessage(from, response);
    return;
  }

  // Check for cached response (greetings, thanks, farewells) — saves GPT calls
  const cachedResponse = getCachedResponse(text);
  if (cachedResponse) {
    await incrementMessageCount(from);
    await saveMessage(from, text, cachedResponse, await getOrCreateConversationId(from));
    await sendWhatsAppMessage(from, cachedResponse);
    return;
  }

  // --- Scarcity Wisdom: Reflective pause ---
  // Occasionally, Buda pauses the conversation instead of responding directly.
  // NEVER pause when the user is asking a question, expressing confusion, or
  // requesting action — it feels like Buda is telling them to shut up.
  const isUserAskingOrConfused = /[?¿]/.test(text) ||
    /no (te )?entiendo|a qu[eé] te refieres|qu[eé] (debo|puedo|hago)|c[oó]mo|sigo sin/i.test(normalizedText);
  if (!isUserAskingOrConfused && shouldPauseConversation(totalMessages)) {
    const pauseMsg = getPauseMessage();
    await incrementMessageCount(from);
    await saveMessage(from, text, pauseMsg, await getOrCreateConversationId(from));
    await sendWhatsAppMessage(from, pauseMsg);
    return;
  }

  // --- Normal conversation with Scarcity Wisdom ---
  const [summary, conversationHistory, conversationId] = await Promise.all([
    getUserSummary(from),
    getConversationContext(from),
    getOrCreateConversationId(from),
  ]);

  // Progressive depth: adjust prompt based on user relationship
  const depth = getResponseDepth(totalMessages);
  const depthInstruction = getDepthInstruction(depth);
  const systemPrompt = getBuddhaSystemPrompt(summary || undefined, undefined, depthInstruction);
  const history = [...conversationHistory, { role: 'user' as const, content: text }];

  // GPT call — the API latency (2-4s) IS the natural "thinking" delay
  console.log('[handleMsg] Calling GPT-4o-mini...');
  const response = await generateBudaResponse(systemPrompt, history, 'gpt-4o-mini', depth);
  console.log('[handleMsg] GPT response received, length:', response.length);

  await incrementMessageCount(from);
  await saveMessage(from, text, response, conversationId);

  // Scarcity Wisdom: occasionally split into prelude + main response
  if (shouldSplitResponse(totalMessages)) {
    await sendWhatsAppMessage(from, getPreludeMessage());
  }

  await sendWhatsAppMessage(from, response);
}

async function ensureUserExists(phone: string): Promise<void> {
  const { data } = await supabase
    .from('users')
    .select('user_phone')
    .eq('user_phone', phone)
    .maybeSingle();

  if (!data) {
    await supabase.from('users').insert({
      user_phone: phone,
      first_seen: new Date().toISOString(),
      last_seen: new Date().toISOString(),
      total_messages: 0,
      is_premium: false,
      is_vip: false,
      message_count_today: 0,
      last_message_date: new Date().toISOString().split('T')[0],
    });
  }
}

async function generatePremiumToken(phone: string): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await supabase.from('premium_tokens').insert({
    user_phone: phone,
    token,
    expires_at: expiresAt.toISOString(),
    used: false,
  });

  return token;
}

async function handleCancelConfirmed(from: string): Promise<void> {
  const { data: premiumUser } = await supabase
    .from('premium_users')
    .select('stripe_subscription_id')
    .eq('user_phone', from)
    .maybeSingle();

  if (premiumUser?.stripe_subscription_id) {
    try {
      const subscription = await getStripe().subscriptions.update(premiumUser.stripe_subscription_id, {
        cancel_at_period_end: true,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const endDate = new Date(((subscription as any).current_period_end || 0) * 1000);
      const formattedDate = endDate.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      await supabase
        .from('premium_users')
        .update({ status: 'cancelling', updated_at: new Date().toISOString() })
        .eq('user_phone', from);

      await sendWhatsAppMessage(from, getCancelledMessage(formattedDate));
    } catch (error) {
      console.error('Stripe cancel error:', error);
      await sendWhatsAppMessage(from, 'Hubo un error al procesar la cancelación. Por favor, intenta de nuevo más tarde.');
    }
  } else {
    await sendWhatsAppMessage(from, 'No se encontró una suscripción activa asociada a tu número.');
  }
}

async function handleDeleteConfirmed(from: string): Promise<void> {
  try {
    await deleteUserData(from);
    await sendWhatsAppMessage(from, getDataDeletedMessage());
  } catch (error) {
    console.error('Delete data error:', error);
    await sendWhatsAppMessage(from, 'Hubo un error al eliminar tus datos. Por favor, intenta de nuevo más tarde.');
  }
}
