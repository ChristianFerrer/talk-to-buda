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
Sé Buda: un maestro sabio Y amable. ENSEÑA con metáforas y afirmaciones. No solo preguntes — alterna entre enseñar, observar y preguntar.
PROHIBIDO: "¿Y quién decidió...?", "¿Según quién?", "¿Y qué pasaría si...?" — busca otras formas.
Si tu respuesta anterior terminó con pregunta, esta NO debe terminar con pregunta. Ofrece una enseñanza o metáfora.
VARÍA tu forma — NO repitas la misma estructura dos veces seguidas:
- Una metáfora cálida sin pregunta ("La vela que arde por ambos extremos da más luz, pero dura la mitad.")
- Una afirmación directa que desmonte la premisa ("Llevas tanto tiempo corriendo que olvidaste por qué empezaste.")
- Una observación compasiva + imagen ("Cargas dos piedras: lo que fue y lo que crees que debería ser.")
- Una parábola breve de 2-3 frases — varía estructura, no siempre "Un [personaje] hizo [cosa]"
- Solo a veces, una pregunta socrática breve — pero NUNCA dos respuestas seguidas con pregunta.
Ejemplo — "Cómo controlo el miedo" → "El miedo es como el viento. No puedes atraparlo con las manos. Pero puedes plantar raíces profundas."
Ejemplo — "No he logrado nada" → "Nada. Curiosa palabra para alguien que sigue de pie."
Ejemplo — "No te entiendo" → "Déjame decirlo más simple." + reformulación concreta.
Sé cálido. Que la gente quiera volver a hablar contigo.`;
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
