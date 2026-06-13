"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { buildSecurePrompt, parseAIJson } from "@/lib/prompt-safety";
import { generateGeminiContent } from "@/lib/gemini";

export async function generateSkillGap(currentRole, dreamRole, currentSkills) {
  const { userId } = await auth();
  if (!userId) return { success: false, errors: { _form: ["Unauthorized"] } };

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) return { success: false, errors: { _form: ["User not found"] } };

  if (!currentRole || !dreamRole || !currentSkills) {
    return { success: false, errors: { _form: ["All fields are required."] } };
  }

  const prompt = buildSecurePrompt({
    context: "You are an Expert Career Coach and Technical Learning Advisor.",
    task: `Analyze the user's current role and their stated 'dream role'. 
    Cross-reference this with their current skills. 
    Generate a detailed Skill Gap Analysis that identifies missing hard and soft skills.
    Provide a step-by-step learning path and suggest 2 specific portfolio projects they can build to bridge the gap.`,
    untrustedData: [
      { label: "currentRole", value: currentRole, maxLength: 200 },
      { label: "dreamRole", value: dreamRole, maxLength: 200 },
      { label: "currentSkills", value: currentSkills, maxLength: 1000 },
    ],
    outputRules: `Provide the output in the following JSON format ONLY:
{
  "gapSummary": "A concise 2-sentence summary of the main leap they need to make.",
  "missingHardSkills": ["Skill 1", "Skill 2"],
  "missingSoftSkills": ["Skill 1", "Skill 2"],
  "learningPath": [
    {
      "step": 1,
      "focus": "What to learn first",
      "actionableAdvice": "Specific course type or resource to look for"
    }
  ],
  "portfolioProjects": [
    {
      "title": "Project Name",
      "description": "Why this proves they have the missing skills"
    }
  ]
}`,
  });

  try {
    const aiResult = await generateGeminiContent(prompt);
    const parsedData = parseAIJson(aiResult.response.text());

    const record = await db.skillGapAnalysis.create({
      data: {
        userId: user.id,
        currentRole,
        dreamRole,
        currentSkills,
        analysisData: parsedData,
      },
    });

    revalidatePath("/skill-gap");
    return { success: true, data: record };
  } catch (error) {
    console.error("Skill Gap Error:", error);
    return { success: false, errors: { _form: [error.message || "Failed to generate analysis"] } };
  }
}

export async function getSkillGaps() {
  const { userId } = await auth();
  if (!userId) return { success: false, data: [] };

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) return { success: false, data: [] };

  const records = await db.skillGapAnalysis.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return { success: true, data: records };
}
