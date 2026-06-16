import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { isIndustryInsightStale } from "@/lib/industry-insights";
import { getIndustryInsights } from "@/actions/dashboard";
import { DashboardContent } from "./_components/dashboard-content";
import { EmptyState } from "./_components/empty-state";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { industryInsight: true },
  });

  if (!user) redirect("/sign-in");
  if (!user.industry) redirect("/onboarding");

  let insight = user.industryInsight;

  if (!insight || isIndustryInsightStale(insight)) {
    insight = await getIndustryInsights();
  }

  if (!insight) {
    return { user, insight: null };
  }

  return { user, insight };
}

export default async function DashboardPage() {
  const { user, insight } = await getDashboardData();

  if (!insight) return <EmptyState userName={user.name || user.email} />;

  return (
    <DashboardContent
      userName={user.name || "there"}
      userEmail={user.email}
      currentRole={user.currentRole}
      targetRole={user.targetRole}
      careerGoals={user.careerGoals}
      experience={user.experience}
      skills={user.skills}
      insight={insight}
    />
  );
}
