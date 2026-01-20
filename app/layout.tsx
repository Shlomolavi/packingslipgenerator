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
    "Create professional packing slips for your shipments instantly. Free, secure, and easier than Excel.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png?v=3", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png?v=3" }],
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
        {/* HEADER */}
        <header className="w-full border-b border-gray-100">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center">
            <a
              href="/"
              className="inline-flex items-center gap-3 whitespace-nowrap"
            >
              <img
                src="/logo/logo-icon-64.png"
                alt="Packing Slip Generator"
                width="56"
                height="56"
                style={{ display: "block" }}
              />
              <span className="text-sm font-semibold text-gray-900">
                Packing Slip Generator
              </span>
            </a>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main>{children}</main>
      </body>
    </html>
  );
}
