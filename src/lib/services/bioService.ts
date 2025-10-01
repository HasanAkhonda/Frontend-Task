// src/lib/services/bioService.ts

import { formatAIContent } from "$lib/utils/aiFormatter";
import type { BioFormData } from "$lib/types/bio";

/**
 * Bio Generation Service
 * Handles API communication with Cohere AI
 */

const COHERE_API_KEY = "LFMqJFwwN3t5H8pzBk7n1EYAdyySC9nYcFuJN0cA";
const COHERE_API_URL = "https://api.cohere.com/v2/chat";

/**
 * Builds the AI prompt from form data
 */
function buildPrompt(data: BioFormData): string {
    return `
You are a professional AI writing assistant.
Generate a detailed, human-like professional bio using the following user info.

Full Name: ${data.fullname}
Title: ${data.title}
Company: ${data.company}
Tags: ${data.tags}
Tone: ${data.tone}
Goal: ${data.goal}

Format:
- A clear and professional Title/Heading with the full name and role.
- Background & Expertise: A detailed overview of the person's technical/professional skills, domain expertise, and areas of focus.
- Approach & Philosophy: Describe how they approach work, design, problem-solving, or teamwork.
- Collaboration & Values: Highlight soft skills, teamwork, and personality traits.
- Goals & Vision: Describe their aspirations, future focus, or professional mission.

Make it natural, inspiring, and easy to read. Avoid generic filler—write with clarity and personality.
`;
}

/**
 * Generates a professional bio using Cohere AI
 * @param data - Form data containing user information
 * @param signal - AbortSignal for cancelling the request
 * @returns Formatted AI-generated bio content
 */
export async function generateBio(
    data: BioFormData,
    signal: AbortSignal
): Promise<string> {
    const prompt = buildPrompt(data);

    const response = await fetch(COHERE_API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${COHERE_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            stream: false,
            model: "command-a-03-2025",
            messages: [{ role: "user", content: prompt }],
        }),
        signal,
    });

    const result = await response.json();
    console.log("AI Response:", result);

    const aiText = result?.message?.content?.[0]?.text ?? "No AI text returned";

    return formatAIContent(aiText);
}