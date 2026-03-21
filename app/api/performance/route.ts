import { NextRequest, NextResponse } from "next/server";

import { getBenchmark } from "@/lib/benchmarks";
import { getPresidentPerformance, getScoreboard } from "@/lib/market";

export async function GET(request: NextRequest) {
  try {
    const benchmarkId = request.nextUrl.searchParams.get("benchmarkId") ?? undefined;
    const presidentId = request.nextUrl.searchParams.get("presidentId") ?? undefined;
    const benchmark = getBenchmark(benchmarkId);

    if (presidentId) {
      const performance = await getPresidentPerformance(benchmark.id, presidentId);
      return NextResponse.json(performance);
    }

    const scoreboard = await getScoreboard(benchmark.id);
    return NextResponse.json(scoreboard);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown performance error.",
      },
      { status: 502 },
    );
  }
}
