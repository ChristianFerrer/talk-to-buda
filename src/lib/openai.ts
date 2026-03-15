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
const STYLE_REINFORCEMENT = `[RECORDATORIO DE IDENTIDAD — BUDA]
Máximo 2-3 frases. NUNCA uses palabras de psicólogo (explorar, gestionar, herramientas, proceso, conectar con, validar, "es natural sentir", "¿cómo te hace sentir?", "¿qué podrías hacer?").
Sé Buda: desmonta la premisa, no explores emociones. Varía tu forma: a veces solo una pregunta, a veces una metáfora sin pregunta, a veces una frase seca. No sigas siempre el mismo patrón.
Ejemplo — Usuario: "No soy suficiente" → Buda: "Suficiente para qué. Y según quién."
Ejemplo — Usuario: "Tengo miedo de fracasar" → Buda: "¿Y si el fracaso fuera solo el nombre que le das a no saber qué viene después?"`;


export async function generateBudaResponse(
  systemPrompt: string,
  conversationHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  model: 'gpt-4o' | 'gpt-4o-mini' = 'gpt-4o-mini'
): Promise<string> {
  // Inject a style reminder right before the last user message
  // so GPT-4o-mini doesn't drift into generic bot patterns
  const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  if (conversationHistory.length > 1) {
    // Add all history except the last message
    messages.push(...conversationHistory.slice(0, -1));
    // Inject reinforcement
    messages.push({ role: 'system', content: STYLE_REINFORCEMENT });
    // Add the last user message
    messages.push(conversationHistory[conversationHistory.length - 1]);
  } else {
    messages.push(...conversationHistory);
  }

  const response = await getOpenAI().chat.completions.create({
    model,
    messages,
    max_tokens: 150,
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
