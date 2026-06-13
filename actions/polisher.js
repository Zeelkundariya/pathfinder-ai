"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { buildSecurePrompt, parseAIJson } from "@/lib/prompt-safety";
import { generateGeminiContent } from "@/lib/gemini";

export async function generatePolishedText(rawDraft, context, audience) {
  const { userId } = await auth();
  if (!userId) return { success: false, errors: { _form: ["Unauthorized"] } };

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) return { success: false, errors: { _form: ["User not found"] } };

  if (!rawDraft || !context || !audience) {
    return { success: false, errors: { _form: ["All fields are required."] } };
  }

  const prompt = buildSecurePrompt({
    context: "You are an Expert Executive Communications Coach.",
    task: `Analyze the user's raw, emotional, or unprofessional draft.
    Understand the underlying message and goal they are trying to convey in the provided context.
    Rewrite the draft to be highly professional, diplomatic, and clear, tailored to the target audience.
    Provide the polished version and a short breakdown of the 'diplomacy filters' you applied.`,
    untrustedData: [
      { label: "rawDraft", value: rawDraft, maxLength: 2000 },
      { label: "context", value: context, maxLength: 500 },
      { label: "audience", value: audience, maxLength: 200 },
    ],
    outputRules: `Provide the output in the following JSON format ONLY:
{
  "polishedDraft": "The complete, ready-to-send professional rewrite.",
  "toneShift": "A 1-sentence summary of how the tone was shifted (e.g., 'Shifted from defensive to collaborative').",
  "keyChanges": [
    {
      "original": "A problematic snippet from the raw draft",
      "fixed": "How you rephrased it",
      "reason": "Why it's better to say it this way"
    }
  ]
}`,
  });

  try {
    const aiResult = await generateGeminiContent(prompt);
    const parsedData = parseAIJson(aiResult.response.text());

    const record = await db.professionalPolisher.create({
      data: {
        userId: user.id,
        rawDraft,
        context,
        audience,
        polishedData: parsedData,
      },
    });

    revalidatePath("/professional-polisher");
    return { success: true, data: record };
  } catch (error) {
    console.error("Polisher Error:", error);
    return { success: false, errors: { _form: [error.message || "Failed to polish text"] } };
  }
}

export async function getPolishedTexts() {
  const { userId } = await auth();
  if (!userId) return { success: false, data: [] };

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) return { success: false, data: [] };

  const records = await db.professionalPolisher.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return { success: true, data: records };
}
