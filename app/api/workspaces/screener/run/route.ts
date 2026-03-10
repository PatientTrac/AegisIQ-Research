import { NextResponse } from "next/server";
import {
  runWorkspaceScreener,
  type WorkspaceScreenerFilters,
} from "@/lib/workspace-screener-query";

type WorkspaceScreenerRunBody = {
  workspaceId?: string;
  filters?: WorkspaceScreenerFilters;
  limit?: number;
};

function normalizeLimit(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as WorkspaceScreenerRunBody;

    const response = await runWorkspaceScreener({
      workspaceId: body?.workspaceId,
      filters: body?.filters,
      limit: normalizeLimit(body?.limit),
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to run workspace screener.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
