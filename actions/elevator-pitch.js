"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { buildSecurePrompt, parseAIJson } from "@/lib/prompt-safety";
import { generateGeminiContent } from "@/lib/gemini";

export async function generatePitch(background, goals, audience) {
  const { userId } = await auth();
  if (!userId) return { success: false, errors: { _form: ["Unauthorized"] } };

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) return { success: false, errors: { _form: ["User not found"] } };

  if (!background || !goals || !audience) {
    return { success: false, errors: { _form: ["All fields are required."] } };
  }

  const prompt = buildSecurePrompt({
    context: "You are an Expert Communication Coach and Executive Storyteller.",
    task: `Analyze the user's background, their future goals, and their target audience.
    Craft a compelling, cohesive 'Elevator Pitch' or 'Career Story' that bridges their past experience to their future goals.
    Ensure the narrative is confident, authentic, and memorable.`,
    untrustedData: [
      { label: "background", value: background, maxLength: 1000 },
      { label: "goals", value: goals, maxLength: 1000 },
      { label: "audience", value: audience, maxLength: 500 },
    ],
    outputRules: `Provide the output in the following JSON format ONLY:
{
  "pitch15s": "A hyper-concise, punchy 15-second intro (1-2 sentences) focusing purely on the hook and value proposition.",
  "pitch30s": "A standard 30-second networking pitch (3-4 sentences) that covers background, unique value, and the 'ask' or goal.",
  "pitch60s": "A comprehensive 60-second interview intro ('Tell me about yourself') that tells a seamless story of their career arc.",
  "storytellingTips": ["A specific tip on delivery based on their audience", "A specific tip on body language or pacing"]
}`,
  });

  try {
    const aiResult = await generateGeminiContent(prompt);
    const parsedData = parseAIJson(aiResult.response.text());

    const record = await db.elevatorPitch.create({
      data: {
        userId: user.id,
        background,
        goals,
        audience,
        pitchData: parsedData,
      },
    });

    revalidatePath("/elevator-pitch");
    return { success: true, data: record };
  } catch (error) {
    console.error("Elevator Pitch Error:", error);
    return { success: false, errors: { _form: [error.message || "Failed to generate pitch"] } };
  }
}

export async function getElevatorPitches() {
  const { userId } = await auth();
  if (!userId) return { success: false, data: [] };

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) return { success: false, data: [] };

  const records = await db.elevatorPitch.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return { success: true, data: records };
}
