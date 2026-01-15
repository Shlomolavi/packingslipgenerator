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
    },
    {
        slug: "packing-slip-for-woocommerce",
        title: "WooCommerce Packing Slip Generator | Free & Printable",
        description: "Create professional packing slips for WooCommerce orders. No plugin required. Free printable PDF.",
        h1: "WooCommerce Packing Slip Generator",
        intro: "Need a packing slip for your WooCommerce store but don't want to install another plugin? Our free printable PDF generator is perfect for small businesses. Just enter your order details and print."
    },
    {
        slug: "packing-slip-for-ebay",
        title: "eBay Packing Slip Generator | Free PDF Template",
        description: "Generate clean packing slips for eBay orders. Free, fast, and printable.",
        h1: "eBay Packing Slip Generator",
        intro: "Streamline your eBay order fulfillment with our free packing slip generator. Designed for individual sellers who need a fast, clean, and professional way to include documentation with every shipment."
    },
    {
        slug: "packing-slip-for-amazon-fbm",
        title: "Amazon FBM Packing Slip Generator | Free & Compliant",
        description: "Create compliant packing slips for Amazon FBM orders. Free PDF generator.",
        h1: "Amazon FBM Packing Slip Generator",
        intro: "Ensure compliance with Amazon FBM (Fulfillment by Merchant) requirements using our clear, professional packing slips. Avoid confusion and provide your customers with exactly what they expect."
    },
    {
        slug: "packing-slip-for-dropshipping",
        title: "Dropshipping Packing Slip Generator | No Prices Included",
        description: "Generate clean dropshipping packing slips without prices. Free and printable.",
        h1: "Dropshipping Packing Slip Generator",
        intro: "Keep your branding neutral and remove prices for blind dropshipping. Our tool allows you to create simplified packing slips that are perfect for supplier fulfillment and keep your customers happy."
    },
    {
        slug: "packing-slip-for-wix",
        title: "Wix Packing Slip Generator | Free Printable PDF",
        description: "Create packing slips for Wix orders in seconds. Free, printable PDF — no app needed.",
        h1: "Wix Packing Slip Generator",
        intro: "Running your store on Wix? Use our free browser-based generator to quickly create professional PDF packing slips for your orders. No need to install extra apps or pay monthly fees."
    },
    {
        slug: "packing-slip-for-squarespace",
        title: "Squarespace Packing Slip Generator | Free PDF Template",
        description: "Generate clean packing slips for Squarespace orders. Free printable PDF, no signup.",
        h1: "Squarespace Packing Slip Generator",
        intro: "Perfect for small businesses on Squarespace. fast-track your shipping workflow by generating clean, printable packing slips instantly using our free, no-signup tool."
    },
    {
        slug: "packing-slip-for-shipstation",
        title: "ShipStation Packing Slip Template | Free PDF Generator",
        description: "Need a quick ShipStation-style packing slip? Generate a clean printable PDF instantly.",
        h1: "ShipStation Packing Slip Template",
        intro: "If you need a quick packing slip that matches a professional shipping workflow, our template is perfect. Create consistent, print-ready PDFs compatible with any standard shipping process."
    },
    {
        slug: "packing-slip-for-pirateship",
        title: "Pirate Ship Packing Slip Template | Free Printable PDF",
        description: "Create a simple Pirate Ship-style packing slip. Free, fast, and printable PDF.",
        h1: "Pirate Ship Packing Slip Template",
        intro: "Ideal for small sellers using Pirate Ship for low-cost shipping. Generate a quick, simple, and professional packing slip to include with your labels in seconds."
    },
    {
        slug: "packing-slip-pdf-download",
        title: "Packing Slip PDF Download | Free Instant Printable PDF",
        description: "Download a professional packing slip PDF in seconds. Free, printable, and browser-based — no signup.",
        h1: "Packing Slip PDF Download",
        intro: (
            <>
                Need to download a packing slip PDF instantly? Use our free browser-based tool to generate a professional, print-ready document in seconds—formatted for both A4 and Letter paper sizes. It's faster than using a template and works perfectly with our <Link href="/packing-slip-generator" className="text-blue-600 hover:underline">free packing slip generator</Link>.
            </>
        )
    },
    {
        slug: "printable-packing-slip",
        title: "Printable Packing Slip Generator | Free PDF for Shipping",
        description: "Create a printable packing slip for any order. Generate a clean PDF you can print and pack right away — free.",
        h1: "Printable Packing Slip Generator",
        intro: (
            <>
                Streamline your shipping workflow with our <Link href="/packing-slip-generator" className="text-blue-600 hover:underline">printable packing slip generator</Link>. Just fill in the order details, and we'll create a clean, professional PDF that you can print and include in the box immediately.
            </>
        )
    },
    {
        slug: "packing-slip-template-pdf",
        title: "Packing Slip Template PDF | Free Printable Template",
        description: "Use a clean packing slip template and export it as a PDF instantly. Free and easy — no apps required.",
        h1: "Packing Slip Template PDF",
        intro: (
            <>
                Why start from scratch? Our ready-to-use packing slip template allows you to fill in your shipment data and export a polished PDF instantly. It's the easiest way to get a professional look without any design skills.
            </>
        )
    },
    {
        slug: "packing-slip-with-notes",
        title: "Packing Slip with Notes | Free PDF Generator",
        description: "Add notes and instructions to your packing slip and export a clean PDF. Perfect for special handling and requests.",
        h1: "Packing Slip with Notes",
        intro: (
            <>
                Communication is key. Create a <Link href="/profession-packing-slip" className="text-blue-600 hover:underline">professional packing slip</Link> that includes a dedicated section for customer notes, special handling instructions, or internal memos to ensure every order is fulfilled correctly.
            </>
        )
    },
    {
        slug: "packing-slip-with-tracking-number",
        title: "Packing Slip with Tracking Number | Free Printable PDF",
        description: "Create a packing slip that includes tracking details, then export a print-ready PDF. Free and easy to use.",
        h1: "Packing Slip with Tracking Number",
        intro: (
            <>
                Keep your customers informed. Generate a packing slip that prominently displays tracking numbers and carrier details. Our <Link href="/packing-slip-generator" className="text-blue-600 hover:underline">free tool</Link> ensures all critical tracking information is included on the document for easy reference.
            </>
        )
    },
    {
        slug: "packing-slip-with-shipping-info",
        title: "Packing Slip with Shipping Info | Carrier, Method & Weight (Free PDF)",
        description: "Generate a packing slip that includes shipping details like carrier, method, and weight. Export a clean PDF — free.",
        h1: "Packing Slip with Shipping Info",
        intro: (
            <>
                Improve your fulfillment accuracy by including detailed shipping info on every slip. Our generator allows you to specify carrier, shipping method, and package weight, creating a complete record for your records and your customer.
            </>
        )
    },
    {
        slug: "simple-packing-slip",
        title: "Simple Packing Slip Generator | Free Clean PDF",
        description: "Generate a simple, clean packing slip PDF without extra steps. Fast, free, and easy to use.",
        h1: "Simple Packing Slip Generator",
        intro: (
            <>
                Sometimes less is more. If you need a <Link href="/packing-slip-generator" className="text-blue-600 hover:underline">simple packing slip</Link> without the clutter, our tool generates a minimalist, easy-to-read PDF that gets the job done fast.
            </>
        )
    },
    {
        slug: "professional-packing-slip",
        title: "Professional Packing Slip Generator | Free Printable PDF",
        description: "Create a professional-looking packing slip PDF suitable for businesses and fulfillment workflows — free.",
        h1: "Professional Packing Slip Generator",
        intro: (
            <>
                Make a great first impression with a professional packing slip. Our generator creates clean, consistent, and branded documents that look great in any package, helping you maintain a high standard for your business.
            </>
        )
    }
];
