export function getSiteUrl() {
  const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL;

  if (explicitUrl) {
    return new URL(
      explicitUrl.startsWith("http://") || explicitUrl.startsWith("https://")
        ? explicitUrl
        : `https://${explicitUrl}`,
    );
  }

  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;

  if (vercelUrl) {
    return new URL(`https://${vercelUrl}`);
  }

  return new URL("http://localhost:3000");
}
