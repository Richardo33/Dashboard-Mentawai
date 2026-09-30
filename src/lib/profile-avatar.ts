import { supabase } from "@/lib/supabase/client";

const avatarBucket = "profile-avatars";

export async function resolveProfileAvatar(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("data:") || path.startsWith("blob:") || path.startsWith("http://") || path.startsWith("https://")) return path;
  if (!supabase) return "";
  const { data } = await supabase.storage.from(avatarBucket).createSignedUrl(path, 3600);
  return data?.signedUrl ?? "";
}

export function isStoredAvatarPath(path?: string | null) {
  return Boolean(path && !path.startsWith("data:") && !path.startsWith("blob:") && !path.startsWith("http://") && !path.startsWith("https://"));
}

export function avatarExtension(type: string) {
  return type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
}

export async function hasValidImageSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng = bytes.slice(0, 8).every((byte, index) => byte === [137, 80, 78, 71, 13, 10, 26, 10][index]);
  const isWebp = String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return isJpeg || isPng || isWebp;
}
