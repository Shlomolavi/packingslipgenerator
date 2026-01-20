import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://packingslipgenerator.com"),
  title: {
    default: "Packing Slip Generator | Free Invoice & Packing Slip Template",
    template: "%s | Packing Slip Generator",
  },
  description:
    "Create professional packing slips for your shipments instantly. Free, secure, and easier than Excel. Perfect for Shopify, Etsy, and small businesses.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          {/* HEADER */}
          <header className="w-full border-b border-gray-100">
            <div className="mx-auto max-w-6xl px-4 py-3">
              <a href="/" className="inline-flex items-center gap-2">
                <img
                  src="/logo/logo-32.png"
                  alt="Packing Slip Generator"
                  width={32}
                  height={32}
                  style={{ display: "block" }}
                />
                <span className="text-sm font-semibold text-gray-900">
                  Packing Slip Generator
                </span>
              </a>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
