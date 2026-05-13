import type { Metadata } from "next";
import "./globals.css";

import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "ModelMeter",
    template: "%s | ModelMeter",
  },
  description:
    "Deterministic AI spend audits with shareable savings reports for modern teams.",
  openGraph: {
    title: "ModelMeter",
    description:
      "Deterministic AI spend audits with shareable savings reports for modern teams.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ModelMeter",
    description:
      "Deterministic AI spend audits with shareable savings reports for modern teams.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
