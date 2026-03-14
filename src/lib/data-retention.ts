import { supabase } from './supabase';

const MESSAGE_RETENTION_DAYS = 90;
const INACTIVE_USER_RETENTION_DAYS = 365;

export async function cleanupOldMessages(): Promise<{ deletedMessages: number }> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - MESSAGE_RETENTION_DAYS);

  const { data } = await supabase
    .from('messages')
    .delete()
    .lt('timestamp', cutoffDate.toISOString())
    .select('id');

  return { deletedMessages: data?.length || 0 };
}

export async function cleanupInactiveUsers(): Promise<{ deletedUsers: number }> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - INACTIVE_USER_RETENTION_DAYS);

  const { data: inactiveUsers } = await supabase
    .from('users')
    .select('user_phone')
    .lt('last_seen', cutoffDate.toISOString())
    .eq('is_premium', false);

  if (!inactiveUsers || inactiveUsers.length === 0) return { deletedUsers: 0 };

  for (const user of inactiveUsers) {
    await supabase.from('messages').delete().eq('user_phone', user.user_phone);
    await supabase.from('user_summaries').delete().eq('user_phone', user.user_phone);
    await supabase.from('premium_tokens').delete().eq('user_phone', user.user_phone);
    await supabase.from('users').delete().eq('user_phone', user.user_phone);
  }

  return { deletedUsers: inactiveUsers.length };
}
