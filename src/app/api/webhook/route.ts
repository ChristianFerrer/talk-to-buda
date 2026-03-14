import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendWhatsAppMessage, markMessageAsRead } from '@/lib/whatsapp';
import { generateBudaResponse } from '@/lib/openai';
import { getBuddhaSystemPrompt, WELCOME_MESSAGE, getLimitReachedMessage, getPremiumLimitMessage, getCancelConfirmationMessage, getCancelledMessage, getDeleteDataConfirmationMessage, getDataDeletedMessage, CRISIS_MESSAGE } from '@/lib/prompts/buddha-system';
import { ORACLE_SYSTEM_PROMPT } from '@/lib/prompts/oracle';
import { isCrisisMessage } from '@/lib/crisis-detection';
import { checkRateLimit, incrementMessageCount } from '@/lib/rate-limit';
import { getConversationContext, getUserSummary, saveMessage, getOrCreateConversationId, deleteUserData } from '@/lib/conversation';
import { getStripe } from '@/lib/stripe';
import { getCachedResponse } from '@/lib/response-cache';
import { randomBytes } from 'crypto';
import type { WhatsAppWebhookBody } from '@/types';

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || '';

// Webhook verification (GET)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// Webhook message handler (POST)
export async function POST(request: NextRequest) {
  try {
    const body: WhatsAppWebhookBody = await request.json();

    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ok' });
    }

    for (const entry of body.entry) {
      for (const change of entry.changes) {
        const messages = change.value.messages;
        if (!messages) continue;

        for (const message of messages) {
          if (message.type !== 'text') continue;
          await handleTextMessage(message.from, message.text.body, message.id);
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ status: 'ok' });
  }
}

// State tracking for confirmation flows
const pendingConfirmations = new Map<string, { type: 'cancel' | 'delete'; expiresAt: number }>();

async function handleTextMessage(from: string, text: string, messageId: string): Promise<void> {
  await markMessageAsRead(messageId);

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

  // Rate limiting
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

  // Check if first message (welcome)
  const { data: user } = await supabase
    .from('users')
    .select('total_messages')
    .eq('user_phone', from)
    .single();

  if (user && user.total_messages === 0) {
    await sendWhatsAppMessage(from, WELCOME_MESSAGE);
    await incrementMessageCount(from);
    await saveMessage(from, text, WELCOME_MESSAGE, await getOrCreateConversationId(from));
    return;
  }

  // Oracle mode (premium only)
  if (normalizedText === 'oráculo' || normalizedText === 'oraculo' || normalizedText === 'oracle') {
    const { data: oracleUser } = await supabase
      .from('users')
      .select('is_premium, is_vip')
      .eq('user_phone', from)
      .single();

    if (!oracleUser?.is_premium && !oracleUser?.is_vip) {
      const token = await generatePremiumToken(from);
      const premiumLink = `${APP_URL}/premium?token=${token}`;
      await sendWhatsAppMessage(from, `El Oráculo es una experiencia exclusiva para quienes caminan el sendero Premium.\n\nSi deseas acceder a enseñanzas más profundas, puedes hacerlo aquí:\n\n${premiumLink}`);
      return;
    }

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

  // Normal conversation
  const [summary, conversationHistory, conversationId] = await Promise.all([
    getUserSummary(from),
    getConversationContext(from),
    getOrCreateConversationId(from),
  ]);

  const systemPrompt = getBuddhaSystemPrompt(summary || undefined);
  const history = [...conversationHistory, { role: 'user' as const, content: text }];
  const response = await generateBudaResponse(systemPrompt, history, 'gpt-4o-mini');

  await incrementMessageCount(from);
  await saveMessage(from, text, response, conversationId);
  await sendWhatsAppMessage(from, response);
}

async function ensureUserExists(phone: string): Promise<void> {
  const { data } = await supabase
    .from('users')
    .select('user_phone')
    .eq('user_phone', phone)
    .single();

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
    .single();

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
