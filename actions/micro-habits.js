"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateGeminiContent } from "@/lib/gemini";
import { buildSecurePrompt, generateWithStructuredOutput } from "@/lib/prompt-safety";
import { buildUserProfileContext } from "@/lib/ai-context";
import { validateOutput } from "@/lib/validate";
import { microHabitPlanOutputSchema, SCHEMA_DESCRIPTIONS } from "@/lib/schemas/outputs";
import { checkRateLimit, formatResetTime } from "@/lib/rate-limit-actions";

const MICRO_HABIT_SYSTEM_CONTEXT = `You are a productivity expert and career coach who specializes in building sustainable, tiny habits (micro-habits).
Your goal is to help professionals achieve ambitious career goals without burning out, by breaking them down into 2-5 minute daily actions that can be easily integrated into a busy schedule.`;

export async function generateMicroHabitPlan(formData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const limit = await checkRateLimit(userId, "micro_habits");
  if (!limit.allowed) {
    throw new Error(`Micro-habit plan generation limit reached. Resets in ${formatResetTime(limit.resetAt)}.`);
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  const goal = formData.get("goal");
  const timeAvailable = formData.get("timeAvailable");

  const prompt = buildSecurePrompt({
    context: `${buildUserProfileContext(user)}\n\n${MICRO_HABIT_SYSTEM_CONTEXT}`,
    task: `Create a micro-habit plan for the following career goal:
"${goal}"

The user has the following time available daily to dedicate to this: "${timeAvailable}".

Break the goal down into tiny, actionable daily habits (each taking only a few minutes) and provide a strategy for weekly reviews and burnout prevention.

Respond ONLY with a valid JSON object in this exact format:
{
  "goalBreakdown": "Brief explanation of how the goal translates into daily actions",
  "dailyHabits": [
    {
      "habit": "Specific micro-habit",
      "timeEstimate": "e.g., 5 mins",
      "trigger": "When to do it (e.g., After pouring morning coffee)"
    }
  ],
  "weeklyReviews": ["Metric or question to review weekly"],
  "burnoutPrevention": "Actionable advice on maintaining momentum without burnout"
}`,
    untrustedData: [
      { label: "goal", value: goal, maxLength: 500 },
      { label: "timeAvailable", value: timeAvailable, maxLength: 100 },
    ],
  });

  const schemaDescription = SCHEMA_DESCRIPTIONS.microHabitPlan;

  try {
    const result = await generateWithStructuredOutput({
      prompt,
      schemaDescription,
      schema: microHabitPlanOutputSchema,
      generateFn: async (p) => {
        const raw = await generateGeminiContent(p);
        return raw.response.text().trim();
      },
      validateFn: validateOutput,
    });

    if (!result.success) {
      console.error("Micro-habit plan output validation failed:", result.errors);
      throw new Error("AI returned an unexpected format.");
    }

    const plan = await db.microHabitPlan.create({
      data: {
        userId: user.id,
        goal,
        timeAvailable,
        habitData: result.data,
      },
    });

    return plan;
  } catch (error) {
    console.error("Error generating micro-habit plan:", error);
    throw new Error(error?.message || "Failed to generate micro-habit plan.");
  }
}

export async function getMicroHabitPlans() {
  try {
    const { userId } = await auth();
    if (!userId) return { plans: [], error: null };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) return { plans: [], error: null };

    const plans = await db.microHabitPlan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    
    return { plans, error: null };
  } catch (error) {
    console.error("Error fetching micro-habit plans:", error);
    return { 
      plans: [], 
      error: error.message || "Failed to load plans. Please try again." 
    };
  }
}
