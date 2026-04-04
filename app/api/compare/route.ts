import { NextRequest, NextResponse } from "next/server";

import { jsonWithCache } from "@/lib/api";
import { getBenchmark } from "@/lib/benchmarks";
import { getComparison, getDefaultComparisonIds, getPresidentsCacheTtlSeconds } from "@/lib/market";

export async function GET(request: NextRequest) {
  try {
    const benchmarkId = request.nextUrl.searchParams.get("benchmarkId") ?? undefined;
    const benchmark = getBenchmark(benchmarkId);
    const defaults = getDefaultComparisonIds(benchmark.id);
    const leftId = request.nextUrl.searchParams.get("leftPresidentId") ?? defaults.leftId;
    const rightId = request.nextUrl.searchParams.get("rightPresidentId") ?? defaults.rightId;
    const comparison = await getComparison(benchmark.id, leftId, rightId);

    return jsonWithCache(
      comparison,
      getPresidentsCacheTtlSeconds([comparison.left.id, comparison.right.id]),
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown comparison error.",
      },
      { status: 502 },
    );
  }
}
