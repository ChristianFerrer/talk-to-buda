/**
 * "Sabiduría Escasa" (Scarcity of Wisdom)
 *
 * Makes Buda feel like a real master, not a chatbot:
 * - Variable delays before responding (2-4s)
 * - Occasional split responses (prelude + main response)
 * - Reflective pauses ("Reflexiona... escríbeme cuando estés listo")
 * - Progressive depth: warm with new users, deeper with experienced ones
 */

// --- Delay ---

/**
 * Returns a random delay in ms between min and max seconds.
 * Creates the perception that Buda is "thinking" before responding.
 */
export function getResponseDelay(totalMessages: number): number {
  // New users (< 5 msgs): shorter delay (1-2s) — don't frustrate them
  if (totalMessages < 5) {
    return randomBetween(1000, 2000);
  }
  // Regular users: 2-4s feels like thoughtful consideration
  return randomBetween(2000, 4000);
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Split responses ---

const PRELUDE_MESSAGES = [
  'Hmm.',
  'Mmm…',
  '...',
  'Ah.',
];

/**
 * Decides if the response should be split into a prelude + main message.
 * Only for experienced users, and not too frequently (~20% of the time).
 */
export function shouldSplitResponse(totalMessages: number): boolean {
  // Never for new users (first 10 messages)
  if (totalMessages < 10) return false;
  // ~20% chance for experienced users
  return Math.random() < 0.20;
}

export function getPreludeMessage(): string {
  return PRELUDE_MESSAGES[Math.floor(Math.random() * PRELUDE_MESSAGES.length)];
}

/** Delay between prelude and main message (2-3s) */
export function getSplitDelay(): number {
  return randomBetween(2000, 3000);
}

// --- Reflective pauses ---

const PAUSE_MESSAGES = [
  'No todo necesita respuesta inmediata.',
  'A veces el silencio dice más que cualquier palabra.',
  'La prisa es la primera ilusión.',
];

/**
 * Decides if Buda should pause the conversation instead of responding directly.
 * This reduces messages, increases perceived depth, and feels very human.
 * Only for experienced users, ~8% of the time (roughly 1 in 12 messages).
 */
export function shouldPauseConversation(totalMessages: number): boolean {
  // Never for new users (first 15 messages)
  if (totalMessages < 15) return false;
  // ~8% chance
  return Math.random() < 0.08;
}

export function getPauseMessage(): string {
  return PAUSE_MESSAGES[Math.floor(Math.random() * PAUSE_MESSAGES.length)];
}

// --- Response depth ---

export type ResponseDepth = 'warm' | 'balanced' | 'deep';

/**
 * Determines how Buda should respond based on the user's history.
 * Progressive depth: warm → balanced → deep.
 */
export function getResponseDepth(totalMessages: number): ResponseDepth {
  if (totalMessages < 5) return 'warm';
  if (totalMessages < 30) return 'balanced';
  return 'deep';
}

/**
 * Returns additional prompt instructions based on response depth.
 */
export function getDepthInstruction(depth: ResponseDepth): string {
  switch (depth) {
    case 'warm':
      return `## Profundidad: CÁLIDA (usuario nuevo)
Sé claro, accesible y cálido. Usa metáforas concretas. Reconoce lo que dice.
El gancho puede ser una pregunta simple y personal. Máximo 2-3 frases.`;

    case 'balanced':
      return `## Profundidad: EQUILIBRADA (usuario recurrente)
Varía tu estilo: si antes preguntaste, ahora enseña. Si antes enseñaste, ahora observa.
Sorprende. No seas predecible. Máximo 2 frases.`;

    case 'deep':
      return `## Profundidad: PROFUNDA (usuario experimentado)
Sé breve, incisivo. Una frase cortante, una paradoja, una observación seca.
Pocas preguntas. Cuando preguntes, que duela de lo precisa. Máximo 1-2 frases.`;
  }
}

// --- Utility ---

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
