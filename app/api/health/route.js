import { db } from "@/lib/prisma";
import { isAiEnabled } from "@/lib/ai-gating";
import { respondError, ERROR_CODES } from "@/lib/api/error-handler";

export async function GET() {
  const checks = {
    database: false,
    ai: isAiEnabled(),
  };

  try {
    await db.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch {
    checks.database = false;
  }

  const allHealthy = Object.values(checks).every(Boolean);

  if (allHealthy) {
    return Response.json({ status: "ok", checks });
  }

  return Response.json({ status: "degraded", checks }, { status: 503 });
}
