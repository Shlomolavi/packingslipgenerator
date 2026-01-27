import Link from "next/link";
import { Metadata } from "next";
import { Hero } from "../components/Hero";
import { FaqSection } from "../components/FaqSection";
import { BulkCsvAnalytics, BulkCsvCta } from "../components/BulkCsvClient";

export const metadata: Metadata = {
    title: "Bulk CSV Packing Slip Generator (Up to 100 Orders)",
    description: "Upload a CSV file and instantly generate up to 100 packing slips. Orders with the same OrderNumber are grouped into one PDF. Download all PDFs as a ZIP file.",
    alternates: {
        canonical: "https://packingslipgenerator.com/bulk-csv-packing-slip",
    },
};

export default function BulkCsvPage() {
    const softwareAppSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Bulk CSV Packing Slip Generator",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web Browser",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "featureList": "Generate up to 100 packing slips at once, CSV upload, Automatic order grouping, ZIP download of PDFs"
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "How does CSV grouping work?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "The generator looks at the OrderNumber column. If multiple rows share the same OrderNumber, they are automatically grouped into a single packing slip PDF with multiple line items."
                }
            },
            {
                "@type": "Question",
                "name": "Does the same OrderNumber create one PDF?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. Duplicate OrderNumber values indicate items belonging to the same order. These are combined into one document."
                }
            },
            {
                "@type": "Question",
                "name": "How many orders can I upload at once?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "You can upload a CSV containing up to 100 unique orders. If you have more, please split them into multiple CSV files."
                }
            },
            {
                "@type": "Question",
                "name": "Are all fields required?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Required fields (OrderNumber, Sender/Recipient details) must be present. Optional fields like SKU or Weight can be left blank."
                }
            },
            {
                "@type": "Question",
                "name": "Are Notes & Instructions supported?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Notes & Instructions are available for single orders only and are not supported in bulk CSV uploads."
                }
            }
        ]
    };

    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "How to generate bulk packing slips from a CSV",
        "totalTime": "PT2M",
        "supply": {
            "@type": "HowToSupply",
            "name": "CSV file"
        },
        "tool": {
            "@type": "HowToTool",
            "name": "Bulk CSV Packing Slip Generator"
        },
        "step": [
            {
                "@type": "HowToStep",
                "name": "Download the sample CSV",
                "text": "Download the sample CSV file to get the correct headers and format.",
                "position": 1
            },
            {
                "@type": "HowToStep",
                "name": "Fill in your orders",
                "text": "Fill in your orders ensuring one row represents one item.",
                "position": 2
            },
            {
                "@type": "HowToStep",
                "name": "Group items",
                "text": "Use the same OrderNumber for multiple items in the same order.",
                "position": 3
            },
            {
                "@type": "HowToStep",
                "name": "Upload the CSV",
                "text": "Upload the filled CSV file to the generator platform.",
                "position": 4
            },
            {
                "@type": "HowToStep",
                "name": "Download the ZIP",
                "text": "Download the resulting ZIP file containing all your PDF packing slips.",
                "position": 5
            }
        ]
    };

    const jsonLd = [softwareAppSchema, faqSchema, howToSchema];

    const faqItems = [
        {
            question: "How does CSV grouping work?",
            answer: "The generator looks at the OrderNumber column. If multiple rows share the same OrderNumber, they are automatically grouped into a single packing slip PDF with multiple line items."
        },
        {
            question: "Does the same OrderNumber create one PDF?",
            answer: "Yes. Duplicate OrderNumber values indicate items belonging to the same order. These are combined into one document."
        },
        {
            question: "How many orders can I upload at once?",
            answer: "You can upload a CSV containing up to 100 unique orders. If you have more, please split them into multiple CSV files."
        },
        {
            question: "Are all fields required?",
            answer: "Required fields (OrderNumber, Sender/Recipient details) must be present. Optional fields like SKU or Weight can be left blank."
        },
        {
            question: "Are Notes & Instructions supported?",
            answer: "Notes & Instructions are available for single orders only and are not supported in bulk CSV uploads."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans text-gray-900 dark:text-gray-100">
            <BulkCsvAnalytics />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Hero Section */}
                <Hero
                    title="Bulk CSV Packing Slip Generator"
                    intro={
                        <>
                            Built for high-volume sellers, warehouses, and fulfillment teams. Stop creating packing slips manually—upload a CSV file to instantly generate up to 100 professional PDFs at once. Orders with the same OrderNumber are automatically grouped into one document, and all files are delivered in a single ZIP download.
                        </>
                    }
                />

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                    <BulkCsvCta />
                    <a
                        href="/sample-bulk-orders.csv"
                        download
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                            <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                        </svg>
                        Download sample CSV
                    </a>
                </div>

                <div className="grid gap-12 max-w-4xl mx-auto">

                    {/* How it Works */}
                    <section className="bg-white dark:bg-zinc-900/50 p-8 rounded-2xl border border-gray-200 dark:border-zinc-800">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">How the Bulk CSV Upload Works</h2>
                        <ul className="space-y-4 text-lg text-gray-600 dark:text-gray-300">
                            <li className="flex items-start gap-3">
                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-1">1</span>
                                <div><span className="font-semibold text-gray-900 dark:text-white">Download the sample CSV.</span> Get the correct format.</div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-1">2</span>
                                <div><span className="font-semibold text-gray-900 dark:text-white">Fill in your orders.</span> One row per item.</div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-1">3</span>
                                <div><span className="font-semibold text-gray-900 dark:text-white">Group items.</span> Use the same OrderNumber for multiple items.</div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-1">4</span>
                                <div><span className="font-semibold text-gray-900 dark:text-white">Upload the CSV.</span> Select your file above.</div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-1">5</span>
                                <div><span className="font-semibold text-gray-900 dark:text-white">Download the ZIP.</span> Get all your PDFs instantly.</div>
                            </li>
                        </ul>
                    </section>

                    {/* Requirements */}
                    <section className="bg-white dark:bg-zinc-900/50 p-8 rounded-2xl border border-gray-200 dark:border-zinc-800">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">CSV Format Requirements</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">File Basics</h3>
                                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                                    <li>• File type: <strong>.csv</strong></li>
                                    <li>• Separator: comma</li>
                                    <li>• UTF-8 encoded</li>
                                    <li>• Header row required</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Required Columns (Exact Spelling)</h3>
                                <div className="bg-gray-100 dark:bg-zinc-950 p-4 rounded-lg font-mono text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-800">
                                    OrderNumber,<br />
                                    SenderName,<br />
                                    SenderAddress,<br />
                                    RecipientName,<br />
                                    RecipientAddress,<br />
                                    SKU,<br />
                                    Description,<br />
                                    Quantity,<br />
                                    Price
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    * OrderNumber is used for grouping items into one packing slip
                                </p>
                            </div>
                        </div>
                        <div className="mt-8">
                            <a
                                href="/sample-bulk-orders.csv"
                                download
                                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                                    <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                                </svg>
                                Download sample CSV
                            </a>
                        </div>
                    </section>

                    {/* Supported & Unsupported */}
                    <section className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-2xl border border-blue-100 dark:border-blue-800">
                        <h2 className="text-2xl font-bold mb-6 text-blue-900 dark:text-blue-100">Supported & Unsupported Fields</h2>

                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-blue-200 dark:border-blue-700 shadow-sm mb-6">
                            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Note: Notes & Instructions</h3>
                            <p className="text-gray-600 dark:text-gray-300 font-medium">
                                “Notes & Instructions are available for single orders only and are not supported in bulk CSV uploads.”
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Why?</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Bulk CSV focuses on fast, high-volume generation. Optional free-text fields are intentionally excluded to streamline the process.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Example</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    If Order <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded text-sm">ORD-1001</code> appears in two rows, both items will appear on one packing slip PDF.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Who is this for */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Who Is This For?</h2>
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                                "Shopify sellers exporting orders",
                                "Etsy sellers with batch fulfillment",
                                "Dropshippers",
                                "Warehouse / fulfillment teams",
                                "Sellers generating documents manually today"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-800">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-500">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{item}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* FAQ */}
                    <section>
                        <h2 className="text-2xl font-bold mb-8 text-center text-gray-900 dark:text-white">Frequently Asked Questions</h2>
                        <div className="max-w-3xl mx-auto">
                            <dl className="space-y-6">
                                {faqItems.map((item, index) => (
                                    <div key={index} className="bg-white dark:bg-zinc-900/50 p-6 rounded-xl border border-gray-200 dark:border-zinc-800">
                                        <dt className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            {item.question}
                                        </dt>
                                        <dd className="text-gray-600 dark:text-gray-400">
                                            {item.answer}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </section>

                </div>
            </main>

            <footer className="max-w-5xl mx-auto mt-20 mb-8 text-center text-sm text-gray-500 dark:text-gray-400 px-4">
                <p>© {new Date().getFullYear()} Packing Slip Generator. All rights reserved.</p>
            </footer>
        </div>
    );
}
