import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Analyze CV – Job matching
 * @returns { matchingScore: number, reason: string }
 */
export const analyzeMatching = async ({ job, profile, cvData }) => {
  const prompt = `
You are an AI recruitment assistant.

Job:
- Title: ${job.title}
- Skills: ${job.skillsRequired?.join(", ")}
- Level: ${job.level}
- Description: ${job.description}

Candidate:
- Skills: ${profile?.skills?.join(", ")}
- Experience Years: ${profile?.experienceYears || 0}

CV Content:
${JSON.stringify(cvData, null, 2)}

Evaluate how well the candidate matches the job.

Return ONLY valid JSON in this format:
{
  "matchingScore": number,
  "reason": string
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      thinkingConfig: {
        thinkingLevel: "MEDIUM",
      },
    },
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  const text = response.text;

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Gemini raw response:", text);
    throw new Error("Invalid AI response format");
  }
};
