/**
 * Cached responses for common message patterns.
 * These bypass GPT calls entirely, saving ~30-40% of API costs.
 *
 * Philosophy: Buda is a master. He doesn't chase, he doesn't sell,
 * he doesn't ask eager questions. He is present, simple, available.
 * People come to him — he waits.
 */

const GREETING_RESPONSES = [
  'Hola.',
  'Bienvenido.',
  'Estoy aquí.',
  'Hola. Estoy aquí.',
  'Bienvenido de nuevo.',
];

const THANKS_RESPONSES = [
  'No hay nada que agradecer.',
  'El camino es tuyo.',
  'La gratitud es una forma de claridad.',
  'Agradecer es observar lo bueno.',
];

const FAREWELL_RESPONSES = [
  'Hasta pronto.',
  'Ve con calma.',
  'La puerta estará abierta.',
  'Que la calma te acompañe.',
  'Paz.',
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
