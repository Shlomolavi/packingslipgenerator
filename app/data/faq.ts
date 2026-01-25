export type FAQItem = {
    question: string;
    answer: string;
};

export const faqData: {
    default: FAQItem[];
    shopify: FAQItem[];
    etsy: FAQItem[];
} = {
    default: [
        {
            question: "What is a packing slip?",
            answer: "A packing slip is a document included in a shipment that lists all the items contained within the package. It allows the recipient to verify that they have received everything they ordered."
        },
        {
            question: "Is this packing slip generator free?",
            answer: "Yes, this tool is 100% free to use. You can generate unlimited packing slips without creating an account or paying any fees."
        },
        {
            question: "Do I need to install an app or software?",
            answer: "No installation is required. This is a web-based tool that runs entirely in your browser. It works instantly on desktop, tablet, and mobile devices."
        },
        {
            question: "Can I download the packing slip as a PDF?",
            answer: "Yes. Once you fill in your order details, simply click the 'Download PDF' button to instantly generate a professional, print-ready PDF file."
        },
        {
            question: "Is my data saved or uploaded anywhere?",
            answer: "No. Your data is processed entirely locally within your browser for maximum privacy. We do not upload, store, or see your customer or order information on our servers."
        },
        {
            question: "Can I generate packing slips in bulk using a CSV file?",
            answer: "Yes. You can upload a CSV file and generate packing slips for multiple orders at once. Each order is converted into a clean, print-ready packing slip automatically."
        },
        {
            question: "How many orders can I generate at once with CSV upload?",
            answer: "You can generate packing slips for up to 100 orders in a single CSV upload, making it easy to handle bulk shipments quickly."
        }
    ],
    shopify: [
        {
            question: "Is this suitable for Shopify sellers?",
            answer: "Absolutely. If you don't want to pay monthly fees for packing slip apps on the Shopify App Store, you can use this free tool to manually create professional packing slips for your Shopify orders."
        }
    ],
    etsy: [
        {
            question: "Can I use this for my Etsy shop?",
            answer: "Yes. This generator creates cleaner, more professional-looking packing slips than the standard Etsy printouts. You can add your custom notes and branding details to give your handmade shipments a personal touch."
        }
    ]
};
