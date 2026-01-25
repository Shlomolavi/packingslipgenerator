"use client";

import { useEffect } from "react";
import Link from "next/link";

export const BulkCsvAnalytics = () => {
    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'bulk_csv_page_view');
        }
    }, []);

    return null;
};

export const BulkCsvCta = () => {
    const handleClick = () => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'bulk_csv_upload_click');
        }
    };

    return (
        <Link
            href="/#bulk-csv-upload"
            onClick={handleClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
            Upload CSV & Generate Packing Slips
        </Link>
    );
};
