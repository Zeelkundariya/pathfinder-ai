import { getUserByClerkId } from "@/lib/user";

export async function getCurrentUser(userId) {
  return getUserByClerkId(userId);
}