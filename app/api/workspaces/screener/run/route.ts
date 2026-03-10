import { NextResponse } from "next/server";

import { runWorkspaceScreener } from "@/lib/workspace-screener-query";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { filters?: unknown; limit?: unknown };

    const response = await runWorkspaceScreener({
      filters: body?.filters,
      limit: body?.limit,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("screener.run.failed", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to run screener request.",
      },
      { status: 400 },
    );
  }
}
