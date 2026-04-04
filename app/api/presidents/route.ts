import { jsonWithCache } from "@/lib/api";
import { PRESIDENT_REVALIDATE_SECONDS } from "@/lib/market";
import { presidentTerms } from "@/lib/presidents";

export async function GET() {
  return jsonWithCache(presidentTerms, PRESIDENT_REVALIDATE_SECONDS);
}
