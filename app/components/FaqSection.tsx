import React from 'react';
import { FAQItem } from '../data/faq';

interface FaqSectionProps {
    items: FAQItem[];
}

export const FaqSection = ({ items }: FaqSectionProps) => {
    // Generate JSON-LD Schema
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": items.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    };

    return (
        <section className="max-w-3xl mx-auto py-12 border-t border-gray-200 dark:border-zinc-800">
            {/* Inject JSON-LD Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                Frequently Asked Questions
            </h2>

            <dl className="space-y-8">
                {items.map((item, index) => (
                    <div key={index} className="border-b border-gray-100 dark:border-zinc-800 pb-6 last:border-0 last:pb-0">
                        <dt className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            {item.question}
                        </dt>
                        <dd className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            {item.answer}
                        </dd>
                    </div>
                ))}
            </dl>
        </section>
    );
};
