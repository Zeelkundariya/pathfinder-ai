"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateGeminiContent } from "@/lib/gemini";
import { cachedGenerateGeminiContent, QUIZ_CACHE_TTL_MS, generateCacheKey } from "@/lib/cache";
import { buildSecurePrompt } from "@/lib/prompt-safety";
import { buildUserProfileContext } from "@/lib/ai-context";
import { validateInput, validateOutput } from "@/lib/validate";
import { quizCategorySchema, quizResultSaveSchema } from "@/lib/schemas/forms";
import { interviewQuestionsOutputSchema } from "@/lib/schemas/outputs";
import { checkRateLimit, formatResetTime } from "@/lib/rate-limit-actions";

/**
 * Generates 10 unique MCQ questions based on user's industry, skills, and quiz category.
 */
export async function generateQuiz(category = "Technical") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const categoryValidation = validateInput(quizCategorySchema, { category });
  if (!categoryValidation.success) return { success: false, errors: categoryValidation.errors };

  const quizLimit = await checkRateLimit(userId, "quiz");
  if (!quizLimit.allowed) {
    throw new Error(`Quiz generation limit reached. Resets in ${formatResetTime(quizLimit.resetAt)}.`);
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      name: true,
      industry: true,
      currentRole: true,
      targetRole: true,
      careerGoals: true,
      experience: true,
      bio: true,
      skills: true,
    },
  });
  if (!user) throw new Error("User not found");

  const profileContext = buildUserProfileContext(user);
  const validatedCategory = categoryValidation.data.category;

  const normalizedSkills = user.skills
    ? Array.from(new Set(user.skills.map((s) => String(s).trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b))
    : [];

  const categoryPrompts = {
    Technical: "Generate 10 technical interview questions focusing on programming concepts, data structures, system design, algorithms, and practical technical knowledge.",
    Behavioral: "Generate 10 behavioral interview questions focusing on teamwork, leadership, conflict resolution, communication, and past experiences. Use scenarios like 'Tell me about a time when...' or 'How would you handle...'",
    Situational: "Generate 10 situational interview questions focusing on hypothetical workplace scenarios — how the candidate would handle specific on-the-job situations, ethical dilemmas, and decision-making.",
    "Industry Knowledge": "Generate 10 industry knowledge interview questions focusing on domain trends, terminology, business context, and role-specific professional awareness.",
  };

  const categoryIntro = categoryPrompts[validatedCategory];

  const prompt = buildSecurePrompt({
    context: `${profileContext}\n\nThe candidate has listed their industry, skills, and a quiz category below.`,
    task: `You are a highly experienced hiring manager and strict quiz generator.

${categoryIntro}

Generate EXACTLY 10 UNIQUE MCQ questions.`,
    untrustedData: [
      { label: "industry", value: user.industry || "software", maxLength: 200 },
      { label: "skills", value: normalizedSkills.join(", ") || "Not specified", maxLength: 1000 },
      { label: "category", value: validatedCategory, maxLength: 200 },
    ],
    outputRules: `RULES:
- Exactly 10 questions only. No repetition.
- Each question must be highly relevant.
- Each question must have 4 FULL, realistic options (do NOT use labels like 'A', 'B', 'C', 'D' at the beginning of options).
- Only ONE correct answer.
- The 'correctAnswer' field MUST exactly match the string text of one of the options.
- Include a helpful, 1-2 sentence 'explanation' for the correct answer.

Return ONLY a valid JSON object matching this schema. Do not output any markdown code fences, headers, or extra text:

{
  "questions": [
    {
      "question": "Descriptive question text?",
      "options": [
        "Option text 1",
        "Option text 2",
        "Option text 3",
        "Option text 4"
      ],
      "correctAnswer": "Option text 3",
      "explanation": "Detailed explanation of why Option 3 is correct."
    }
  ]
}`,
  });

  try {
    const result = await generateGeminiContent(prompt);
    const quizValidation = validateOutput(interviewQuestionsOutputSchema, result.response.text());

    if (!quizValidation.success || !quizValidation.data?.questions?.length) {
      throw new Error("Invalid questions structure received from AI.");
    }

    return quizValidation.data.questions.slice(0, 10);
  } catch (error) {
    console.error("AI Quiz generation failed:", error);
    throw new Error(error?.message || "Failed to generate interview questions. Please check your AI configuration.");
  }
}

/**
 * Saves a quiz result and generates AI-powered feedback if mistakes were made.
 */
