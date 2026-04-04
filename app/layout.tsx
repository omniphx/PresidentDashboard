import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";

import "@/app/globals.css";
import { getSiteUrl } from "@/lib/site-url";
import { Analytics } from "@vercel/analytics/next";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: "Presidential Markets",
  description: "An edgy dashboard for comparing U.S. presidents against major market benchmarks.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={ibmPlexSans.variable}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
