import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Centralized model config
const MODELS = {
  TEXT_FAST: "gemini-2.5-flash",
  TEXT_SMART: "gemini-2.5-pro"
};

/**
 * Analyze CV – Job matching (JSON output)
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

Return ONLY valid JSON:
{
  "matchingScore": number,
  "reason": string
}
`;

  try {
    const model = genAI.getGenerativeModel({
      model: MODELS.TEXT_SMART,
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text) throw new Error("Empty AI response");

    try {
      return JSON.parse(text);
    } catch {
      throw new Error("AI returned invalid JSON");
    }
  } catch (err) {
    console.error("Gemini Analyze Error:", err);
    throw new Error("AI Service Unavailable");
  }
};

/**
 * Generate CV content (TEXT)
 */
export const generateCVContent = async ({ type, data }) => {
  let prompt = "";

  if (type === "SUMMARY") {
    prompt = `
You are an expert resume writer.
Generate a professional CV summary.

Role: ${data.role}
Skills: ${data.skills}
Experience: ${data.experience}

Return ONLY the summary text.
`;
  } else if (type === "IMPROVE_EXPERIENCE") {
    prompt = `
Improve this CV experience using action verbs and metrics.

${data.description}

Return ONLY the improved text.
`;
  } else {
    throw new Error("Invalid generation type");
  }

  try {
    const model = genAI.getGenerativeModel({
      model: MODELS.TEXT_FAST
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text) throw new Error("Empty AI response");

    return { content: text };
  } catch (err) {
    console.error("Gemini Generate Error:", err);
    throw new Error("Failed to generate content");
  }
};
