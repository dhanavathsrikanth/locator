import { createClient as createServerClient } from "./server";
import { createClient as createBrowserClient } from "./client";

export async function getCurrentUser() {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
}

export async function getUserProfile(userId: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return data;
}

export async function upsertProfile(
  userId: string,
  profile: { full_name?: string; avatar_url?: string },
) {
  const supabase = await createServerClient();
  const { data, error } = await supabase.from("profiles").upsert({
    id: userId,
    ...profile,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
  return data;
}

export async function uploadFile(
  bucket: string,
  path: string,
  file: File,
  upsert = false,
) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert });

  if (error) throw error;
  return data;
}

export async function uploadFileFromServer(
  bucket: string,
  path: string,
  file: ArrayBuffer,
  contentType: string,
) {
  const supabase = await createServerClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType });

  if (error) throw error;
  return data;
}

export function getPublicUrl(bucket: string, path: string) {
  const supabase = createBrowserClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(bucket: string, paths: string[]) {
  const supabase = await createServerClient();
  const { data, error } = await supabase.storage.from(bucket).remove(paths);

  if (error) throw error;
  return data;
}

export async function listFiles(bucket: string, folder: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase.storage.from(bucket).list(folder);

  if (error) throw error;
  return data;
}
