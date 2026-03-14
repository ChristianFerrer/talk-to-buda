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

export async function generateBudaResponse(
  systemPrompt: string,
  conversationHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  model: 'gpt-4o' | 'gpt-4o-mini' = 'gpt-4o-mini'
): Promise<string> {
  const response = await getOpenAI().chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
    ],
    max_tokens: 500,
    temperature: 0.8,
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
