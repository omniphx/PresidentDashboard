import { NextRequest, NextResponse } from "next/server";

import { jsonWithCache } from "@/lib/api";
import { getBenchmark } from "@/lib/benchmarks";
import {
  getPresidentCacheTtlSeconds,
  getPresidentPerformance,
  getPresidentsCacheTtlSeconds,
  getScoreboard,
} from "@/lib/market";
import { presidentTerms } from "@/lib/presidents";

export async function GET(request: NextRequest) {
  try {
    const benchmarkId = request.nextUrl.searchParams.get("benchmarkId") ?? undefined;
    const presidentId = request.nextUrl.searchParams.get("presidentId") ?? undefined;
    const benchmark = getBenchmark(benchmarkId);

    if (presidentId) {
      const performance = await getPresidentPerformance(benchmark.id, presidentId);
      return jsonWithCache(performance, getPresidentCacheTtlSeconds(performance.id));
    }

    const scoreboard = await getScoreboard(benchmark.id);
    return jsonWithCache(
      scoreboard,
      getPresidentsCacheTtlSeconds(presidentTerms.map((president) => president.id)),
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown performance error.",
      },
      { status: 502 },
    );
  }
}
