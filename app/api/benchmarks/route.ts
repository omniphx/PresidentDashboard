import { jsonWithCache } from "@/lib/api";
import { benchmarks } from "@/lib/benchmarks";
import { PRESIDENT_REVALIDATE_SECONDS } from "@/lib/market";

export async function GET() {
  return jsonWithCache(benchmarks, PRESIDENT_REVALIDATE_SECONDS);
}
