import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log(
  "[AI] Gemini Service Initialized. Key present:",
  !!process.env.GEMINI_API_KEY,
);

// Using stable, verified models
const MODELS = {
  TEXT_FAST: "gemini-2.5-flash", // Stable, fast model
  TEXT_SMART: "gemini-2.5-pro", // Stable, more capable model
};

/**
 * Analyze CV – Job matching (JSON output)
 */
export const analyzeMatching = async ({ job, resumeText }) => {
  const prompt = `
You are an expert AI recruitment assistant specializing in candidate-job matching.

JOB POSTING:
Title: ${job.title}
Company: ${job.company || "N/A"}
Required Skills: ${job.skills?.join(", ") || "Not specified"}
Experience Level: ${job.level || "Not specified"}
Job Description: ${job.description || "No description"}

CANDIDATE RESUME/PROFILE:
${resumeText}

TASK: Analyze how well this candidate matches the job requirements.

SCORING CRITERIA:
1. Skills Match (40%): Compare candidate's skills with required skills
2. Experience Level (25%): Does candidate's experience align with job level?
3. Domain/Industry Fit (20%): Relevant work experience in similar roles/industries
4. Education & Certifications (15%): Relevant qualifications

IMPORTANT RULES:
- Minimum score should be 15-20% if candidate has ANY relevant experience
- Score 30-50% for partial match (some skills, wrong level)
- Score 50-70% for good match (most skills, right level)
- Score 70-90% for excellent match (all skills, perfect level, great experience)
- Score 90-100% ONLY for perfect unicorn candidates
- NEVER return 0% unless resume is completely irrelevant (wrong field entirely)

Return ONLY valid JSON in this exact format:
{
  "matchingScore": <number between 0-100>,
  "reason": "<concise 1-2 sentence explanation focusing on key strengths and gaps>"
}
`;

  try {
    const model = genAI.getGenerativeModel({
      model: MODELS.TEXT_SMART,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3, // Lower temperature for more consistent scoring
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text) throw new Error("Empty AI response");

    try {
      const parsed = JSON.parse(text);
      // Ensure score is within valid range
      if (parsed.matchingScore < 0) parsed.matchingScore = 0;
      if (parsed.matchingScore > 100) parsed.matchingScore = 100;
      return parsed;
    } catch {
      // Fallback simple parsing if JSON mode fails
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.matchingScore < 0) parsed.matchingScore = 0;
        if (parsed.matchingScore > 100) parsed.matchingScore = 100;
        return parsed;
      }
      throw new Error("AI returned invalid JSON");
    }
  } catch (err) {
    console.error("Gemini Analyze Error:", err);
    // Fail gracefully with minimal score instead of 0
    return {
      matchingScore: 25,
      reason: "AI analysis failed - default baseline score assigned",
    };
  }
};

/**
 * Generate CV content (TEXT)
 */
export const generateCVContent = async ({ type, data }) => {
  let prompt = "";

  if (type === "SUMMARY") {
    prompt = `
You are an expert resume writer with 10+ years of experience.

Generate a compelling, ATS-optimized professional summary for a resume.

INPUT DATA:
Role/Title: ${data.role}
Key Skills: ${data.skills}
Years of Experience: ${data.experience}

REQUIREMENTS:
- 3-4 sentences maximum
- Start with years of experience and role
- Highlight 2-3 key technical skills
- Include one soft skill or achievement metric
- Use active voice and power words
- Make it ATS-friendly (avoid fancy formatting)

Return ONLY the summary text, no additional commentary.
`;
  } else if (type === "IMPROVE_EXPERIENCE") {
    prompt = `
You are an expert resume coach specializing in achievement-focused bullet points.

ORIGINAL EXPERIENCE DESCRIPTION:
${data.description}

TASK: Rewrite this using the STAR method (Situation, Task, Action, Result).

REQUIREMENTS:
- Start with strong action verbs (Led, Developed, Optimized, Implemented, etc.)
- Include quantifiable metrics where possible (%, numbers, timeframes)
- Focus on impact and results, not just responsibilities
- Keep each bullet point to 1-2 lines
- Use present tense for current roles, past tense for previous roles

Return ONLY the improved bullet points, one per line, starting with "•".
`;
  } else {
    throw new Error("Invalid generation type");
  }

  try {
    const model = genAI.getGenerativeModel({
      model: MODELS.TEXT_FAST,
      generationConfig: {
        temperature: 0.7, // More creative for writing
        maxOutputTokens: 500,
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text) throw new Error("Empty AI response");

    return { content: text.trim() };
  } catch (err) {
    console.error("Gemini Generate Error:", err);
    throw new Error("Failed to generate content: " + err.message);
  }
};
