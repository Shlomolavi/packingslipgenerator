"use client";

import Link from "next/link";
import { seoPages } from "../data/seo_pages";
import { logEventClient } from "../../lib/client-logger";

interface RelatedToolsProps {
    currentSlug?: string;
}

export const RelatedTools = ({ currentSlug }: RelatedToolsProps) => {
    // 1. Core Tools (Always shown)
    const coreSlugs = [
        "packing-slip-generator",
        "free-packing-slip-template",
        "packing-slip-pdf-download",
        "printable-packing-slip",
    ];

    // 2. Identify Context (Platform vs Feature)
    const isPlatformPage = currentSlug?.includes("for-");

    // Helper to categorize slugs
    const isPlatform = (slug: string) => slug.includes("for-");
    const isCore = (slug: string) => coreSlugs.includes(slug);

    // Filter pages lists
    const corePages = seoPages.filter(p => isCore(p.slug) && p.slug !== currentSlug);

    const platformPages = seoPages.filter(p => isPlatform(p.slug) && !isCore(p.slug) && p.slug !== currentSlug);
    const featurePages = seoPages.filter(p => !isPlatform(p.slug) && !isCore(p.slug) && p.slug !== currentSlug);

    // 3. Select Contextual Links (Group B)
    let contextualPages = [];
    if (isPlatformPage) {
        // Show other platforms
        contextualPages = platformPages.slice(0, 5);
    } else {
        // Show features (default for home or feature pages)
        contextualPages = featurePages.slice(0, 5);
    }

    // 4. Select Discovery Links (Group C)
    // Show mixed remaining high-value pages not already shown
    const shownSlugs = new Set([
        ...corePages.map(p => p.slug),
        ...contextualPages.map(p => p.slug),
        currentSlug
    ]);

    const discoveryPages = seoPages
        .filter(p => !shownSlugs.has(p.slug))
        .slice(0, 3);

    return (
        <section className="mt-20 pt-12 border-t border-gray-200 dark:border-zinc-800">
            <h2 className="text-2xl font-bold text-center mb-10 text-gray-900 dark:text-white">
                Related Tools & Templates
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">

                {/* Group A: Core Tools */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Most Popular
                    </h3>
                    <nav className="flex flex-col gap-2">
                        {!currentSlug && (
                            <span className="text-gray-900 dark:text-gray-100 font-medium cursor-default">
                                Packing Slip Generator
                            </span>
                        )}
                        {corePages.map(page => (
                            <Link
                                key={page.slug}
                                href={`/${page.slug}`}
                                onClick={() => logEventClient('footer_navigation_clicked', { section: 'most_popular', destination_type: 'single' })}
                                className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                                title={page.title}
                            >
                                {page.h1}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Group B: Contextual */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        {isPlatformPage ? "For Other Platforms" : "Features & Use Cases"}
                    </h3>
                    <nav className="flex flex-col gap-2">
                        {contextualPages.map(page => (
                            <Link
                                key={page.slug}
                                href={`/${page.slug}`}
                                onClick={() => logEventClient('footer_navigation_clicked', {
                                    section: 'features',
                                    destination_type: isPlatform(page.slug) ? 'platform' : 'resource'
                                })}
                                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                            >
                                {page.h1.replace("Packing Slip Generator", "").replace("Packing Slip", "").trim() || page.h1}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Group C: Discovery */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        More Resources
                    </h3>
                    <nav className="flex flex-col gap-2">
                        {discoveryPages.map(page => (
                            <Link
                                key={page.slug}
                                href={`/${page.slug}`}
                                onClick={() => logEventClient('footer_navigation_clicked', { section: 'resources', destination_type: 'resource' })}
                                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                            >
                                {page.h1}
                            </Link>
                        ))}
                        <Link
                            href="/bulk-csv-packing-slip"
                            onClick={() => logEventClient('footer_navigation_clicked', { section: 'resources', destination_type: 'bulk' })}
                            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors"
                        >
                            Bulk Packing Slip Generator (CSV Upload)
                        </Link>
                    </nav>
                </div>

            </div>
        </section>
    );
};
