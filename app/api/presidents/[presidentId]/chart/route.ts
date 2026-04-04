import { NextRequest, NextResponse } from "next/server";

import { jsonWithCache } from "@/lib/api";
import { getBenchmark } from "@/lib/benchmarks";
import {
  getPresidentCacheTtlSeconds,
  getPresidentChartData,
} from "@/lib/market";
import type { ComparisonChartMode } from "@/lib/types";

type PresidentChartRouteProps = {
  params: Promise<{
    presidentId: string;
  }>;
};

export async function GET(request: NextRequest, { params }: PresidentChartRouteProps) {
  try {
    const { presidentId } = await params;
    const benchmarkId = request.nextUrl.searchParams.get("benchmarkId") ?? undefined;
    const modeParam = request.nextUrl.searchParams.get("mode");
    const chartMode: ComparisonChartMode = modeParam === "absolute" ? "absolute" : "relative";
    const benchmark = getBenchmark(benchmarkId);
    const chartData = await getPresidentChartData(benchmark.id, presidentId, chartMode);

    return jsonWithCache(chartData, getPresidentCacheTtlSeconds(chartData.entry.id));
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown chart error.",
      },
      { status: 502 },
    );
  }
}
