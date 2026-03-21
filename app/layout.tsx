import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Presidential Markets",
  description: "An edgy dashboard for comparing U.S. presidents against major market benchmarks.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-mono">
        {children}
      </body>
    </html>
  );
}
