import { supabase } from "./supabase";

const UPLOAD_TIMEOUT_MS = 20000;

function sanitizeSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_/]+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^-+|-+$/g, "");
}

function sanitizeFolder(folder: string) {
  const normalized = sanitizeSegment(folder)
    .split("/")
    .map((segment) => segment.replace(/^_+|_+$/g, ""))
    .filter(Boolean)
    .join("/");

  return normalized || "uploads";
}

function sanitizeFileName(name: string) {
  const trimmed = name.trim();
  const lastDot = trimmed.lastIndexOf(".");
  const baseName = lastDot > 0 ? trimmed.slice(0, lastDot) : trimmed;
  const extension = lastDot > 0 ? trimmed.slice(lastDot).toLowerCase() : "";

  const safeBaseName =
    baseName
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "image";

  const safeExtension = extension.replace(/[^.a-z0-9]+/g, "");
  return `${safeBaseName}${safeExtension}`;
}

function uploadId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function withTimeout<T>(promise: Promise<T>, message: string, timeoutMs = UPLOAD_TIMEOUT_MS) {
  return new Promise<T>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);

    promise.then(
      (value) => {
        window.clearTimeout(timeout);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timeout);
        reject(error);
      }
    );
  });
}

function toUserError(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const msg = String((error as { message: string }).message);
    if (/new row violates row-level security/i.test(msg)) {
      return "Upload was blocked. Sign in as an admin user that is listed in the admins table.";
    }
    if (/bucket/i.test(msg) && /not found/i.test(msg)) {
      return 'Storage bucket "uploads" is missing. Create it in the Supabase Dashboard (Storage) or run the project migration SQL.';
    }
    return msg;
  }

  return "Failed to upload image.";
}

export async function uploadImageFile(file: File, folder: string) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Select an image file to upload.");
  }

  const path = `${sanitizeFolder(folder)}/${uploadId()}-${sanitizeFileName(file.name)}`;

  try {
    return await withTimeout(
      (async () => {
        const { data, error } = await supabase.storage.from("uploads").upload(path, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
        if (error) {
          console.error("[uploads] Supabase Storage error", error);
          throw error;
        }
        const { data: pub } = supabase.storage.from("uploads").getPublicUrl(data.path);
        return pub.publicUrl;
      })(),
      "Upload timed out. Check your connection and Supabase Storage configuration."
    );
  } catch (err) {
    throw new Error(toUserError(err));
  }
}
