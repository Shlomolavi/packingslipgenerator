import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://packingslipgenerator.com'),

  // ✅ Google Search Console verification (replace the string below)
  verification: {
    google: "EwhW2nnntYEd3qD8aUAZ47mhdwIajrold06gKiV-cBo"
  },

  title: {
    default: "Packing Slip Generator | Free Invoice & Packing Slip Template",
    template: "%s | Packing Slip Generator"
  },
  description: "Create professional packing slips for your shipments instantly. Free, secure, and easier than Excel. Perfect for Shopify, Etsy, and small businesses.",
  keywords: ["packing slip generator", "free packing slip template", "shopify packing slip", "etsy packing slip", "invoice generator", "shipping document creator"],
  authors: [{ name: "Packing Slip Generator" }],
  creator: "Packing Slip Generator",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://packingslipgenerator.com",
    siteName: "Packing Slip Generator",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Packing Slip Generator Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Packing Slip Generator",
    description: "Create professional packing slips instantly.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Packing Slip Generator",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Free online tool to generate professional packing slips for shipments."
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <header className="w-full border-b border-gray-200 dark:border-zinc-800">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/logo/packing-slip-generator-logo.png"
                alt="Packing Slip Generator"
                width={220}
                height={40}
                priority
                style={{ height: 32, width: "auto" }}
              />
            </Link>
          </div>
        </header>

        {children}
      </body>

    </html>
  );
}
