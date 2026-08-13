/**
 * Shared FormData helpers used across every server action file, replacing the
 * four near-identical copies of `str()` and the two divergent
 * `sanitizeFilename()` implementations found in the code-quality audit.
 */

export function formStr(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : null;
}

export function formRequiredStr(formData: FormData, key: string): string {
  const v = formStr(formData, key);
  if (v === null) throw new Error(`${key.replace(/_/g, " ")} is required.`);
  return v;
}

export function formNumber(formData: FormData, key: string): number | null {
  const v = formStr(formData, key);
  if (v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Sanitises a user-supplied filename for use as a Supabase Storage path segment. */
export function sanitizeFilename(name: string): string {
  const cleaned = name
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.-]+/, "");
  return (cleaned || "file").slice(-150);
}

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50MB

export const DOCUMENT_MIME_ALLOWLIST = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export const EVIDENCE_MIME_ALLOWLIST = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
  "video/mp4",
  "video/quicktime",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/webm",
  "application/pdf",
]);

export function assertValidUpload(file: File, allowlist: Set<string>) {
  if (file.size === 0) throw new Error("Choose a file to upload.");
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`File is too large. Maximum size is ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB.`);
  }
  if (file.type && !allowlist.has(file.type)) {
    throw new Error(`File type "${file.type}" is not allowed for this upload.`);
  }
}

/**
 * Postgres/PostgREST errors carry a `code`; anything with one is a raw DB
 * error and gets logged server-side but replaced with a safe generic
 * message before it reaches the client. Errors without a `code` are
 * app-authored (e.g. thrown by a zod parse or an explicit `throw new
 * Error("...")`) and are already written to be user-facing, so they pass
 * through unchanged.
 *
 * Written as a TypeScript assertion function (rather than returning an
 * Error to conditionally throw) so callers keep the same `data` narrowing
 * Supabase's `{ data, error }` result normally gives after a plain
 * `if (error) throw ...` check.
 */
export function assertDbOk(
  error: { message: string; code?: string } | null,
  fallback: string,
): asserts error is null {
  if (!error) return;
  if (error.code) {
    console.error(`[db error ${error.code}]`, error.message);
    throw new Error(fallback);
  }
  throw new Error(error.message);
}
