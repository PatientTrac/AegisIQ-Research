import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import {
  createWatchlist,
  listWatchlists,
} from "@/lib/workspace-screener-repository";

interface CreateWatchlistRequestBody {
  name?: unknown;
  description?: unknown;
  isDefault?: unknown;
}

function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

async function requireUserId(): Promise<string | null> {
  const session = await auth();
  return session.userId ?? null;
}

export async function GET(): Promise<NextResponse> {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Unauthorized", 401);
    }

    const watchlists = await listWatchlists(userId);

    return NextResponse.json({ watchlists });
  } catch (error) {
    console.error("Failed to list watchlists", error);
    return jsonError("Failed to load watchlists", 500);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await requireUserId();

    if (!userId) {
      return jsonError("Unauthorized", 401);
    }

    const body = (await request.json()) as CreateWatchlistRequestBody;

    if (typeof body.name !== "string") {
      return jsonError("Invalid watchlist name", 400);
    }

    if (body.description !== undefined && body.description !== null && typeof body.description !== "string") {
      return jsonError("Invalid watchlist description", 400);
    }

    if (body.isDefault !== undefined && typeof body.isDefault !== "boolean") {
      return jsonError("Invalid watchlist default flag", 400);
    }

    const watchlist = await createWatchlist(userId, {
      name: body.name,
      description: body.description as string | null | undefined,
      isDefault: body.isDefault as boolean | undefined,
    });

    return NextResponse.json({ watchlist }, { status: 201 });
  } catch (error) {
    console.error("Failed to create watchlist", error);

    if (error instanceof Error) {
      if (error.message === "name_required") {
        return jsonError("Watchlist name is required", 400);
      }

      if (error.message === "name_too_long") {
        return jsonError("Watchlist name is too long", 400);
      }
    }

    return jsonError("Failed to create watchlist", 500);
  }
}
