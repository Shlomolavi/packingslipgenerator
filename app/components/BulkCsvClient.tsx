"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export const BulkCsvAnalytics = () => {
    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'bulk_csv_page_view');
        }
    }, []);

    return null;
};

export const BulkCsvCta = () => {
    const searchParams = useSearchParams();
    const debug = searchParams.get("debug_metrics");

    const handleClick = () => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'bulk_csv_upload_click');
        }
    };

    const href = debug
        ? `/?debug_metrics=${debug}#bulk-csv-upload`
        : `/#bulk-csv-upload`;

    return (
        <Link
            href={href}
            onClick={handleClick}
            className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
            Upload CSV & Generate Packing Slips
        </Link>
    );
};
