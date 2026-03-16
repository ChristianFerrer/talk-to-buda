import OpenAI from 'openai';
import { FEW_SHOT_EXAMPLES } from '@/lib/prompts/buddha-system';

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
function getStyleReinforcement(depth?: 'warm' | 'balanced' | 'deep'): string {
  const brevityRule = depth === 'deep'
    ? 'Máximo 1-2 frases.'
    : 'Máximo 2-3 frases.';

  return `[RECORDATORIO — BUDA]
${brevityRule}
1. Refleja algo ESPECÍFICO de lo que el usuario dijo. Usa sus palabras.
2. Deja un GANCHO: que el usuario quiera responder. Si tu respuesta cierra la conversación, reescribe.
3. Si tu respuesta anterior terminó con pregunta, esta NO debe terminar con pregunta.
4. PROHIBIDO: "¿Y quién decidió...?", "¿Según quién?", frases de coaching, metáforas genéricas.
5. PROHIBIDO consolar: "un abrazo que consuela", "un puente que te conecta", "A veces, [consuelo]". No consueles — haz que descubran.
6. NO repitas metáforas que ya usaste. Imagen NUEVA cada vez.`;
}


export async function generateBudaResponse(
  systemPrompt: string,
  conversationHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  model: 'gpt-4o' | 'gpt-4o-mini' = 'gpt-4o-mini',
  depth?: 'warm' | 'balanced' | 'deep'
): Promise<string> {
  const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  // Inject few-shot examples as real user/assistant messages right after system prompt.
  // This is the most effective way to teach GPT-4o-mini the exact voice and quality we want.
  // The model imitates these patterns much more reliably than it follows abstract rules.
  messages.push(...FEW_SHOT_EXAMPLES);

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
