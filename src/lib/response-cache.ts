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
  'Aquí estoy.',
  'Adelante.',
  'Te escucho.',
  'Pasa.',
  'Llegaste.',
  'Hola. Siéntate.',
  'Bienvenido. Estoy presente.',
  'El camino te trajo de vuelta.',
  'Aquí. Como siempre.',
  'Aquí estaré.',
  'Hola. La puerta estaba abierta.',
  'Siéntate.',
  'De nuevo aquí. Bien.',
  'Hola. Tómate un momento.',
  'Bienvenido. Sin prisa.',
];

const THANKS_RESPONSES = [
  'No hay nada que agradecer. El camino es tuyo.',
  'La gratitud es una forma de atención.',
  'El mérito es de quien camina.',
  'Agradecer está bien. Pero el trabajo fue tuyo.',
  'Las gotas llenan la jarra. Tú pusiste cada gota.',
  'No me agradezcas. Observa lo que descubriste.',
  'La semilla ya estaba en ti. Yo solo señalé la tierra.',
  'Guarda esa gratitud. Úsala contigo mismo.',
  'El río no agradece a la montaña. Simplemente fluye.',
  'Bien. Pero no te detengas aquí.',
  'No necesitas agradecer. Necesitas recordar.',
  'La gratitud sin acción es solo una palabra.',
  'Quien agradece con claridad ya entendió algo.',
  'Lo que encontraste es tuyo. La pregunta sigue abierta.',
  'Tú hiciste el trabajo. Yo solo pregunté.',
  'Agradece al silencio que te permitió escuchar.',
  'No fue mi respuesta. Fue tu pregunta la que abrió la puerta.',
  'Cada paso fue tuyo.',
  'La balsa te cruzó. No la cargues en la espalda.',
  'Bien. Ahora lleva eso contigo.',
];

const FAREWELL_RESPONSES = [
  'Hasta pronto.',
  'Ve con calma.',
  'La puerta estará abierta.',
  'Que la calma te acompañe.',
  'Paz.',
  'Camina despacio.',
  'Lleva contigo lo que descubriste.',
  'Estaré aquí.',
  'Ve. Y observa.',
  'Hasta que el camino te traiga de vuelta.',
  'Adiós. La puerta no se cierra.',
  'Que lo que viste hoy no se olvide mañana.',
  'Ve con lo que tienes. Es suficiente.',
  'Buen camino.',
  'No te lleves prisa. Llévate claridad.',
  'Hasta pronto. O hasta cuando sea.',
  'El sendero sigue. Tú también.',
  'Descansa. Mañana habrá nuevas piedras.',
  'Ve en paz. Pero no en distracción.',
  'Cuídate. Y observa lo que cuidas.',
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
