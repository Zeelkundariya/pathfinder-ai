import { describe, expect, it, vi, beforeEach } from "vitest";

import { microHabitPlanOutputSchema, SCHEMA_DESCRIPTIONS } from "../lib/schemas/outputs.js";
import { validateOutput } from "../lib/validate.js";
import { buildFormatCorrectionPrompt } from "../lib/prompt-safety.js";

// ── Output Schema Validation ───────────────────────────────────────────────

describe("microHabitPlanOutputSchema", () => {
  it("accepts valid micro habit plan output", () => {
    const raw = JSON.stringify({
      goalBreakdown: "To learn Next.js, we break it down into 5 minute daily reads.",
      dailyHabits: [
        {
          habit: "Read one page of Next.js docs",
          timeEstimate: "5 mins",
          trigger: "While waiting for coffee to brew",
        }
      ],
      weeklyReviews: ["Did I learn something new?"],
      burnoutPrevention: "Don't force it on weekends.",
    });
    const result = validateOutput(microHabitPlanOutputSchema, raw);
    expect(result.success).toBe(true);
    expect(result.data.goalBreakdown).toBeTruthy();
    expect(result.data.dailyHabits).toHaveLength(1);
    expect(result.data.weeklyReviews).toHaveLength(1);
    expect(result.data.burnoutPrevention).toBeTruthy();
  });

  it("strips markdown fences before parsing", () => {
    const raw = "```json\n" + JSON.stringify({
      goalBreakdown: "Valid breakdown.",
      dailyHabits: [
        {
          habit: "Valid habit",
          timeEstimate: "5 mins",
          trigger: "Valid trigger",
        }
      ],
      weeklyReviews: ["Review 1"],
      burnoutPrevention: "Prevention tip.",
    }) + "\n```";
    const result = validateOutput(microHabitPlanOutputSchema, raw);
    expect(result.success).toBe(true);
  });

  it("rejects output missing required fields", () => {
    const raw = JSON.stringify({
      goalBreakdown: "Missing other fields.",
    });
    const result = validateOutput(microHabitPlanOutputSchema, raw);
    expect(result.success).toBe(false);
  });
});

// ── SCHEMA_DESCRIPTIONS ────────────────────────────────────────────────────

describe("SCHEMA_DESCRIPTIONS.microHabitPlan", () => {
  it("buildFormatCorrectionPrompt includes micro habit plan schema description", () => {
    const prompt = buildFormatCorrectionPrompt(
      "Create a micro habit plan.",
      "This is not JSON",
      SCHEMA_DESCRIPTIONS.microHabitPlan
    );
    expect(prompt).toContain("dailyHabits");
    expect(prompt).toContain("burnoutPrevention");
    expect(prompt).toContain("did not match the required JSON format");
  });
});

// ── Server Action ──────────────────────────────────────────────────────────

const actionMocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findUnique: vi.fn(),
  microHabitPlanFindMany: vi.fn(),
  microHabitPlanCreate: vi.fn(),
  generateGeminiContent: vi.fn(),
  checkRateLimit: vi.fn(),
  formatResetTime: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: actionMocks.auth,
}));

vi.mock("@/lib/prisma", () => ({
  db: {
    user: {
      findUnique: actionMocks.findUnique,
    },
    microHabitPlan: {
      findMany: actionMocks.microHabitPlanFindMany,
      create: actionMocks.microHabitPlanCreate,
    },
  },
}));

vi.mock("@/lib/gemini", () => ({
  generateGeminiContent: actionMocks.generateGeminiContent,
}));

vi.mock("@/lib/rate-limit-actions", () => ({
  checkRateLimit: actionMocks.checkRateLimit,
  formatResetTime: actionMocks.formatResetTime,
}));

describe("generateMicroHabitPlan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates a micro habit plan successfully", async () => {
    const { generateMicroHabitPlan } = await import("../actions/micro-habits.js");

    actionMocks.auth.mockResolvedValue({ userId: "user-1" });
    actionMocks.checkRateLimit.mockResolvedValue({ allowed: true });
    actionMocks.findUnique
      .mockResolvedValueOnce({
        id: "db-user-1",
        clerkUserId: "user-1",
        name: "Test User",
      });
    actionMocks.generateGeminiContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify({
          goalBreakdown: "Test breakdown string.",
          dailyHabits: [
            { habit: "Test habit", timeEstimate: "5 mins", trigger: "Test trigger" }
          ],
          weeklyReviews: ["Review 1"],
          burnoutPrevention: "Test prevention.",
        }),
      },
    });
    actionMocks.microHabitPlanCreate.mockResolvedValue({ id: "plan-1" });

    const formData = new FormData();
    formData.append("goal", "Learn Next.js");
    formData.append("timeAvailable", "5 mins");

    const result = await generateMicroHabitPlan(formData);

    expect(actionMocks.auth).toHaveBeenCalled();
    expect(actionMocks.checkRateLimit).toHaveBeenCalledWith("user-1", "micro_habits");
    expect(actionMocks.generateGeminiContent).toHaveBeenCalled();
    expect(actionMocks.microHabitPlanCreate).toHaveBeenCalled();
    expect(result.id).toBe("plan-1");
  });

  it("throws when user is unauthenticated", async () => {
    const { generateMicroHabitPlan } = await import("../actions/micro-habits.js");
    actionMocks.auth.mockResolvedValue({ userId: null });
    await expect(generateMicroHabitPlan(new FormData())).rejects.toThrow("Unauthorized");
  });

  it("throws when rate limit is exceeded", async () => {
    const { generateMicroHabitPlan } = await import("../actions/micro-habits.js");

    actionMocks.auth.mockResolvedValue({ userId: "user-1" });
    actionMocks.checkRateLimit.mockResolvedValue({ allowed: false, resetAt: new Date(Date.now() + 3600000) });
    actionMocks.formatResetTime.mockReturnValue("60 minutes");

    await expect(generateMicroHabitPlan(new FormData())).rejects.toThrow("Micro-habit plan generation limit reached");
  });
});

describe("getMicroHabitPlans", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns plans when user is authenticated and has them", async () => {
    const { getMicroHabitPlans } = await import("../actions/micro-habits.js");

    actionMocks.auth.mockResolvedValue({ userId: "user-1" });
    actionMocks.findUnique.mockResolvedValue({ id: "db-user-1", clerkUserId: "user-1" });
    actionMocks.microHabitPlanFindMany.mockResolvedValue([
      { id: "plan-1", goal: "Learn Next.js" },
    ]);

    const result = await getMicroHabitPlans();

    expect(actionMocks.auth).toHaveBeenCalled();
    expect(actionMocks.findUnique).toHaveBeenCalled();
    expect(actionMocks.microHabitPlanFindMany).toHaveBeenCalledWith({
      where: { userId: "db-user-1" },
      orderBy: { createdAt: "desc" },
    });
    expect(result.plans).toHaveLength(1);
    expect(result.plans[0].id).toBe("plan-1");
    expect(result.error).toBeNull();
  });

  it("returns empty array when user is not authenticated", async () => {
    const { getMicroHabitPlans } = await import("../actions/micro-habits.js");

    actionMocks.auth.mockResolvedValue({ userId: null });

    const result = await getMicroHabitPlans();
    expect(result).toEqual({ plans: [], error: null });
  });
});
