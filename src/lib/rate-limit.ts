import { supabase } from './supabase';
import type { User } from '@/types';

const FREE_DAILY_LIMIT = 3;
const PREMIUM_DAILY_LIMIT = 50;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  isPremium: boolean;
  isVip: boolean;
}

export async function checkRateLimit(userPhone: string): Promise<RateLimitResult> {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('user_phone', userPhone)
    .single<User>();

  if (!user) {
    return { allowed: true, remaining: FREE_DAILY_LIMIT - 1, limit: FREE_DAILY_LIMIT, isPremium: false, isVip: false };
  }

  const isUnlimited = user.is_premium || user.is_vip;
  const limit = isUnlimited ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT;
  const today = new Date().toISOString().split('T')[0];

  const currentCount = user.last_message_date === today ? user.message_count_today : 0;
  const allowed = currentCount < limit;
  const remaining = Math.max(0, limit - currentCount - 1);

  return { allowed, remaining, limit, isPremium: user.is_premium, isVip: user.is_vip };
}

export async function incrementMessageCount(userPhone: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  const { data: user } = await supabase
    .from('users')
    .select('last_message_date, message_count_today, total_messages')
    .eq('user_phone', userPhone)
    .single();

  const currentCount = user?.last_message_date === today ? (user.message_count_today || 0) : 0;
  const totalMessages = (user?.total_messages as number) || 0;

  await supabase
    .from('users')
    .update({
      message_count_today: currentCount + 1,
      last_message_date: today,
      last_seen: new Date().toISOString(),
      total_messages: totalMessages + 1,
    })
    .eq('user_phone', userPhone);
}
