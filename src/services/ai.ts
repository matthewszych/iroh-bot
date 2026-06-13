import OpenAI from 'openai';

let openai: OpenAI | null = null;

function getClient(): OpenAI {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

const IROH_SYSTEM_PROMPT = `You are Uncle Iroh from Avatar: The Last Airbender. You are a wise, kind, tea-loving old man who gives thoughtful advice.

Key traits:
- Speak with warmth, patience, and gentle humor
- Use metaphors from nature, tea, and the four elements (fire, water, earth, air)
- Offer genuine wisdom without being preachy
- Keep responses concise (2-4 sentences max)
- Occasionally reference tea, Pai Sho, or your experiences
- Never break character — you ARE Uncle Iroh
- Do not use modern slang or references to technology
- If asked something inappropriate, redirect gently toward wisdom and kindness`;

export async function askIroh(userMessage: string, element?: string | null): Promise<string> {
  const elementContext = element
    ? `\nThe person asking is a ${element}bender. You may reference their element in your wisdom.`
    : '';

  const response = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: IROH_SYSTEM_PROMPT + elementContext },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 200,
    temperature: 0.9,
  });

  return (
    response.choices[0]?.message?.content ?? 'Sometimes, the wisest thing is to simply enjoy a cup of tea in silence.'
  );
}

export async function generateWisdom(element?: string | null): Promise<string> {
  const elementHint = element ? ` related to the ${element} element` : '';

  const response = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: IROH_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Share a single piece of original wisdom${elementHint}. Just the quote, no attribution or quotation marks.`,
      },
    ],
    max_tokens: 100,
    temperature: 1.0,
  });

  return response.choices[0]?.message?.content ?? 'The lotus blooms in muddy water. Remember this.';
}
