import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  createWorkspaceDocument,
  getWorkspaceDocuments,
} from "../../../../../lib/workspace-repository";
import {
  buildWorkspaceDocumentMetadata,
  normalizeWorkspaceDocumentSourceProvider,
} from "../../../../../lib/workspace-document-storage";
import type {
  CreateWorkspaceDocumentInput,
  WorkspaceDocumentKind,
} from "../../../../../types/workspace";

interface RouteContext {
  params: Promise<{
    symbol: string;
  }>;
}

interface CreateWorkspaceDocumentRequestBody {
  title?: unknown;
  kind?: unknown;
  sourceUrl?: unknown;
  sourceProvider?: unknown;
  mimeType?: unknown;
  storagePath?: unknown;
  fileSizeBytes?: unknown;
  metadata?: unknown;
}

function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

function isValidSymbol(symbol: string): boolean {
  return /^[A-Z0-9.\-]{1,12}$/.test(symbol);
}

function asOptionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function asOptionalNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  }

  return null;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function normalizeKind(value: unknown): WorkspaceDocumentKind {
  const allowed: WorkspaceDocumentKind[] = [
    "report",
    "filing",
    "model",
    "transcript",
    "deck",
    "memo",
    "other",
  ];

  if (typeof value === "string" && allowed.includes(value as WorkspaceDocumentKind)) {
    return value as WorkspaceDocumentKind;
  }

  return "other";
}

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: RouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { symbol: rawSymbol } = await context.params;
  const symbol = normalizeSymbol(rawSymbol);

  if (!isValidSymbol(symbol)) {
    return NextResponse.json({ error: "Invalid symbol." }, { status: 400 });
  }

  const documents = await getWorkspaceDocuments(userId, symbol);

  return NextResponse.json({
    symbol,
    documents,
  });
}

export async function POST(request: Request, context: RouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { symbol: rawSymbol } = await context.params;
  const symbol = normalizeSymbol(rawSymbol);

  if (!isValidSymbol(symbol)) {
    return NextResponse.json({ error: "Invalid symbol." }, { status: 400 });
  }

  let body: CreateWorkspaceDocumentRequestBody;

  try {
    body = (await request.json()) as CreateWorkspaceDocumentRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const title = asOptionalString(body.title);

  if (!title) {
    return NextResponse.json(
      { error: "Document title is required." },
      { status: 400 },
    );
  }

  const sourceUrl = asOptionalString(body.sourceUrl);
  const storagePath = asOptionalString(body.storagePath);
  const mimeType = asOptionalString(body.mimeType);
  const fileSizeBytes = asOptionalNumber(body.fileSizeBytes);

  const sourceProviderInput =
    typeof body.sourceProvider === "string" ? body.sourceProvider : null;

  const sourceProvider = normalizeWorkspaceDocumentSourceProvider(
    sourceProviderInput,
  );

  const metadataInput = asRecord(body.metadata);

  const payload: CreateWorkspaceDocumentInput = {
    title,
    kind: normalizeKind(body.kind),
    sourceUrl,
    sourceProvider,
    mimeType,
    storagePath,
    fileSizeBytes,
    metadata: buildWorkspaceDocumentMetadata({
      existingMetadata: metadataInput,
      uploadedBy: userId,
      storageProvider: sourceProvider,
      sourceUrl,
      storagePath,
      originalFilename:
        typeof metadataInput.originalFilename === "string"
          ? metadataInput.originalFilename
          : null,
    }),
  };

  const document = await createWorkspaceDocument(userId, symbol, payload);

  return NextResponse.json(
    {
      symbol,
      document,
    },
    { status: 201 },
  );
}
