import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';
import type { DashboardMetrics, MetricDetail } from '@/types';

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || '';

const STOPWORDS = new Set([
  'de', 'la', 'que', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por',
  'un', 'para', 'con', 'no', 'una', 'su', 'al', 'lo', 'como', 'más', 'pero',
  'sus', 'le', 'ya', 'o', 'este', 'sí', 'porque', 'esta', 'entre', 'cuando',
  'muy', 'sin', 'sobre', 'también', 'me', 'hasta', 'hay', 'donde', 'quien',
  'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra',
  'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mí', 'antes', 'algunos',
  'qué', 'unos', 'yo', 'otro', 'otras', 'otra', 'él', 'tanto', 'esa', 'estos',
  'mucho', 'quienes', 'nada', 'muchos', 'cual', 'poco', 'ella', 'estar', 'estas',
  'algunas', 'algo', 'nosotros', 'mi', 'mis', 'tú', 'te', 'ti', 'tu', 'tus',
  'ellas', 'nosotras', 'vosotros', 'vosotras', 'os', 'mío', 'mía', 'míos',
  'mías', 'tuyo', 'tuya', 'tuyos', 'tuyas', 'suyo', 'suya', 'suyos', 'suyas',
  'nuestro', 'nuestra', 'nuestros', 'nuestras', 'vuestro', 'vuestra', 'vuestros',
  'vuestras', 'esos', 'esas', 'estoy', 'estás', 'está', 'estamos', 'estáis',
  'están', 'esté', 'estés', 'estemos', 'estéis', 'estén', 'estaré', 'estarás',
  'estará', 'estaremos', 'estaréis', 'estarán', 'he', 'has', 'ha', 'hemos',
  'habéis', 'han', 'haya', 'ser', 'es', 'soy', 'eres', 'somos', 'son', 'era',
  'fui', 'fue', 'sido', 'tengo', 'tiene', 'tienen', 'tenemos', 'tener',
  'hacer', 'hago', 'hace', 'hacemos', 'hacen', 'hice', 'hecho',
  'ir', 'voy', 'vas', 'va', 'vamos', 'van', 'ido',
  'poder', 'puedo', 'puede', 'podemos', 'pueden',
  'deber', 'debo', 'debe', 'debemos', 'deben',
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in',
  'with', 'to', 'for', 'of', 'not', 'you', 'i', 'it', 'he', 'she', 'we',
  'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that',
  'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
  'shall', 'can', 'need', 'dare', 'ought', 'used', 'hola', 'buda',
  'si', 'como', 'mas', 'bien', 'mal', 'así', 'asi', 'solo', 'sólo',
  'mucho', 'poco', 'muy', 'tan', 'tanto', 'creo', 'siento', 'quiero',
]);

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    if (password !== DASHBOARD_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const firstDayOfMonth = `${today.substring(0, 7)}-01`;

    // Parallel queries
    const [
      totalUsersResult,
      newUsersTodayResult,
      activeUsersTodayResult,
      messagesTodayResult,
      conversationsTodayResult,
      allMessagesResult,
      premiumUsersResult,
      activityResult,
      retentionD1Result,
      retentionD7Result,
      topicsResult,
      // Detail queries
      topUsersResult,
      newUsersTodayListResult,
      activeUsersTodayListResult,
      messagesTodayTimestampsResult,
      conversationsTodayDetailResult,
      premiumUsersListResult,
      // Financial queries
      messagesThisMonthResult,
      oracleCallsThisMonthResult,
      summaryUpdatesThisMonthResult,
      activePremiumResult,
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('first_seen', `${today}T00:00:00`),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('last_message_date', today),
      supabase.from('messages').select('*', { count: 'exact', head: true }).gte('timestamp', `${today}T00:00:00`),
      supabase.from('messages').select('conversation_id').gte('timestamp', `${today}T00:00:00`),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_premium', true),
      supabase.from('messages').select('timestamp').gte('timestamp', thirtyDaysAgo.toISOString()).order('timestamp', { ascending: true }),
      // D1 retention: users who came back the day after first_seen
      supabase.rpc('get_retention_d1'),
      supabase.rpc('get_retention_d7'),
      supabase.from('messages').select('user_message').gte('timestamp', thirtyDaysAgo.toISOString()).limit(1000),
      // Detail: top 10 users by message count
      supabase.from('users').select('user_phone, total_messages, last_seen, is_premium, is_vip').order('total_messages', { ascending: false }).limit(10),
      // Detail: new users today
      supabase.from('users').select('user_phone, first_seen').gte('first_seen', `${today}T00:00:00`).order('first_seen', { ascending: false }).limit(20),
      // Detail: active users today
      supabase.from('users').select('user_phone, message_count_today, last_seen, is_premium, is_vip').eq('last_message_date', today).order('message_count_today', { ascending: false }).limit(20),
      // Detail: messages today with timestamps (for hourly breakdown)
      supabase.from('messages').select('timestamp').gte('timestamp', `${today}T00:00:00`),
      // Detail: conversations today with details
      supabase.from('messages').select('conversation_id, user_phone, timestamp').gte('timestamp', `${today}T00:00:00`),
      // Detail: premium users list
      supabase.from('premium_users').select('user_phone, status, started_at').order('started_at', { ascending: false }).limit(20),
      // Financial: messages this month (total GPT calls)
      supabase.from('messages').select('*', { count: 'exact', head: true }).gte('timestamp', `${firstDayOfMonth}T00:00:00`),
      // Financial: oracle calls this month
      supabase.from('messages').select('*', { count: 'exact', head: true }).gte('timestamp', `${firstDayOfMonth}T00:00:00`).in('user_message', ['Oráculo', 'oráculo', 'oraculo', 'oracle', 'Oracle']),
      // Financial: summary updates this month
      supabase.from('user_summaries').select('*', { count: 'exact', head: true }).gte('updated_at', `${firstDayOfMonth}T00:00:00`),
      // Financial: active premium subscriptions
      supabase.from('premium_users').select('stripe_subscription_id, status').in('status', ['active', 'trialing']),
    ]);

    // Calculate unique conversations today
    const uniqueConversations = new Set(conversationsTodayResult.data?.map((m: { conversation_id: string }) => m.conversation_id) || []);

    // Calculate avg messages per user
    const totalUsers = totalUsersResult.count || 0;
    const totalMessages = allMessagesResult.count || 0;
    const avgMessagesPerUser = totalUsers > 0 ? Math.round((totalMessages / totalUsers) * 10) / 10 : 0;

    // Calculate avg conversation length
    const convLengths = new Map<string, number>();
    if (conversationsTodayResult.data) {
      for (const m of conversationsTodayResult.data) {
        convLengths.set(m.conversation_id, (convLengths.get(m.conversation_id) || 0) + 1);
      }
    }
    const convValues = Array.from(convLengths.values());
    const avgConversationLength = convValues.length > 0
      ? Math.round((convValues.reduce((a, b) => a + b, 0) / convValues.length) * 10) / 10
      : 0;

    // Activity chart - messages per day
    const activityMap = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      activityMap.set(d.toISOString().split('T')[0], 0);
    }
    if (activityResult.data) {
      for (const msg of activityResult.data) {
        const day = new Date(msg.timestamp).toISOString().split('T')[0];
        activityMap.set(day, (activityMap.get(day) || 0) + 1);
      }
    }
    const activityChart = Array.from(activityMap.entries()).map(([date, count]) => ({ date, count }));

    // Top topics
    const wordCounts = new Map<string, number>();
    if (topicsResult.data) {
      for (const msg of topicsResult.data) {
        const words = msg.user_message
          .toLowerCase()
          .replace(/[^a-záéíóúñü\s]/g, '')
          .split(/\s+/)
          .filter((w: string) => w.length > 3 && !STOPWORDS.has(w));
        for (const word of words) {
          wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
        }
      }
    }
    const topTopics = Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word, count]) => ({ word, count }));

    // Build detail tables
    const details: Record<string, MetricDetail> = {};

    // Total users → top 10 by messages
    details['totalUsers'] = {
      headers: ['Teléfono', 'Mensajes', 'Última vez', 'Tipo'],
      rows: (topUsersResult.data || []).map((u: { user_phone: string; total_messages: number; last_seen: string; is_premium: boolean; is_vip: boolean }) => [
        u.user_phone,
        String(u.total_messages),
        new Date(u.last_seen).toLocaleDateString('es-ES'),
        u.is_vip ? 'VIP' : u.is_premium ? 'Premium' : 'Free',
      ]),
    };

    // New users today
    details['newUsersToday'] = {
      headers: ['Teléfono', 'Hora registro'],
      rows: (newUsersTodayListResult.data || []).map((u: { user_phone: string; first_seen: string }) => [
        u.user_phone,
        new Date(u.first_seen).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      ]),
    };

    // Active users today
    details['activeUsersToday'] = {
      headers: ['Teléfono', 'Msgs hoy', 'Última vez', 'Tipo'],
      rows: (activeUsersTodayListResult.data || []).map((u: { user_phone: string; message_count_today: number; last_seen: string; is_premium: boolean; is_vip: boolean }) => [
        u.user_phone,
        String(u.message_count_today),
        new Date(u.last_seen).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        u.is_vip ? 'VIP' : u.is_premium ? 'Premium' : 'Free',
      ]),
    };

    // Messages today → hourly breakdown
    const hourlyMap = new Map<number, number>();
    for (let h = 0; h < 24; h++) hourlyMap.set(h, 0);
    if (messagesTodayTimestampsResult.data) {
      for (const m of messagesTodayTimestampsResult.data) {
        const hour = new Date(m.timestamp).getHours();
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
      }
    }
    details['messagesToday'] = {
      headers: ['Hora', 'Mensajes'],
      rows: Array.from(hourlyMap.entries())
        .filter(([, count]) => count > 0)
        .map(([hour, count]) => [
          `${String(hour).padStart(2, '0')}:00`,
          String(count),
        ]),
    };

    // Conversations today → grouped by conversation
    const convDetailMap = new Map<string, { phone: string; count: number; firstMsg: string }>();
    if (conversationsTodayDetailResult.data) {
      for (const m of conversationsTodayDetailResult.data) {
        const existing = convDetailMap.get(m.conversation_id);
        if (existing) {
          existing.count++;
        } else {
          convDetailMap.set(m.conversation_id, {
            phone: m.user_phone,
            count: 1,
            firstMsg: m.timestamp,
          });
        }
      }
    }
    details['conversationsToday'] = {
      headers: ['Usuario', 'Mensajes', 'Inicio'],
      rows: Array.from(convDetailMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 15)
        .map((c) => [
          c.phone,
          String(c.count),
          new Date(c.firstMsg).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        ]),
    };

    // Premium users list
    details['premiumUsers'] = {
      headers: ['Teléfono', 'Estado', 'Desde'],
      rows: (premiumUsersListResult.data || []).map((u: { user_phone: string; status: string; started_at: string }) => [
        u.user_phone,
        u.status,
        new Date(u.started_at).toLocaleDateString('es-ES'),
      ]),
    };

    // --- Financial calculations ---
    const messagesThisMonth = messagesThisMonthResult.count || 0;
    const oracleCallsThisMonth = oracleCallsThisMonthResult.count || 0;
    const summaryUpdatesThisMonth = summaryUpdatesThisMonthResult.count || 0;

    // Estimate cached messages (~30% of total based on greeting/thanks/farewell patterns)
    // This is approximate; cached messages don't hit GPT at all
    const estimatedCachedPercent = 0.30;
    const cachedMessagesThisMonth = Math.round(messagesThisMonth * estimatedCachedPercent);
    const gptMessagesThisMonth = messagesThisMonth - cachedMessagesThisMonth - oracleCallsThisMonth;

    // Cost estimates (USD)
    // GPT-4o-mini: ~1850 input tokens (system+fewshot+history) + ~100 output tokens per message
    // Pricing: $0.15/1M input, $0.60/1M output
    const costPerGpt4oMiniMsg = (1850 * 0.00000015) + (100 * 0.0000006); // ~$0.000338
    const estimatedCostGpt4oMini = Math.round(gptMessagesThisMonth * costPerGpt4oMiniMsg * 100) / 100;

    // GPT-4o: Oracle (~500 input + ~200 output) + Summaries (~2000 input + ~300 output)
    // Pricing: $2.50/1M input, $10.00/1M output
    const costPerOracle = (500 * 0.0000025) + (200 * 0.00001); // ~$0.00325
    const costPerSummary = (2000 * 0.0000025) + (300 * 0.00001); // ~$0.008
    const estimatedCostGpt4o = Math.round(
      (oracleCallsThisMonth * costPerOracle + summaryUpdatesThisMonth * costPerSummary) * 100
    ) / 100;

    const totalEstimatedCost = Math.round((estimatedCostGpt4oMini + estimatedCostGpt4o) * 100) / 100;

    // Revenue calculations (EUR)
    // Query Stripe for actual subscription intervals
    let activeWeekly = 0;
    let activeMonthly = 0;
    const activeSubIds = (activePremiumResult.data || [])
      .map((u: { stripe_subscription_id: string; status: string }) => u.stripe_subscription_id)
      .filter(Boolean);

    if (activeSubIds.length > 0) {
      try {
        const stripe = getStripe();
        // Fetch subscription details in batches of 10
        const subPromises = activeSubIds.slice(0, 50).map((id: string) =>
          stripe.subscriptions.retrieve(id).catch(() => null)
        );
        const subscriptions = await Promise.all(subPromises);
        for (const sub of subscriptions) {
          if (!sub || !('items' in sub)) continue;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const interval = (sub as any).items?.data?.[0]?.price?.recurring?.interval;
          if (interval === 'week') activeWeekly++;
          else if (interval === 'month') activeMonthly++;
        }
      } catch (e) {
        console.error('[dashboard] Stripe subscription fetch error:', e);
        // Fallback: assume all monthly
        activeMonthly = activeSubIds.length;
      }
    }

    // Also count VIP users (they don't pay but have premium access)
    const activePremiumSubscriptions = activeWeekly + activeMonthly;

    // MRR: weekly × €1.99 × 4.33 (avg weeks/month) + monthly × €6.99
    const weeklyMRR = activeWeekly * 1.99 * 4.33;
    const monthlyMRR = activeMonthly * 6.99;
    const estimatedMRR = Math.round((weeklyMRR + monthlyMRR) * 100) / 100;

    // Stripe fees: 2.9% + €0.25 per transaction
    // Weekly: 4.33 transactions/month, Monthly: 1 transaction/month
    const weeklyStripeFees = activeWeekly * (4.33 * (1.99 * 0.029 + 0.25));
    const monthlyStripeFees = activeMonthly * (6.99 * 0.029 + 0.25);
    const estimatedStripeFeesMonthly = Math.round((weeklyStripeFees + monthlyStripeFees) * 100) / 100;

    const estimatedNetRevenue = Math.round((estimatedMRR - estimatedStripeFeesMonthly) * 100) / 100;

    // Convert cost to EUR for margin calculation (approximate rate)
    const usdToEur = 0.92;
    const costInEur = totalEstimatedCost * usdToEur;
    const estimatedMarginPercent = estimatedNetRevenue > 0
      ? Math.round(((estimatedNetRevenue - costInEur) / estimatedNetRevenue) * 1000) / 10
      : 0;

    const metrics: DashboardMetrics = {
      overview: {
        totalUsers,
        newUsersToday: newUsersTodayResult.count || 0,
        activeUsersToday: activeUsersTodayResult.count || 0,
        totalMessagesToday: messagesTodayResult.count || 0,
        totalConversationsToday: uniqueConversations.size,
      },
      engagement: {
        avgMessagesPerUser,
        avgConversationLength,
      },
      retention: {
        d1: typeof retentionD1Result.data === 'number' ? retentionD1Result.data : 0,
        d7: typeof retentionD7Result.data === 'number' ? retentionD7Result.data : 0,
      },
      activityChart,
      topTopics,
      premium: {
        premiumUsers: premiumUsersResult.count || 0,
        conversionRate: totalUsers > 0 ? Math.round(((premiumUsersResult.count || 0) / totalUsers) * 1000) / 10 : 0,
      },
      financials: {
        messagesThisMonth,
        cachedMessagesThisMonth,
        oracleCallsThisMonth,
        summaryUpdatesThisMonth,
        estimatedCostGpt4oMini,
        estimatedCostGpt4o,
        totalEstimatedCost,
        activePremiumSubscriptions,
        activeWeeklySubscriptions: activeWeekly,
        activeMonthlySubscriptions: activeMonthly,
        estimatedMRR,
        estimatedStripeFeesMonthly,
        estimatedNetRevenue,
        estimatedMarginPercent,
      },
      details,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
