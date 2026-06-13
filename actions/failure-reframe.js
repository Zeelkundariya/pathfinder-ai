"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { buildSecurePrompt, parseAIJson } from "@/lib/prompt-safety";
import { generateGeminiContent } from "@/lib/gemini";

export async function generateFailureReframe(situation, impact, feelings) {
  const { userId } = await auth();
  if (!userId) return { success: false, errors: { _form: ["Unauthorized"] } };

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) return { success: false, errors: { _form: ["User not found"] } };

  if (!situation || !impact || !feelings) {
    return { success: false, errors: { _form: ["All fields are required."] } };
  }

  const prompt = buildSecurePrompt({
    context: "You are an Expert Career Resilience Coach and Interview Strategist.",
    task: `Analyze the user's recent career failure, setback, or mistake.
    Help them process it by validating their feelings, extracting the core learning, and reframing the failure into a strength.
    Finally, format this failure into a powerful 'STAR' (Situation, Task, Action, Result) response they can confidently use in future interviews when asked 'Tell me about a time you failed.'`,
    untrustedData: [
      { label: "situation", value: situation, maxLength: 1000 },
      { label: "impact", value: impact, maxLength: 500 },
      { label: "feelings", value: feelings, maxLength: 500 },
    ],
    outputRules: `Provide the output in the following JSON format ONLY:
{
  "validation": "A short, empathetic statement validating their feelings and normalizing the setback.",
  "coreLearning": "The 1-2 sentence core lesson extracted from this failure.",
  "starStory": {
    "situation": "How to set up the context objectively.",
    "task": "What they were supposed to do.",
    "action": "How they handled the failure/mistake when it happened (ownership and correction).",
    "result": "The positive outcome, changes implemented, or knowledge gained from the experience."
  },
  "interviewTip": "One specific tip on how to deliver this story confidently."
}`,
  });

  try {
    const aiResult = await generateGeminiContent(prompt);
    const parsedData = parseAIJson(aiResult.response.text());

    const record = await db.failureReframe.create({
      data: {
        userId: user.id,
        situation,
        impact,
        feelings,
        reframeData: parsedData,
      },
    });

    revalidatePath("/failure-reframer");
    return { success: true, data: record };
  } catch (error) {
    console.error("Failure Reframe Error:", error);
    return { success: false, errors: { _form: [error.message || "Failed to generate reframe"] } };
  }
}

export async function getFailureReframes() {
  const { userId } = await auth();
  if (!userId) return { success: false, data: [] };

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) return { success: false, data: [] };

  const records = await db.failureReframe.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return { success: true, data: records };
}
