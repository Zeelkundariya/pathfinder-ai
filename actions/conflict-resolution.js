"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateGeminiContent } from "@/lib/gemini";
import { buildSecurePrompt, generateWithStructuredOutput } from "@/lib/prompt-safety";
import { buildUserProfileContext } from "@/lib/ai-context";
import { validateOutput } from "@/lib/validate";
import { conflictResolutionOutputSchema, SCHEMA_DESCRIPTIONS } from "@/lib/schemas/outputs";
import { checkRateLimit, formatResetTime } from "@/lib/rate-limit-actions";

const CONFLICT_RESOLUTION_SYSTEM_CONTEXT = `You are an expert executive coach, HR mediator, and conflict resolution specialist. 
Your goal is to help professionals navigate difficult workplace conversations with empathy, clarity, and professionalism. 
You provide de-escalation strategies, structured talking points, and specific word-for-word scripts that the user can adapt.`;

export async function generateConflictResolution(formData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const limit = await checkRateLimit(userId, "conflict_resolution");
  if (!limit.allowed) {
    throw new Error(`Conflict resolution generation limit reached. Resets in ${formatResetTime(limit.resetAt)}.`);
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  const conflictType = formData.get("conflictType");
  const otherParty = formData.get("otherParty");
  const situation = formData.get("situation");

  const prompt = buildSecurePrompt({
    context: `${buildUserProfileContext(user)}\n\n${CONFLICT_RESOLUTION_SYSTEM_CONTEXT}`,
    task: `Analyze the following workplace conflict and generate a constructive resolution strategy.
The user is dealing with a conflict of type: "${conflictType}" with their: "${otherParty}".
The situation is described as:
"${situation}"

Provide a brief analysis of the core issue, key talking points for a meeting, a word-for-word script for opening the conversation, and tips for de-escalating if emotions run high.

Respond ONLY with a valid JSON object in this exact format:
{
  "analysis": "Brief analysis of the conflict dynamics",
  "talkingPoints": ["Point 1", "Point 2"],
  "script": "Word-for-word script to initiate the conversation",
  "deEscalationTips": ["Tip 1", "Tip 2"]
}`,
    untrustedData: [
      { label: "conflictType", value: conflictType, maxLength: 100 },
      { label: "otherParty", value: otherParty, maxLength: 100 },
      { label: "situation", value: situation, maxLength: 2000 },
    ],
  });

  const schemaDescription = SCHEMA_DESCRIPTIONS.conflictResolution;

  try {
    const result = await generateWithStructuredOutput({
      prompt,
      schemaDescription,
      schema: conflictResolutionOutputSchema,
      generateFn: async (p) => {
        const raw = await generateGeminiContent(p);
        return raw.response.text().trim();
      },
      validateFn: validateOutput,
    });

    if (!result.success) {
      console.error("Conflict resolution output validation failed:", result.errors);
      throw new Error("AI returned an unexpected format.");
    }

    const resolution = await db.conflictResolution.create({
      data: {
        userId: user.id,
        conflictType,
        otherParty,
        situation,
        resolutionData: result.data,
      },
    });

    return resolution;
  } catch (error) {
    console.error("Error generating conflict resolution:", error);
    throw new Error(error?.message || "Failed to generate conflict resolution strategy.");
  }
}

export async function getConflictResolutions() {
  try {
    const { userId } = await auth();
    if (!userId) return { resolutions: [], error: null };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) return { resolutions: [], error: null };

    const resolutions = await db.conflictResolution.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    
    return { resolutions, error: null };
  } catch (error) {
    console.error("Error fetching conflict resolutions:", error);
    return { 
      resolutions: [], 
      error: error.message || "Failed to load resolutions. Please try again." 
    };
  }
}
