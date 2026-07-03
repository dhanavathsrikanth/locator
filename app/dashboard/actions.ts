"use server";

import { createClient } from "@/lib/supabase/server";
import { createHash, randomBytes } from "crypto";

export async function generateApiKey(label: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const raw = "loc_" + randomBytes(32).toString("hex");
  const keyHash = createHash("sha256").update(raw).digest("hex");

  const { error } = await supabase.from("api_keys").insert({
    user_id: user.id,
    key_hash: keyHash,
    label: label || "Default",
  });

  if (error) throw new Error(error.message);
  return raw;
}

export async function revokeApiKey(keyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("api_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", keyId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
}
