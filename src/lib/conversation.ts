import { supabase } from './supabase';
import { generateSummary } from './openai';

const RECENT_MESSAGES_COUNT = 8;
const SUMMARY_TRIGGER_COUNT = 20;

export async function getConversationContext(
  userPhone: string
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  const { data: messages } = await supabase
    .from('messages')
    .select('user_message, buda_response')
    .eq('user_phone', userPhone)
    .order('timestamp', { ascending: false })
    .limit(RECENT_MESSAGES_COUNT);

  if (!messages || messages.length === 0) return [];

  const history: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  const reversed = [...messages].reverse();

  for (const msg of reversed) {
    history.push({ role: 'user', content: msg.user_message });
    if (msg.buda_response) {
      history.push({ role: 'assistant', content: msg.buda_response });
    }
  }

  return history;
}

export async function getUserSummary(userPhone: string): Promise<string | null> {
  const { data } = await supabase
    .from('user_summaries')
    .select('summary_text')
    .eq('user_phone', userPhone)
    .maybeSingle();

  return data?.summary_text || null;
}

export async function saveMessage(
  userPhone: string,
  userMessage: string,
  budaResponse: string,
  conversationId: string
): Promise<void> {
  await supabase.from('messages').insert({
    user_phone: userPhone,
    user_message: userMessage,
    buda_response: budaResponse,
    conversation_id: conversationId,
    timestamp: new Date().toISOString(),
  });

  await checkAndUpdateSummary(userPhone);
}

async function checkAndUpdateSummary(userPhone: string): Promise<void> {
  const { count } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('user_phone', userPhone);

  if (!count || count % SUMMARY_TRIGGER_COUNT !== 0) return;

  const { data: recentMessages } = await supabase
    .from('messages')
    .select('user_message')
    .eq('user_phone', userPhone)
    .order('timestamp', { ascending: false })
    .limit(SUMMARY_TRIGGER_COUNT);

  if (!recentMessages || recentMessages.length === 0) return;

  const existingSummary = await getUserSummary(userPhone);
  const userMessages = recentMessages.map((m: { user_message: string }) => m.user_message);

  if (existingSummary) {
    userMessages.unshift(`Resumen previo: ${existingSummary}`);
  }

  const newSummary = await generateSummary(userMessages);

  await supabase
    .from('user_summaries')
    .upsert(
      {
        user_phone: userPhone,
        summary_text: newSummary,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_phone' }
    );
}

export async function getOrCreateConversationId(userPhone: string): Promise<string> {
  const { data: lastMessage } = await supabase
    .from('messages')
    .select('conversation_id, timestamp')
    .eq('user_phone', userPhone)
    .order('timestamp', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastMessage) {
    const lastTime = new Date(lastMessage.timestamp).getTime();
    const now = Date.now();
    const hoursDiff = (now - lastTime) / (1000 * 60 * 60);

    if (hoursDiff < 4) {
      return lastMessage.conversation_id;
    }
  }

  return `conv_${userPhone}_${Date.now()}`;
}

export async function deleteUserData(userPhone: string): Promise<void> {
  await supabase.from('messages').delete().eq('user_phone', userPhone);
  await supabase.from('user_summaries').delete().eq('user_phone', userPhone);
  await supabase.from('premium_tokens').delete().eq('user_phone', userPhone);
  await supabase.from('premium_users').delete().eq('user_phone', userPhone);
  await supabase.from('users').delete().eq('user_phone', userPhone);
}
