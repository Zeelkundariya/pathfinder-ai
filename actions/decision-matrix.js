"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { buildSecurePrompt, parseAIJson } from "@/lib/prompt-safety";
import { generateGeminiContent } from "@/lib/gemini";

export async function generateDecisionMatrix(optionA, optionB, values) {
  const { userId } = await auth();
  if (!userId) return { success: false, errors: { _form: ["Unauthorized"] } };

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) return { success: false, errors: { _form: ["User not found"] } };

  if (!optionA || !optionB || !values) {
    return { success: false, errors: { _form: ["All fields are required."] } };
  }

  const prompt = buildSecurePrompt({
    context: "You are an Expert Career Strategist.",
    task: `Analyze two career options (Option A and Option B) against the user's stated core values and non-negotiables.
    Objectively evaluate how well each option aligns with their values.
    Generate a weighted decision matrix scoring each option out of 10 for each value.
    Provide a final recommendation based purely on their stated values.`,
    untrustedData: [
      { label: "optionA", value: optionA, maxLength: 500 },
      { label: "optionB", value: optionB, maxLength: 500 },
      { label: "values", value: values, maxLength: 1000 },
    ],
    outputRules: `Provide the output in the following JSON format ONLY:
{
  "matrix": [
    {
      "value": "The specific value (e.g., 'Work-Life Balance')",
      "scoreA": 8,
      "scoreB": 5,
      "reasoning": "Why option A scores higher based on the provided context"
    }
  ],
  "totalScoreA": 24,
  "totalScoreB": 18,
  "recommendation": "A clear, objective recommendation on which option to choose and why.",
  "blindspotWarning": "One thing the user might be overlooking in this decision."
}`,
  });

  try {
    const aiResult = await generateGeminiContent(prompt);
    const parsedData = parseAIJson(aiResult.response.text());

    const record = await db.decisionMatrix.create({
      data: {
        userId: user.id,
        optionA,
        optionB,
        values,
        matrixData: parsedData,
      },
    });

    revalidatePath("/decision-matrix");
    return { success: true, data: record };
  } catch (error) {
    console.error("Decision Matrix Error:", error);
    return { success: false, errors: { _form: [error.message || "Failed to generate matrix"] } };
  }
}

export async function getDecisionMatrices() {
  const { userId } = await auth();
  if (!userId) return { success: false, data: [] };

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) return { success: false, data: [] };

  const records = await db.decisionMatrix.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return { success: true, data: records };
}
