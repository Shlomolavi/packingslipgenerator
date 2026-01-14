import Generator from "./components/Generator";
import { Hero } from "./components/Hero";
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
          intro="The simplest way to create packing slips for your business. No sign-up required. Your data never leaves your browser."
        />

        {/* Generator Component */}
        <Generator />

        {/* SEO Internal Links */}
        <section className="mt-20 pt-12 border-t border-gray-200 dark:border-zinc-800">
          <h2 className="text-2xl font-bold text-center mb-8">Specialized Generators</h2>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-blue-600 dark:text-blue-400 font-medium">
            <Link href="/packing-slip-for-shopify" className="hover:underline">Shopify Packing Slip</Link>
            <span className="text-gray-300">•</span>
            <Link href="/packing-slip-for-etsy" className="hover:underline">Etsy Packing Slip</Link>
            <span className="text-gray-300">•</span>
            <Link href="/free-packing-slip-template" className="hover:underline">Free Template</Link>
          </div>
        </section>

      </main>

      <footer className="max-w-5xl mx-auto mt-12 mb-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} Packing Slip Generator. All rights reserved.</p>
      </footer>
    </div>
  );
}
