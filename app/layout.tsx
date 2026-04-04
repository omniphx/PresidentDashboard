import type { Metadata } from "next";

import "@/app/globals.css";
import { getSiteUrl } from "@/lib/site-url";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: "Presidential Markets",
  description: "An edgy dashboard for comparing U.S. presidents against major market benchmarks.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-mono">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
