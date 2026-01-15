import Generator from "./components/Generator";
import { Hero } from "./components/Hero";
import { FaqSection } from "./components/FaqSection";
import { RelatedTools } from "./components/RelatedTools";
import { faqData } from "./data/faq";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Packing Slip Generator | Free Invoice & Packing Slip Template",
  description: "Create professional packing slips for your shipments instantly. Free, secure, and easier than Excel. Perfect for Shopify, Etsy, and small businesses.",
  alternates: {
    canonical: "https://packingslipgenerator.com",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans text-gray-900 dark:text-gray-100">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Intro Section */}
        {/* Intro Section - Server Component */}
        <Hero
          title="Free Packing Slip Generator"
          intro={
            <>
              Create professional packing slips in seconds with our <Link href="/packing-slip-generator" className="text-blue-600 hover:underline">free packing slip generator</Link>.
              Perfect for online sellers using <Link href="/packing-slip-for-shopify" className="text-blue-600 hover:underline">Shopify</Link> or <Link href="/packing-slip-for-etsy" className="text-blue-600 hover:underline">Etsy</Link>.
            </>
          }
        />

        {/* Generator Component */}
        <Generator />

        {/* FAQ Section */}
        <FaqSection items={faqData.default} />

        {/* Related Tools */}
        <RelatedTools />


      </main>

      <footer className="max-w-5xl mx-auto mt-12 mb-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} Packing Slip Generator. All rights reserved.</p>
      </footer>
    </div>
  );
}
