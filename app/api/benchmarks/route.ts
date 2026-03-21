import { NextResponse } from "next/server";

import { benchmarks } from "@/lib/benchmarks";

export async function GET() {
  return NextResponse.json(benchmarks);
}
