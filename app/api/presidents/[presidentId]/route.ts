import { jsonWithCache } from "@/lib/api";
import { getPresidentCacheTtlSeconds } from "@/lib/market";
import { getPresident } from "@/lib/presidents";

type PresidentRouteProps = {
  params: Promise<{
    presidentId: string;
  }>;
};

export async function GET(_: Request, { params }: PresidentRouteProps) {
  const { presidentId } = await params;
  const president = getPresident(presidentId);

  return jsonWithCache(president, getPresidentCacheTtlSeconds(president.id));
}
