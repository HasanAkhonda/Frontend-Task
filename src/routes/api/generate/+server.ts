import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();

  const { fullname, title, company, tags, tone, goal } = body;

  const prompt = `
  You are writing a personalized description.

  Full Name: ${fullname}
  Title: ${title}
  Company: ${company}
  Tags: ${tags}
  Tone: ${tone}
  Goal: ${goal}

  Please generate a short, human-like description based on the above details in the requested tone.
  `;

  try {
    const response = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.COHERE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "command-r-plus", // Free trial supports this
        message: prompt
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(JSON.stringify({ error }), { status: 500 });
    }

    const data = await response.json();

    return new Response(JSON.stringify({ output: data.text || data.message?.content || "No response" }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