export async function saveQuizResult(questions, answers, category = "Technical") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validation = validateInput(quizResultSaveSchema, { questions, answers, category });
  if (!validation.success) return { success: false, errors: validation.errors };

  const feedbackLimit = await checkRateLimit(userId, "quizFeedback");
  if (!feedbackLimit.allowed) {
    throw new Error(`Quiz feedback limit reached. Resets in ${formatResetTime(feedbackLimit.resetAt)}.`);
  }

  const {
    questions: validatedQuestions,
    answers: validatedAnswers,
    category: validatedCategory,
  } = validation.data;

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  // Map user answers to question outcomes and compute score server-side
  const questionResults = [];
  const wrongAnswers = [];
  let correctCount = 0;

  validatedQuestions.forEach((q, index) => {
    if (!q?.question) return;

    const userAnswer = validatedAnswers[index];
    const isCorrect = q.correctAnswer === userAnswer;

    const mappedQuestion = {
      question: q.question.trim(),
      options: q.options,
      correctAnswer: q.correctAnswer,
      userAnswer: userAnswer,
      isCorrect,
      explanation: q.explanation,
    };

    questionResults.push(mappedQuestion);

    if (isCorrect) {
      correctCount++;
    } else {
      wrongAnswers.push(mappedQuestion);
    }
  });

  const computedScore = validatedQuestions.length > 0
    ? Math.round((correctCount / validatedQuestions.length) * 100)
    : 0;

  let improvementTip = null;

  if (wrongAnswers.length > 0) {
    const profileContext = buildUserProfileContext(user);
    const wrongText = wrongAnswers
      .slice(0, 3)
      .map((q) => `Q: ${q.question}\nCorrect answer was: ${q.correctAnswer}\nUser answered: ${q.userAnswer || "No Answer"}`)
      .join("\n\n");

    const tipPrompt = buildSecurePrompt({
      context: profileContext,
      task: "You are a supportive career mentor. The candidate completed a quiz. Provide an encouraging, actionable improvement tip (strictly max 2 sentences) recommending key learning areas. Be positive, warm, and professional. Do not refer to question indexes or speak critically.",
      untrustedData: [
        { label: "industry", value: user.industry || "software", maxLength: 200 },
        { label: "category", value: validatedCategory, maxLength: 200 },
        { label: "score", value: String(computedScore), maxLength: 50 },
        { label: "wrongAnswers", value: wrongText, maxLength: 4000 },
      ],
    });

    try {
      const tipResult = await generateGeminiContent(tipPrompt);
      improvementTip = tipResult.response.text().trim();
    } catch (e) {
      console.error("Failed to generate custom AI improvement tip:", e);
      improvementTip = "Focus on reviewing core programming concepts and regular system design patterns to strengthen your skills.";
    }
  }

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: computedScore,
        questions: questionResults,
        category: validatedCategory,
        improvementTip,
      },
    });

    return assessment;
  } catch (error) {
    console.error("Error saving assessment to database:", error);
    throw new Error("Failed to save quiz results.");
  }
}

/**
 * Fetches all assessments for the signed-in user, newest first.
 */
export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) return [];

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) return [];

  return db.assessment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Fetches a single assessment by ID.
 */
export async function getAssessment(id) {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) return null;

  const assessment = await db.assessment.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  return assessment;
}

/**
 * Evaluates a transcribed voice answer.
 */
export async function evaluateVoiceAnswer(question, transcribedAnswer) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const prompt = `You are an expert interview coach evaluating a spoken answer from a candidate.
Evaluate the transcribed answer based on confidence, filler words, and content quality.

Question: ${question}
Candidate's spoken answer: ${transcribedAnswer}

Provide feedback in JSON format ONLY:
{
  "score": 85,
  "fillerWordsCount": 3,
  "confidence": "High",
  "feedback": "Your answer was very structured, but you used 'um' a few times."
}`;

  try {
    const aiResult = await generateGeminiContent(prompt);
    let rawText = aiResult.response.text();
    if (rawText.startsWith("\`\`\`json")) {
      rawText = rawText.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
    }
    const parsed = JSON.parse(rawText);
    return { success: true, data: parsed };
  } catch (error) {
    console.error("Voice evaluation error:", error);
    return { success: false, error: "Failed to evaluate answer." };
  }
}

/**
 * Evaluates a transcribed video answer along with basic body language metrics.
 */
export async function evaluateVideoAnswer(question, transcribedAnswer, metrics) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const prompt = `You are an expert interview coach evaluating a video interview response.
Evaluate the transcribed answer and the provided facial metrics (e.g., face detected percentage).

Question: ${question}
Candidate's spoken answer: ${transcribedAnswer}
Body Language Metrics: ${JSON.stringify(metrics)}

Provide feedback in JSON format ONLY:
{
  "score": 85,
  "fillerWordsCount": 3,
  "confidence": "High",
  "bodyLanguageFeedback": "You maintained great eye contact and presence.",
  "verbalFeedback": "Your answer was very structured, but you used 'um' a few times."
}`;

  try {
    const aiResult = await generateGeminiContent(prompt);
    let rawText = aiResult.response.text();
    if (rawText.startsWith("\`\`\`json")) {
      rawText = rawText.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
    }
    const parsed = JSON.parse(rawText);
    return { success: true, data: parsed };
  } catch (error) {
    console.error("Video evaluation error:", error);
    return { success: false, error: "Failed to evaluate video answer." };
  }
}