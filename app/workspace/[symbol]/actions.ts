"use server";

import { auth } from "@clerk/nextjs/server";
import { getStore } from "@netlify/blobs";
import { revalidatePath } from "next/cache";
import {
  createWorkspaceDocument,
  createWorkspaceNote,
  deleteWorkspaceNote,
  updateWorkspaceNote,
} from "../../../lib/workspace-repository";
import {
  assertSupportedWorkspaceDocumentFile,
  buildWorkspaceDocumentMetadata,
  buildWorkspaceDocumentStoragePath,
  inferDocumentTitleFromFilename,
  inferWorkspaceDocumentSourceProvider,
  WORKSPACE_DOCUMENTS_STORE_NAME,
} from "../../../lib/workspace-document-storage";
import type { WorkspaceDocumentKind } from "../../../types/workspace";

function getRequiredString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

function getOptionalString(value: FormDataEntryValue | null): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getOptionalNumber(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

function assertAllowedKind(value: string): WorkspaceDocumentKind {
  const allowed: WorkspaceDocumentKind[] = [
    "report",
    "filing",
    "model",
    "transcript",
    "deck",
    "memo",
    "other",
  ];

  if (allowed.includes(value as WorkspaceDocumentKind)) {
    return value as WorkspaceDocumentKind;
  }

  return "other";
}

export async function createWorkspaceNoteAction(formData: FormData): Promise<void> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized.");
  }

  const symbol = normalizeSymbol(getRequiredString(formData.get("symbol")));
  const title = getRequiredString(formData.get("title"));
  const bodyMd = getRequiredString(formData.get("bodyMd"));
  const isPinned = getRequiredString(formData.get("isPinned")) === "on";

  await createWorkspaceNote(userId, symbol, {
    title,
    bodyMd,
    isPinned,
  });

  revalidatePath(`/workspace/${symbol}`);
  revalidatePath(`/api/workspaces/${symbol}`);
  revalidatePath(`/api/workspaces/${symbol}/notes`);
}

export async function updateWorkspaceNoteAction(formData: FormData): Promise<void> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized.");
  }

  const symbol = normalizeSymbol(getRequiredString(formData.get("symbol")));
  const noteId = getRequiredString(formData.get("noteId"));
  const title = getRequiredString(formData.get("title"));
  const bodyMd = getRequiredString(formData.get("bodyMd"));
  const isPinned = getRequiredString(formData.get("isPinned")) === "on";

  await updateWorkspaceNote(userId, symbol, noteId, {
    title,
    bodyMd,
    isPinned,
  });

  revalidatePath(`/workspace/${symbol}`);
  revalidatePath(`/api/workspaces/${symbol}`);
  revalidatePath(`/api/workspaces/${symbol}/notes`);
}

export async function deleteWorkspaceNoteAction(formData: FormData): Promise<void> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized.");
  }

  const symbol = normalizeSymbol(getRequiredString(formData.get("symbol")));
  const noteId = getRequiredString(formData.get("noteId"));
  const confirmation = getRequiredString(formData.get("confirmation")).trim();

  if (confirmation !== "DELETE") {
    throw new Error("Type DELETE to confirm note removal.");
  }

  await deleteWorkspaceNote(userId, symbol, noteId);

  revalidatePath(`/workspace/${symbol}`);
  revalidatePath(`/api/workspaces/${symbol}`);
  revalidatePath(`/api/workspaces/${symbol}/notes`);
}

export async function createWorkspaceDocumentAction(
  formData: FormData,
): Promise<void> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized.");
  }

  const symbol = normalizeSymbol(getRequiredString(formData.get("symbol")));
  const title = getRequiredString(formData.get("title"));
  const kind = assertAllowedKind(getRequiredString(formData.get("kind")));
  const sourceUrl = getOptionalString(formData.get("sourceUrl"));
  const sourceProviderInput = getOptionalString(formData.get("sourceProvider"));
  const mimeType = getOptionalString(formData.get("mimeType"));
  const storagePath = getOptionalString(formData.get("storagePath"));
  const fileSizeBytes = getOptionalNumber(formData.get("fileSizeBytes"));
  const originalFilename = getOptionalString(formData.get("originalFilename"));

  const sourceProvider = inferWorkspaceDocumentSourceProvider({
    sourceUrl,
    storagePath,
    sourceProvider: sourceProviderInput,
  });

  await createWorkspaceDocument(userId, symbol, {
    title,
    kind,
    sourceUrl,
    sourceProvider,
    mimeType,
    storagePath,
    fileSizeBytes,
    metadata: buildWorkspaceDocumentMetadata({
      originalFilename,
      uploadedBy: userId,
      storageProvider: sourceProvider,
      sourceUrl,
      storagePath,
    }),
  });

  revalidatePath(`/workspace/${symbol}`);
  revalidatePath(`/api/workspaces/${symbol}`);
  revalidatePath(`/api/workspaces/${symbol}/documents`);
}

export async function uploadWorkspaceDocumentAction(
  formData: FormData,
): Promise<void> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized.");
  }

  const symbol = normalizeSymbol(getRequiredString(formData.get("symbol")));
  const kind = assertAllowedKind(getRequiredString(formData.get("kind")));
  const fileEntry = formData.get("file");

  if (!(fileEntry instanceof File)) {
    throw new Error("A document file is required.");
  }

  assertSupportedWorkspaceDocumentFile(fileEntry);

  const explicitTitle = getOptionalString(formData.get("title"));
  const title = explicitTitle ?? inferDocumentTitleFromFilename(fileEntry.name);
  const storagePath = buildWorkspaceDocumentStoragePath({
    clerkUserId: userId,
    symbol,
    kind,
    filename: fileEntry.name,
  });

  const store = getStore({
    name: WORKSPACE_DOCUMENTS_STORE_NAME,
    consistency: "strong",
  });

  await store.set(storagePath, fileEntry, {
    metadata: {
      symbol,
      kind,
      uploadedBy: userId,
      originalFilename: fileEntry.name,
      mimeType: fileEntry.type,
      fileSizeBytes: fileEntry.size,
    },
  });

  await createWorkspaceDocument(userId, symbol, {
    title,
    kind,
    sourceProvider: "netlify_blobs",
    sourceUrl: null,
    storagePath,
    mimeType: fileEntry.type,
    fileSizeBytes: fileEntry.size,
    metadata: buildWorkspaceDocumentMetadata({
      originalFilename: fileEntry.name,
      uploadedBy: userId,
      storageProvider: "netlify_blobs",
      sourceUrl: null,
      storagePath,
    }),
  });

  revalidatePath(`/workspace/${symbol}`);
  revalidatePath(`/api/workspaces/${symbol}`);
  revalidatePath(`/api/workspaces/${symbol}/documents`);
}
