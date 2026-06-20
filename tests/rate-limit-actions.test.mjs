import { describe, expect, it, vi, beforeEach } from "vitest";

const actionMocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  upsert: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  db: {
    aiRateLimit: {
      findUnique: actionMocks.findUnique,
      upsert: actionMocks.upsert,
      update: actionMocks.update,
    },
  },
}));

import { checkRateLimit } from "../lib/rate-limit-actions.js";

describe("checkRateLimit - Newly Configured Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const newActions = ["linkedin", "negotiation", "networking", "portfolio", "resumeBuilder"];

  newActions.forEach((action) => {
    it(`allows requests within the limit for action: ${action}`, async () => {
      actionMocks.upsert.mockResolvedValue({ count: 1 });

      const result = await checkRateLimit("user-1", action);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
      expect(actionMocks.upsert).toHaveBeenCalled();
      expect(actionMocks.findUnique).not.toHaveBeenCalled();
    });

    it(`blocks requests exceeding the limit for action: ${action}`, async () => {
      // Set count to a very high number that exceeds any maxRequests limit
      actionMocks.upsert.mockResolvedValue({ count: 50 });
      actionMocks.update.mockResolvedValue({});

      const result = await checkRateLimit("user-1", action);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(actionMocks.upsert).toHaveBeenCalled();
      expect(actionMocks.update).toHaveBeenCalled();
      expect(actionMocks.findUnique).not.toHaveBeenCalled();
    });
  });

  it("throws an error for unknown action keys", async () => {
    await expect(checkRateLimit("user-1", "unknownActionKey")).rejects.toThrow(
      "Unknown rate limit action: unknownActionKey"
    );
  });
});
