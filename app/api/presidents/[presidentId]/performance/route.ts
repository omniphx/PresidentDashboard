import { NextRequest, NextResponse } from "next/server";

import { jsonWithCache } from "@/lib/api";
import { getBenchmark } from "@/lib/benchmarks";
import { getPresidentCacheTtlSeconds, getPresidentPerformance } from "@/lib/market";

type PresidentPerformanceRouteProps = {
  params: Promise<{
    presidentId: string;
  }>;
};

export async function GET(request: NextRequest, { params }: PresidentPerformanceRouteProps) {
  try {
    const { presidentId } = await params;
    const benchmarkId = request.nextUrl.searchParams.get("benchmarkId") ?? undefined;
    const benchmark = getBenchmark(benchmarkId);
    const performance = await getPresidentPerformance(benchmark.id, presidentId);

    return jsonWithCache(performance, getPresidentCacheTtlSeconds(performance.id));
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown performance error.",
      },
      { status: 502 },
    );
  }
}
