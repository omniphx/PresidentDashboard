import { NextRequest, NextResponse } from "next/server";

import { getBenchmark } from "@/lib/benchmarks";
import { getComparison, getDefaultComparisonIds } from "@/lib/market";

export async function GET(request: NextRequest) {
  try {
    const benchmarkId = request.nextUrl.searchParams.get("benchmarkId") ?? undefined;
    const benchmark = getBenchmark(benchmarkId);
    const defaults = getDefaultComparisonIds(benchmark.id);
    const leftId = request.nextUrl.searchParams.get("leftPresidentId") ?? defaults.leftId;
    const rightId = request.nextUrl.searchParams.get("rightPresidentId") ?? defaults.rightId;
    const comparison = await getComparison(benchmark.id, leftId, rightId);

    return NextResponse.json(comparison);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown comparison error.",
      },
      { status: 502 },
    );
  }
}
