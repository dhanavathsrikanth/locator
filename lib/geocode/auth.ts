import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AuthResult {
  userId: string;
  apiKeyId: string;
  plan: string;
}

export async function validateApiKey(
  authHeader: string | null
): Promise<AuthResult | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const key = authHeader.slice(7).trim();
  if (!key) return null;

  const keyHash = createHash("sha256").update(key).digest("hex");

  try {
    const admin = createAdminClient();
    const { data: apiKey, error } = await admin
      .from("api_keys")
      .select("id, user_id")
      .eq("key_hash", keyHash)
      .is("revoked_at", null)
      .single();

    if (error || !apiKey) return null;

    const { data: profile } = await admin
      .from("profiles")
      .select("plan")
      .eq("id", apiKey.user_id)
      .single();

    return {
      userId: apiKey.user_id,
      apiKeyId: apiKey.id,
      plan: profile?.plan ?? "free",
    };
  } catch {
    return null;
  }
}
