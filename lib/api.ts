import { NextResponse } from "next/server";

export function getCacheControlHeader(ttlSeconds: number) {
  const staleWhileRevalidate = Math.max(ttlSeconds, 60 * 60);
  return `public, max-age=0, s-maxage=${ttlSeconds}, stale-while-revalidate=${staleWhileRevalidate}`;
}

export function jsonWithCache<T>(data: T, ttlSeconds: number, init?: ResponseInit) {
  const response = NextResponse.json(data, init);
  response.headers.set("Cache-Control", getCacheControlHeader(ttlSeconds));
  return response;
}
