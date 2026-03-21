import { NextResponse } from "next/server";

import { presidentTerms } from "@/lib/presidents";

export async function GET() {
  return NextResponse.json(presidentTerms);
}
