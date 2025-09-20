// src/routes/api/generate/+server.ts
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private'; // runtime safe

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { fullname, title, company, tags, tone, goal } = body;

  const prompt = `
You are an AI assistant writing a short personalized bio.
Full Name: ${fullname}
Title/Role: ${title}
Company/Organization: ${company}
Expertise/Tags: ${tags}
Tone/Style: ${tone}
Goal: ${goal}

Generate 1-2 paragraphs in a human-like style.
`;

  try {
    const response = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.COHERE_API_KEY}`, // safe at runtime
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'command-r-plus',
        message: prompt
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: errorText }), { status: 500 });
    }

    const data = await response.json();
    const outputText = data.output?.[0]?.content || data.text || 'No response';

    return new Response(JSON.stringify({ output: outputText }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
