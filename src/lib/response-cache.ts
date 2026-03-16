/**
 * Cached responses for common message patterns.
 * These bypass GPT calls entirely, saving ~30-40% of API costs.
 *
 * Philosophy: Buda is a master. He doesn't chase, he doesn't sell,
 * he doesn't ask eager questions. He is present, simple, available.
 * People come to him — he waits.
 */

const GREETING_RESPONSES = [
  'Hola. Me alegra que estés aquí.',
  'Estoy aquí. ¿Qué traes hoy?',
  'Hola. La puerta siempre está abierta para ti.',
  'Aquí estoy. Con calma, como siempre.',
  'Bienvenido. Tómate tu tiempo.',
  'Hola. Siéntate un momento.',
  'Aquí estoy. Sin prisa.',
  'Hola. Este es tu espacio.',
  'Qué bueno verte. Estoy aquí.',
  'Hola. La calma te esperaba.',
  'Bienvenido de nuevo. Adelante.',
];

const THANKS_RESPONSES = [
  'No hay nada que agradecer. El trabajo fue tuyo.',
  'La semilla ya estaba en ti. Yo solo señalé la tierra.',
  'Guarda esa gratitud. Úsala contigo mismo mañana.',
  'Lo que encontraste hoy es tuyo. Vuelve cuando quieras.',
  'Tú hiciste el trabajo. Yo solo pregunté.',
  'No fue mi respuesta. Fue tu pregunta la que abrió la puerta.',
  'Cada paso fue tuyo. Aquí estaré si necesitas otro.',
  'Me alegra que te haya servido. Vuelve cuando quieras.',
  'La balsa te cruzó. No la cargues en la espalda.',
  'Bien. Lleva eso contigo. Y si mañana pesa algo nuevo, aquí estoy.',
];

const FAREWELL_RESPONSES = [
  'Hasta pronto. La puerta no se cierra.',
  'Ve con calma. Aquí estaré.',
  'Que lo que viste hoy no se olvide mañana.',
  'Buen camino. Vuelve cuando necesites.',
  'Ve con lo que tienes. Es suficiente por hoy.',
  'Hasta pronto. Si mañana pesa algo, escríbeme.',
  'Descansa. Mañana habrá nuevas preguntas.',
  'Cuídate. Estaré aquí cuando vuelvas.',
  'Lleva contigo lo que descubriste. Y si se pierde, lo buscamos juntos.',
  'Paz. Y cuando la pierdas, ya sabes dónde encontrarme.',
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
