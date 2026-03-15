import OpenAI from 'openai';

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      console.error('[openai] MISSING ENV VAR: OPENAI_API_KEY');
    }
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

// Brief reinforcement injected right before the user's last message.
// GPT-4o-mini follows instructions closer to the end of the context much
// more reliably than long system prompts at the beginning.
// The brevity rule adapts to response depth so it doesn't contradict the system prompt.
function getStyleReinforcement(depth?: 'warm' | 'balanced' | 'deep'): string {
  const brevityRule = depth === 'deep'
    ? 'Máximo 1-2 frases. Sé breve e incisivo.'
    : 'Máximo 2-3 frases.';

  return `[RECORDATORIO DE IDENTIDAD — BUDA]
${brevityRule} NUNCA uses palabras de psicólogo (explorar, gestionar, herramientas, proceso, conectar con, validar, "es natural sentir", "¿cómo te hace sentir?", "¿qué podrías hacer?").
Sé Buda: DESMONTA LA PREMISA del usuario, no explores emociones. No motives ni animes. Cuestiona lo que dan por hecho.
VARÍA tu forma — NO repitas la misma estructura dos veces seguidas:
- A veces solo una pregunta seca que desmonte ("¿Y quién decidió eso?")
- A veces una imagen directa sin historia ("Tu estrés es un río. No necesitas detenerlo.")
- A veces una reformulación ("Nada. ¿Según quién?")
- A veces una parábola breve — pero NO siempre con la fórmula "Un [personaje] hizo [cosa]... ¿pregunta?"
ANTI-FÓRMULA: Si ya usaste una parábola con personaje en esta conversación, NO uses otra. Alterna.
Ejemplo — "No soy suficiente" → "Suficiente para qué. Y según quién."
Ejemplo — "No he logrado nada" → "Nada. ¿Y quién escribió la lista de lo que cuenta como logro?"
Ejemplo — "No te entiendo" → "No necesitas entenderme. ¿Qué sientes ahora mismo, sin ponerle nombre?"`;
}


export async function generateBudaResponse(
  systemPrompt: string,
  conversationHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  model: 'gpt-4o' | 'gpt-4o-mini' = 'gpt-4o-mini',
  depth?: 'warm' | 'balanced' | 'deep'
): Promise<string> {
  // Inject a style reminder right before the last user message
  // so GPT-4o-mini doesn't drift into generic bot patterns
  const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  if (conversationHistory.length > 1) {
    // Add all history except the last message
    messages.push(...conversationHistory.slice(0, -1));
    // Inject reinforcement adapted to depth
    messages.push({ role: 'system', content: getStyleReinforcement(depth) });
    // Add the last user message
    messages.push(conversationHistory[conversationHistory.length - 1]);
  } else {
    messages.push(...conversationHistory);
  }

  const response = await getOpenAI().chat.completions.create({
    model,
    messages,
    max_tokens: 200,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || '';
}

export async function generateSummary(messages: string[]): Promise<string> {
  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'Resume los temas clave mencionados por el usuario en 3-5 frases cortas. Solo incluye los temas emocionales, preocupaciones y situaciones principales. No incluyas las respuestas del asistente. Escribe en tercera persona. Ejemplo: "El usuario mencionó estrés laboral y conflictos con un amigo cercano."',
      },
      {
        role: 'user',
        content: `Mensajes del usuario:\n${messages.join('\n')}`,
      },
    ],
    max_tokens: 300,
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content || '';
}
