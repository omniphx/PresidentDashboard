import { NextRequest, NextResponse } from "next/server";

import { jsonWithCache } from "@/lib/api";
import { getBenchmark } from "@/lib/benchmarks";
import { getLiveQuote } from "@/lib/market";

export async function GET(request: NextRequest) {
  try {
    const benchmarkId = request.nextUrl.searchParams.get("benchmarkId") ?? undefined;
    const benchmark = getBenchmark(benchmarkId);
    const quote = await getLiveQuote(benchmark.id);

    return jsonWithCache(quote, 60 * 5);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown live quote error.",
      },
      { status: 502 },
    );
  }
}
