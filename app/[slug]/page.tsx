import { seoPages } from "../data/seo_pages";
import Generator from "../components/Generator";
import { Hero } from "../components/Hero";
import { FaqSection } from "../components/FaqSection";
import { RelatedTools } from "../components/RelatedTools";
import { faqData } from "../data/faq";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// 1. Static Params Generation
export async function generateStaticParams() {
    return seoPages.map((page) => ({
        slug: page.slug,
    }));
}

// 2. Metadata Generation
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const page = seoPages.find((p) => p.slug === slug);

    if (!page) {
        return {};
    }

    return {
        title: page.title,
        description: page.description,
        alternates: {
            canonical: `https://packingslipgenerator.com/${page.slug}`,
        },
        openGraph: {
            title: page.title,
            description: page.description,
            type: "website",
            url: `https://packingslipgenerator.com/${page.slug}`,
        },
    };
}

// 3. Page Component
export default async function SeoPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const page = seoPages.find((p) => p.slug === slug);

    if (!page) {
        notFound();
    }

    // Filter out current page for links
    const otherPages = seoPages.filter(p => p.slug !== slug);

    // Determine FAQ items based on slug
    const currentFaqItems = [...faqData.default];
    if (slug.includes('shopify')) {
        currentFaqItems.push(...faqData.shopify);
    }
    if (slug.includes('etsy')) {
        currentFaqItems.push(...faqData.etsy);
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans text-gray-900 dark:text-gray-100">
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* SEO Header */}
                {/* SEO Header - Server Component */}
                <Hero
                    title={page.h1}
                    intro={page.intro}
                />

                <div className="mt-6 mb-8 max-w-3xl mx-auto text-center px-4">
                    <p className="text-gray-600 dark:text-gray-300">
                        Need to generate packing slips in bulk? Upload a CSV file and instantly create packing slips for up to 100 orders at once — no account required.
                    </p>
                </div>

                {/* The Core Generator */}
                <Generator />

                {/* FAQ Section */}
                <FaqSection items={currentFaqItems} />

                {/* Related Tools */}
                <RelatedTools currentSlug={slug} />

            </main>

            <footer className="max-w-5xl mx-auto mt-12 mb-8 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>© {new Date().getFullYear()} Packing Slip Generator. All rights reserved.</p>
            </footer>
        </div>
    );
}
