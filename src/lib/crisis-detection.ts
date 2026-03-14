const CRISIS_KEYWORDS = [
  'suicid',
  'suicidarme',
  'matarme',
  'morirme',
  'quiero morir',
  'no quiero vivir',
  'acabar con todo',
  'acabar con mi vida',
  'autolesion',
  'autolesionarme',
  'hacerme daño',
  'cortarme',
  'no aguanto más',
  'no puedo más con mi vida',
  'quiero desaparecer',
  'mejor sin mí',
  'no vale la pena vivir',
  'kill myself',
  'want to die',
  'end my life',
  'self harm',
  'suicide',
  'dont want to live',
  "don't want to live",
];

export function isCrisisMessage(message: string): boolean {
  const normalized = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  return CRISIS_KEYWORDS.some((keyword) => {
    const normalizedKeyword = keyword.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return normalized.includes(normalizedKeyword);
  });
}
