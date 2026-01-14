import Link from "next/link";
import { ReactNode } from "react";

export interface SeoPageConfig {
    slug: string;
    title: string;
    description: string;
    h1: string;
    intro: ReactNode;
}

export const seoPages: SeoPageConfig[] = [
    {
        slug: "packing-slip-generator",
        title: "Packing Slip Generator | Create Free Packing Slips Online",
        description: "Generate professional packing slips for your orders in seconds. Free, no-signup tool for small businesses and e-commerce sellers.",
        h1: "The Ultimate Packing Slip Generator",
        intro: (
            <>
                Use this free tool to generate clean, professional packing slips for any type of order.
                If you sell on <Link href="/packing-slip-for-shopify" className="text-blue-600 hover:underline">Shopify</Link> or <Link href="/packing-slip-for-etsy" className="text-blue-600 hover:underline">Etsy</Link>, this generator works perfectly.
            </>
        )
    },
    {
        slug: "packing-slip-for-shopify",
        title: "Free Shopify Packing Slip Generator | No App Needed",
        description: "Create compliant packing slips for your Shopify orders without paying for expensive apps. Custom, printable PDF templates for Shopify sellers.",
        h1: "Free Packing Slip Generator for Shopify",
        intro: (
            <>
                Don’t want to pay monthly fees for Shopify apps?
                Use our <Link href="/packing-slip-generator" className="text-blue-600 hover:underline">free packing slip generator</Link> to create compliant packing slips for your Shopify orders in seconds.
            </>
        )
    },
    {
        slug: "packing-slip-for-etsy",
        title: "Etsy Packing Slip Template | Free & Printable",
        description: "Make beautiful packing slips for your Etsy crafts. Add a personal touch to your shipments with our free, customizable Etsy packaging tool.",
        h1: "Custom Packing Slips for Etsy Sellers",
        intro: (
            <>
                Etsy sellers can generate professional packing slips instantly using our <Link href="/packing-slip-generator" className="text-blue-600 hover:underline">free packing slip generator</Link>.
                Ideal for handmade, digital, and physical product orders.
            </>
        )
    },
    {
        slug: "free-packing-slip-template",
        title: "Free Packing Slip Template PDF | Edit & Print",
        description: "Download a free packing slip template or generate one instantly. Fully editable fields for sender, recipient, and line items.",
        h1: "Free Printable Packing Slip Template",
        intro: "Stop wrestling with Word or Excel. Our free packing slip template captures all the essential details—shipping address, tracking numbers, and itemized lists—in a clean, standardized format ready for any printer."
    }
];
