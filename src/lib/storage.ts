"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function uploadMenuImage(fileBase64: string, fileName: string, contentType: string): Promise<string> {
  const auth = await createClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
  if (typeof fileBase64 !== "string" || typeof fileName !== "string" || !allowedTypes.has(contentType)) {
    throw new Error("Invalid upload");
  }

  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 150);
  if (!safeFileName) throw new Error("Invalid file name");

  const supabase = createAdminClient();
  const buf = Buffer.from(fileBase64, "base64");
  if (buf.length === 0 || buf.length > 8 * 1024 * 1024) {
    throw new Error("Image must be smaller than 8 MB");
  }

  const { data, error } = await supabase.storage
    .from("menu-images")
    .upload(safeFileName, buf, {
      contentType,
      upsert: true,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from("menu-images")
    .getPublicUrl(data.path);

  revalidatePath("/menu");
  return urlData.publicUrl;
}

export async function deleteMenuImage(imageUrl: string) {
  if (!imageUrl || !imageUrl.startsWith("http")) return;

  const match = imageUrl.match(/menu-images\/(.+)$/);
  if (!match) return;

  const filePath = match[1];
  const supabase = createAdminClient();
  await supabase.storage.from("menu-images").remove([filePath]);
}
