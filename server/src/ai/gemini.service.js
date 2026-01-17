import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeMatching = async ({ job, profile, cvData }) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
You are an AI recruitment assistant.

Job:
Title: ${job.title}
Skills: ${job.skillsRequired?.join(", ")}
Level: ${job.level}
Description: ${job.description}

Candidate:
Skills: ${profile?.skills?.join(", ")}
Experience years: ${profile?.experienceYears}

CV:
${JSON.stringify(cvData, null, 2)}

Return STRICT JSON:
{
  "matchingScore": number (0-100),
  "reason": string
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return JSON.parse(text);
};
