import { createAdminClient } from "@/lib/supabase/admin";

export const PLAN_LIMITS: Record<string, number> = {
  free: 2000,
  starter: 25000,
  pro: 250000,
};

export async function getMonthlyUsage(
  userId: string
): Promise<number> {
  const supabase = createAdminClient();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from("usage_logs")
    .select("rows_processed")
    .eq("user_id", userId)
    .gte("created_at", startOfMonth.toISOString());

  return (data ?? []).reduce((sum, r) => sum + (r.rows_processed ?? 0), 0);
}

export async function checkQuota(
  userId: string,
  plan: string,
  requestedRows: number
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const limit = PLAN_LIMITS[plan.toLowerCase()] ?? PLAN_LIMITS.free;
  const used = await getMonthlyUsage(userId);
  const remaining = Math.max(0, limit - used);
  return { allowed: remaining >= requestedRows, remaining, limit };
}

export async function logUsage(
  userId: string,
  apiKeyId: string | null,
  endpoint: string,
  rowsProcessed: number
): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("usage_logs").insert({
    user_id: userId,
    api_key_id: apiKeyId,
    endpoint,
    rows_processed: rowsProcessed,
  });
}
