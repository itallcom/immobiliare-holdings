import type { Metadata } from "next";
import "./globals.css";
import "./public-design.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Immobiliare Holdings",
  description: "Corporate information for Immobiliare Holdings.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      noarchive: true,
      nosnippet: true,
    },
  },
  referrer: "no-referrer",
  other: { "codex-preview": "development" },
  icons: { icon: "/immobiliare-crest.png", shortcut: "/immobiliare-crest.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
