/**
 * Morning message system for premium users.
 * Sends a daily reflection at 7-8am ONLY to users who wrote yesterday
 * (to stay within the 24h WhatsApp conversation window and avoid template costs).
 */

import { supabase } from './supabase';
import { sendWhatsAppMessage } from './whatsapp';

const MORNING_MESSAGES = [
  'Buenos días. Antes de que el día te arrastre, respira profundo. ¿Qué intención quieres sembrar hoy?',
  'El amanecer no juzga al día anterior. Tú tampoco deberías. ¿Qué deseas soltar hoy?',
  'Cada mañana es una página en blanco. ¿Qué escribirás con tus acciones hoy?',
  'El río no lleva la misma agua dos veces. Hoy eres nuevo. ¿Qué necesita tu mente esta mañana?',
  'Antes de hacer, simplemente sé. ¿Cómo se siente tu cuerpo al despertar?',
  'La mente descansada ve con claridad. ¿Hay algo que quieras explorar hoy?',
  'Como el sol sale sin prisa, comienza tu día con calma. ¿Qué te preocupa esta mañana?',
  'Observa tus primeros pensamientos del día. ¿Son nubes pasajeras o montañas?',
  'Hoy tienes la oportunidad de responder en lugar de reaccionar. ¿Qué situación necesita tu calma?',
  'La flor no compite con la de al lado. Simplemente florece. ¿Qué puedes hacer hoy solo por ti?',
  'El silencio de la mañana es un regalo. ¿Qué escuchas cuando todo está en calma?',
  'Cada paso comienza donde estás. No donde quisieras estar. ¿Dónde estás hoy?',
  'El bambú crece en silencio antes de elevarse. ¿Qué está creciendo en ti sin que lo notes?',
  'Buenos días. Recuerda: no necesitas resolver todo hoy. ¿Qué es lo más importante ahora mismo?',
  'La niebla de la mañana se disipa con paciencia. Tus dudas también. ¿Qué deseas aclarar?',
  'Antes de correr, camina. Antes de hablar, escucha. ¿Qué te dice tu interior hoy?',
  'El agua más profunda es la más silenciosa. ¿Hay algo profundo que quieras compartir hoy?',
  'Hoy es un buen día para practicar la compasión. Empieza contigo. ¿Cómo puedes ser amable contigo hoy?',
  'Las raíces crecen en la oscuridad para sostener lo que brilla. ¿Qué te sostiene a ti?',
  'No busques la paz fuera. Ya está aquí. Respira. ¿Qué necesitas esta mañana?',
  'El pájaro no canta porque tenga respuestas, sino porque tiene una canción. ¿Cuál es la tuya hoy?',
  'Observa el cielo de esta mañana. Cambia constantemente, como tus pensamientos. ¿Qué observas dentro de ti?',
  'La semilla no se preocupa por el fruto. Solo crece. ¿Qué puedes cultivar hoy con paciencia?',
  'Buenos días. A veces el mayor acto de valentía es simplemente estar presente. ¿Estás aquí?',
  'El camino de mil pasos comienza con uno solo. ¿Cuál será tu primer paso hoy?',
  'La montaña no se mueve con el viento. Encuentra tu centro antes de empezar el día.',
  'Cada amanecer te recuerda que siempre hay una nueva oportunidad. ¿Para qué usarás la tuya?',
  'Respira. Estás vivo. Eso ya es suficiente. ¿Qué más necesitas realmente?',
  'El espejo del lago solo refleja cuando está quieto. ¿Puedes encontrar un momento de quietud hoy?',
  'Buenos días. No eres tus pensamientos. Eres quien los observa. ¿Qué observas hoy?',
];

function getTodayMessage(): string {
  // Use day-of-year to rotate through messages deterministically
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return MORNING_MESSAGES[dayOfYear % MORNING_MESSAGES.length];
}

/**
 * Sends morning messages to premium users who were active yesterday.
 * Should be called via a cron job (e.g., Vercel Cron) at 7-8am.
 */
export async function sendMorningMessages(): Promise<{ sent: number; errors: number }> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Get premium users who wrote yesterday (within 24h WhatsApp window)
  const { data: activeUsers } = await supabase
    .from('users')
    .select('user_phone')
    .eq('is_premium', true)
    .eq('last_message_date', yesterdayStr);

  if (!activeUsers || activeUsers.length === 0) {
    return { sent: 0, errors: 0 };
  }

  const message = getTodayMessage();
  let sent = 0;
  let errors = 0;

  for (const user of activeUsers) {
    try {
      await sendWhatsAppMessage(user.user_phone, message);
      sent++;
    } catch (error) {
      console.error(`Failed to send morning message to ${user.user_phone}:`, error);
      errors++;
    }
  }

  return { sent, errors };
}
