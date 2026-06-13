"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { buildSecurePrompt, parseAIJson } from "@/lib/prompt-safety";
import { generateGeminiContent } from "@/lib/gemini";

export async function generateAgenda(meetingType, topic, duration) {
  const { userId } = await auth();
  if (!userId) return { success: false, errors: { _form: ["Unauthorized"] } };

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) return { success: false, errors: { _form: ["User not found"] } };

  if (!meetingType || !topic || !duration) {
    return { success: false, errors: { _form: ["All fields are required."] } };
  }

  const prompt = buildSecurePrompt({
    context: "You are an Expert Executive Operations Leader and Facilitator.",
    task: `Analyze the user's meeting type, the core topic/goal, and the allocated duration.
    Generate a highly structured, outcome-driven meeting agenda that prevents time-wasting and positions the user as an organized, effective leader.
    Format the agenda items with time blocks.`,
    untrustedData: [
      { label: "meetingType", value: meetingType, maxLength: 200 },
      { label: "topic", value: topic, maxLength: 500 },
      { label: "duration", value: duration, maxLength: 100 },
    ],
    outputRules: `Provide the output in the following JSON format ONLY:
{
  "meetingObjective": "A sharp, 1-sentence statement of what MUST be decided or accomplished by the end of this meeting.",
  "agendaItems": [
    {
      "timeAllocation": "e.g., 5 mins",
      "topic": "The specific topic to discuss",
      "facilitatorQuestion": "A provocative or guiding question the user should ask to drive this part of the conversation"
    }
  ],
  "preReadSuggestion": "A brief suggestion of what data or context to send to attendees *before* the meeting.",
  "leadershipTip": "One psychology or facilitation trick to handle tangents or quiet attendees during this specific type of meeting."
}`,
  });

  try {
    const aiResult = await generateGeminiContent(prompt);
    const parsedData = parseAIJson(aiResult.response.text());

    const record = await db.meetingAgenda.create({
      data: {
        userId: user.id,
        meetingType,
        topic,
        duration,
        agendaData: parsedData,
      },
    });

    revalidatePath("/meeting-agenda");
    return { success: true, data: record };
  } catch (error) {
    console.error("Meeting Agenda Error:", error);
    return { success: false, errors: { _form: [error.message || "Failed to generate agenda"] } };
  }
}

export async function getMeetingAgendas() {
  const { userId } = await auth();
  if (!userId) return { success: false, data: [] };

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) return { success: false, data: [] };

  const records = await db.meetingAgenda.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return { success: true, data: records };
}
