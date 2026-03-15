import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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
      details,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
