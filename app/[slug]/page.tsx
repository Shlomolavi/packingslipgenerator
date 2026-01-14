import { seoPages } from "../data/seo_pages";
import Generator from "../components/Generator";
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans text-gray-900 dark:text-gray-100">
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* SEO Header */}
                <header className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
                        {page.h1}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
                        {page.intro}
                    </p>

                    {/* CTA to scroll to generator (visual cue mainly, as generator is right below) */}
                    <div className="flex justify-center">
                        <svg className="w-6 h-6 text-blue-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>
                </header>

                {/* The Core Generator */}
                <Generator />

                {/* Internal Linking */}
                <section className="mt-20 pt-12 border-t border-gray-200 dark:border-zinc-800">
                    <h2 className="text-2xl font-bold text-center mb-8">Related Tools</h2>
                    <nav className="flex flex-wrap justify-center gap-4 text-sm font-medium">
                        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
                            Home
                        </Link>
                        {otherPages.map((p, i) => (
                            <div key={p.slug} className="flex items-center gap-4">
                                <span className="text-gray-300">•</span>
                                <Link href={`/${p.slug}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                                    {p.title.split('|')[0].trim()}
                                </Link>
                            </div>
                        ))}
                    </nav>
                </section>

            </main>

            <footer className="max-w-5xl mx-auto mt-12 mb-8 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>© {new Date().getFullYear()} Packing Slip Generator. All rights reserved.</p>
            </footer>
        </div>
    );
}
