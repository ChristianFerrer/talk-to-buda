/**
 * Cached responses for common message patterns.
 * These bypass GPT calls entirely, saving ~30-40% of API costs.
 */

const GREETING_RESPONSES = [
  'Bienvenido de nuevo. ¿Qué trae tu mente hoy?',
  'Estoy aquí. ¿Qué deseas explorar hoy?',
  'Qué bueno verte. ¿Hay algo que pese en tu corazón?',
  'La calma te espera. ¿Qué deseas compartir?',
  'Estoy presente. Cuéntame, ¿cómo estás?',
];

const THANKS_RESPONSES = [
  'La gratitud es el primer paso hacia la paz interior. ¿Hay algo más que desees reflexionar?',
  'No hay nada que agradecer. El camino es tuyo. ¿Deseas seguir caminando?',
  'Tu gratitud es como el agua que nutre la semilla. Estoy aquí si me necesitas.',
  'Agradecer es observar lo bueno. ¿Qué más has observado hoy?',
  'La gratitud ilumina la mente. ¿Quieres seguir explorando?',
];

const FAREWELL_RESPONSES = [
  'Que encuentres paz en tu camino. Estaré aquí cuando me necesites.',
  'Hasta pronto. Recuerda: la calma siempre está dentro de ti.',
  'Ve con serenidad. La puerta estará abierta cuando quieras volver.',
  'Que la claridad te acompañe. Nos vemos pronto.',
  'Descansa con paz. Mañana será un nuevo amanecer.',
];

const GREETING_PATTERNS = [
  'hola', 'hello', 'hi', 'hey', 'buenos días', 'buenas tardes', 'buenas noches',
  'buen dia', 'buen día', 'buenas', 'qué tal', 'que tal', 'saludos',
  'good morning', 'good evening', 'good night',
];

const THANKS_PATTERNS = [
  'gracias', 'muchas gracias', 'te agradezco', 'thank you', 'thanks',
  'mil gracias', 'agradecido', 'agradecida', 'te lo agradezco',
];

const FAREWELL_PATTERNS = [
  'adiós', 'adios', 'chao', 'chau', 'hasta luego', 'hasta mañana',
  'hasta pronto', 'nos vemos', 'bye', 'goodbye', 'me voy',
];

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function normalize(text: string): string {
  return text.trim().toLowerCase()
    .replace(/[¿?¡!.,;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Returns a cached response if the message matches a common pattern.
 * Returns null if no match — the message should go to GPT.
 */
export function getCachedResponse(text: string): string | null {
  const normalized = normalize(text);

  // Only match short messages (likely pure greetings/thanks, not real questions)
  if (normalized.split(' ').length > 5) return null;

  if (GREETING_PATTERNS.some(p => normalized === p || normalized === `${p} buda`)) {
    return pickRandom(GREETING_RESPONSES);
  }

  if (THANKS_PATTERNS.some(p => normalized === p || normalized.startsWith(p))) {
    return pickRandom(THANKS_RESPONSES);
  }

  if (FAREWELL_PATTERNS.some(p => normalized === p || normalized.startsWith(p))) {
    return pickRandom(FAREWELL_RESPONSES);
  }

  return null;
}
