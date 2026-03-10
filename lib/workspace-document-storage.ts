import type {
  WorkspaceDocumentKind,
  WorkspaceDocumentSourceProvider,
} from "../types/workspace";

function sanitizePathSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function extractExtension(filename: string): string {
  const trimmed = filename.trim();
  const lastDotIndex = trimmed.lastIndexOf(".");

  if (lastDotIndex <= 0 || lastDotIndex === trimmed.length - 1) {
    return "";
  }

  const extension = trimmed.slice(lastDotIndex + 1).toLowerCase();
  return /^[a-z0-9]{1,12}$/.test(extension) ? extension : "";
}

export function normalizeWorkspaceDocumentSourceProvider(
  value: string | null | undefined,
): WorkspaceDocumentSourceProvider | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (
    normalized === "external_url" ||
    normalized === "netlify_blobs" ||
    normalized === "manual" ||
    normalized === "unknown"
  ) {
    return normalized;
  }

  if (
    normalized === "url" ||
    normalized === "external" ||
    normalized === "link"
  ) {
    return "external_url";
  }

  if (
    normalized === "blob" ||
    normalized === "blobs" ||
    normalized === "netlify"
  ) {
    return "netlify_blobs";
  }

  return "unknown";
}

export function inferWorkspaceDocumentSourceProvider(input: {
  sourceUrl?: string | null;
  storagePath?: string | null;
  sourceProvider?: string | null;
}): WorkspaceDocumentSourceProvider | null {
  const explicit = normalizeWorkspaceDocumentSourceProvider(input.sourceProvider);

  if (explicit) {
    return explicit;
  }

  if (input.storagePath) {
    return "netlify_blobs";
  }

  if (input.sourceUrl) {
    return "external_url";
  }

  return null;
}

export function buildWorkspaceDocumentStoragePath(input: {
  clerkUserId: string;
  symbol: string;
  kind: WorkspaceDocumentKind;
  filename: string;
  timestamp?: Date;
}): string {
  const now = input.timestamp ?? new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");

  const safeUser = sanitizePathSegment(input.clerkUserId);
  const safeSymbol = sanitizePathSegment(input.symbol.toUpperCase());
  const safeKind = sanitizePathSegment(input.kind);
  const safeFilenameBase = sanitizePathSegment(
    input.filename.replace(/\.[^.]+$/, ""),
  );
  const extension = extractExtension(input.filename);

  const basename = extension
    ? `${safeFilenameBase || "document"}.${extension}`
    : safeFilenameBase || "document";

  return [
    "workspace-documents",
    safeUser,
    safeSymbol,
    safeKind,
    `${yyyy}${mm}${dd}`,
    basename,
  ].join("/");
}

export function buildWorkspaceDocumentMetadata(input: {
  originalFilename?: string | null;
  uploadedBy?: string | null;
  storageProvider?: WorkspaceDocumentSourceProvider | null;
  sourceUrl?: string | null;
  storagePath?: string | null;
  existingMetadata?: Record<string, unknown> | null;
}): Record<string, unknown> {
  return {
    ...(input.existingMetadata ?? {}),
    originalFilename: input.originalFilename ?? null,
    uploadedBy: input.uploadedBy ?? null,
    storageProvider: input.storageProvider ?? null,
    sourceUrl: input.sourceUrl ?? null,
    storagePath: input.storagePath ?? null,
  };
}
