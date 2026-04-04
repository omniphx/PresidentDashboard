import { NextRequest, NextResponse } from "next/server";

import { jsonWithCache } from "@/lib/api";
import { getBenchmark } from "@/lib/benchmarks";
import { getComparison, getPresidentsCacheTtlSeconds } from "@/lib/market";

type PresidentComparisonRouteProps = {
  params: Promise<{
    presidentId: string;
  }>;
};

export async function GET(request: NextRequest, { params }: PresidentComparisonRouteProps) {
  try {
    const { presidentId } = await params;
    const benchmarkId = request.nextUrl.searchParams.get("benchmarkId") ?? undefined;
    const otherPresidentId =
      request.nextUrl.searchParams.get("comparePresidentId") ??
      request.nextUrl.searchParams.get("otherPresidentId") ??
      request.nextUrl.searchParams.get("rightPresidentId") ??
      undefined;

    if (!otherPresidentId) {
      return NextResponse.json(
        { error: "Missing comparePresidentId query parameter." },
        { status: 400 },
      );
    }

    const benchmark = getBenchmark(benchmarkId);
    const comparison = await getComparison(benchmark.id, presidentId, otherPresidentId);

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
