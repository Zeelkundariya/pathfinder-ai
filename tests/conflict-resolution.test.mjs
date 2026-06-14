import { describe, expect, it, vi, beforeEach } from "vitest";

import { conflictResolutionOutputSchema, SCHEMA_DESCRIPTIONS } from "../lib/schemas/outputs.js";
import { validateOutput } from "../lib/validate.js";
import { buildFormatCorrectionPrompt } from "../lib/prompt-safety.js";

// ── Output Schema Validation ───────────────────────────────────────────────

describe("conflictResolutionOutputSchema", () => {
  it("accepts valid conflict resolution output", () => {
    const raw = JSON.stringify({
      analysis: "The core issue is a misalignment on project priorities.",
      talkingPoints: ["I want to understand your perspective.", "Let's align on the goal."],
      script: "Hey, I wanted to chat about the recent project direction...",
      deEscalationTips: ["Take a deep breath if interrupted.", "Acknowledge their feelings."],
    });
    const result = validateOutput(conflictResolutionOutputSchema, raw);
    expect(result.success).toBe(true);
    expect(result.data.analysis).toBeTruthy();
    expect(result.data.talkingPoints).toHaveLength(2);
    expect(result.data.script).toBeTruthy();
    expect(result.data.deEscalationTips).toHaveLength(2);
  });

  it("strips markdown fences before parsing", () => {
    const raw = "```json\n" + JSON.stringify({
      analysis: "Valid analysis.",
      talkingPoints: ["Point 1"],
      script: "Valid script.",
      deEscalationTips: ["Tip 1"],
    }) + "\n```";
    const result = validateOutput(conflictResolutionOutputSchema, raw);
    expect(result.success).toBe(true);
  });

  it("rejects output missing required fields", () => {
    const raw = JSON.stringify({
      analysis: "Missing other fields.",
    });
    const result = validateOutput(conflictResolutionOutputSchema, raw);
    expect(result.success).toBe(false);
  });
});

// ── SCHEMA_DESCRIPTIONS ────────────────────────────────────────────────────

describe("SCHEMA_DESCRIPTIONS.conflictResolution", () => {
  it("buildFormatCorrectionPrompt includes conflict resolution schema description", () => {
    const prompt = buildFormatCorrectionPrompt(
      "Create a conflict resolution.",
      "This is not JSON",
      SCHEMA_DESCRIPTIONS.conflictResolution
    );
    expect(prompt).toContain("talkingPoints");
    expect(prompt).toContain("deEscalationTips");
    expect(prompt).toContain("did not match the required JSON format");
  });
});

// ── Server Action ──────────────────────────────────────────────────────────

const actionMocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findUnique: vi.fn(),
  conflictResolutionFindMany: vi.fn(),
  conflictResolutionCreate: vi.fn(),
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
    conflictResolution: {
      findMany: actionMocks.conflictResolutionFindMany,
      create: actionMocks.conflictResolutionCreate,
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

describe("generateConflictResolution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates a conflict resolution successfully", async () => {
    const { generateConflictResolution } = await import("../actions/conflict-resolution.js");

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
          analysis: "Test analysis string.",
          talkingPoints: ["Point 1", "Point 2"],
          script: "Test script string.",
          deEscalationTips: ["Tip 1", "Tip 2"],
        }),
      },
    });
    actionMocks.conflictResolutionCreate.mockResolvedValue({ id: "res-1" });

    const formData = new FormData();
    formData.append("conflictType", "Performance");
    formData.append("otherParty", "Manager");
    formData.append("situation", "My manager said I'm underperforming.");

    const result = await generateConflictResolution(formData);

    expect(actionMocks.auth).toHaveBeenCalled();
    expect(actionMocks.checkRateLimit).toHaveBeenCalledWith("user-1", "conflict_resolution");
    expect(actionMocks.generateGeminiContent).toHaveBeenCalled();
    expect(actionMocks.conflictResolutionCreate).toHaveBeenCalled();
    expect(result.id).toBe("res-1");
  });

  it("throws when user is unauthenticated", async () => {
    const { generateConflictResolution } = await import("../actions/conflict-resolution.js");
    actionMocks.auth.mockResolvedValue({ userId: null });
    await expect(generateConflictResolution(new FormData())).rejects.toThrow("Unauthorized");
  });

  it("throws when rate limit is exceeded", async () => {
    const { generateConflictResolution } = await import("../actions/conflict-resolution.js");

    actionMocks.auth.mockResolvedValue({ userId: "user-1" });
    actionMocks.checkRateLimit.mockResolvedValue({ allowed: false, resetAt: new Date(Date.now() + 3600000) });
    actionMocks.formatResetTime.mockReturnValue("60 minutes");

    await expect(generateConflictResolution(new FormData())).rejects.toThrow("Conflict resolution generation limit reached");
  });
});

describe("getConflictResolutions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns resolutions when user is authenticated and has them", async () => {
    const { getConflictResolutions } = await import("../actions/conflict-resolution.js");

    actionMocks.auth.mockResolvedValue({ userId: "user-1" });
    actionMocks.findUnique.mockResolvedValue({ id: "db-user-1", clerkUserId: "user-1" });
    actionMocks.conflictResolutionFindMany.mockResolvedValue([
      { id: "res-1", conflictType: "Performance" },
    ]);

    const result = await getConflictResolutions();

    expect(actionMocks.auth).toHaveBeenCalled();
    expect(actionMocks.findUnique).toHaveBeenCalled();
    expect(actionMocks.conflictResolutionFindMany).toHaveBeenCalledWith({
      where: { userId: "db-user-1" },
      orderBy: { createdAt: "desc" },
    });
    expect(result.resolutions).toHaveLength(1);
    expect(result.resolutions[0].id).toBe("res-1");
    expect(result.error).toBeNull();
  });

  it("returns empty array when user is not authenticated", async () => {
    const { getConflictResolutions } = await import("../actions/conflict-resolution.js");

    actionMocks.auth.mockResolvedValue({ userId: null });

    const result = await getConflictResolutions();
    expect(result).toEqual({ resolutions: [], error: null });
  });
});
