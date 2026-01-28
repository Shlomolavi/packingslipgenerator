import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';
import * as fflate from 'fflate';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { PackingSlipPDF } from './PackingSlipPDF';
import { logEventClient } from '../../lib/client-logger';
import { usePathname } from 'next/navigation';

// Define the expected CSV row structure
interface CsvRow {
    OrderNumber: string;
    SenderName: string;
    SenderAddress: string;
    SenderPhone?: string;
    RecipientName: string;
    RecipientAddress: string;
    RecipientEmail?: string;
    SKU?: string;
    Description: string;
    Quantity: string;
    Price: string;
    Date?: string;
    PONumber?: string;
    Carrier?: string;
    TrackingNumber?: string;
    ShippingMethod?: string;
    Weight?: string;
    [key: string]: string | undefined;
}

// Map CSV group to PDF props
const mapGroupToProps = (rows: CsvRow[]) => {
    const firstRow = rows[0];
    return {
        items: rows.map(row => ({
            id: crypto.randomUUID(),
            sku: row.SKU || '',
            description: row.Description || '',
            quantity: parseFloat(row.Quantity) || 0,
            unitPrice: parseFloat(row.Price) || 0,
        })),
        sender: {
            name: firstRow.SenderName || '',
            address: firstRow.SenderAddress || '',
            phone: firstRow.SenderPhone || '',
        },
        recipient: {
            name: firstRow.RecipientName || '',
            address: firstRow.RecipientAddress || '',
            email: firstRow.RecipientEmail || '',
        },
        shipment: {
            date: firstRow.Date || new Date().toISOString().split('T')[0],
            orderNumber: firstRow.OrderNumber || '',
            poNumber: firstRow.PONumber || '',
            carrier: firstRow.Carrier || '',
            tracking: firstRow.TrackingNumber || '',
            shippingMethod: firstRow.ShippingMethod || '',
            weight: firstRow.Weight || '',
        },
        pageSize: 'A4' as const, // Default to A4 for bulk
        showSku: rows.some(r => r.SKU),
    };
};

const getOrderBucket = (count: number) => {
    if (count <= 3) return '1-3';
    if (count <= 10) return '4-10';
    if (count <= 25) return '11-25';
    if (count <= 50) return '26-50';
    return '51-100';
};

export const CsvBulkUpload = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const successLoggedRef = useRef<boolean>(false);

    const pathname = usePathname();
    const getLandingContext = () => {
        if (pathname === "/bulk-csv-packing-slip") return "bulk_landing";
        if (pathname === "/") return "home";
        if (pathname) return "tool_other";
        return "unknown";
    };

    const requiredColumns = [
        'OrderNumber',
        'SenderName',
        'SenderAddress',
        'RecipientName',
        'RecipientAddress',
        'Description',
        'Quantity',
        'Price'
    ];

    const sendTelemetry = async (payload: any) => {
        try {
            await fetch('/api/telemetry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'csv_bulk_generate',
                    ...payload
                })
            });
        } catch (e) {
            // Silent fail
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'bulk_csv_file_selected');
        }

        const startTime = performance.now();
        setIsLoading(true);
        setError(null);
        setStatus('Parsing CSV...');
        successLoggedRef.current = false;

        Papa.parse<CsvRow>(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                if (results.errors.length > 0) {
                    const msg = results.errors[0].message;
                    setError(`CSV Parsing Error: ${msg}`);
                    setIsLoading(false);
                    sendTelemetry({ success: false, error: msg });
                    return;
                }

                const rows = results.data;
                if (rows.length === 0) {
                    setError('CSV file is empty.');
                    setIsLoading(false);
                    sendTelemetry({ success: false, error: 'Empty file' });
                    return;
                }

                if (rows.length > 100) {
                    setError('Limit exceeded: Max 100 rows per batch.');
                    setIsLoading(false);
                    sendTelemetry({ success: false, error: 'Limit exceeded', rows_count: rows.length });
                    return;
                }

                // Validate headers
                const headers = results.meta.fields || [];
                const missingColumns = requiredColumns.filter(col => !headers.includes(col));
                if (missingColumns.length > 0) {
                    const msg = `Missing required columns: ${missingColumns.join(', ')}`;
                    setError(msg);
                    setIsLoading(false);
                    sendTelemetry({ success: false, error: msg });
                    return;
                }

                try {
                    // Group rows by OrderNumber
                    const groups: Record<string, CsvRow[]> = {};
                    rows.forEach(row => {
                        // Normalize key: Use default if missing, trim spaces
                        const key = row.OrderNumber ? row.OrderNumber.trim() : 'UNKNOWN_ORDER';
                        if (!groups[key]) {
                            groups[key] = [];
                        }
                        groups[key].push(row);
                    });

                    const groupKeys = Object.keys(groups);

                    const hasOptional = headers.some(h => !requiredColumns.includes(h));
                    // Event firing moved to completion success status below (analytics success)

                    setStatus(`Generating ${groupKeys.length} PDFs from ${rows.length} items...`);

                    const zipData: fflate.AsyncZippable = {};
                    const filenameCounts: Record<string, number> = {};

                    // Sequential generation to avoid memory spike suitable for client side
                    for (let i = 0; i < groupKeys.length; i++) {
                        const orderNum = groupKeys[i];
                        const groupRows = groups[orderNum];
                        const props = mapGroupToProps(groupRows);

                        // Generate PDF Blob -> ArrayBuffer -> Uint8Array
                        const blob = await pdf(<PackingSlipPDF {...props} />).toBlob();
                        const buffer = await blob.arrayBuffer();
                        const u8 = new Uint8Array(buffer as ArrayBuffer);

                        // Handle filename uniqueness
                        let baseName = orderNum !== 'UNKNOWN_ORDER' ? orderNum : `Order-Group-${i + 1}`;

                        // Sanitize filename
                        baseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');

                        if (filenameCounts[baseName]) {
                            filenameCounts[baseName]++;
                            baseName = `${baseName}_${filenameCounts[baseName]}`;
                        } else {
                            filenameCounts[baseName] = 1;
                        }

                        // Add to ZIP structure
                        zipData[`${baseName}.pdf`] = u8;
                        setStatus(`Processed ${i + 1}/${groupKeys.length} orders`);
                    }

                    setStatus('Zipping files...');

                    // Create ZIP
                    fflate.zip(zipData, (err, out) => {
                        if (err) {
                            console.error(err);
                            setError('Failed to zip files.');
                            setIsLoading(false);
                            sendTelemetry({ success: false, error: 'Zip failure' });
                            return;
                        }
                        const zipBlob = new Blob([out] as BlobPart[], { type: 'application/zip' });
                        saveAs(zipBlob, 'bulk-packing-slips.zip');
                        setStatus('Done! Download started.');
                        setIsLoading(false);

                        // Success Telemetry (Internal)
                        if (!successLoggedRef.current) {
                            logEventClient('bulk_csv_upload_success', {
                                tool_mode: 'bulk',
                                orders_count: groupKeys.length,
                                rows_count: rows.length,
                                order_size_bucket: getOrderBucket(groupKeys.length),
                                landing_context: getLandingContext()
                            });
                            successLoggedRef.current = true;
                        }

                        // Success Telemetry (External/Existing)
                        sendTelemetry({
                            success: true,
                            orders_count: groupKeys.length,
                            rows_count: rows.length,
                            file_size_bytes: out.length,
                            duration_ms: Math.round(performance.now() - startTime)
                        });

                        if (typeof window !== 'undefined' && (window as any).gtag) {
                            (window as any).gtag('event', 'bulk_csv_generate_success', {
                                orders_count: groupKeys.length,
                                rows_count: rows.length
                            });
                        }
                    });

                } catch (err: any) {
                    console.error(err);
                    const msg = err.message || 'Failed to generate ZIP.';
                    setError(msg);
                    setIsLoading(false);
                    sendTelemetry({ success: false, error: msg });
                }
            },
            error: (err) => {
                const msg = `Failed to read file: ${err.message}`;
                setError(msg);
                setIsLoading(false);
                sendTelemetry({ success: false, error: msg });
            }
        });
    };

    return (
        <section id="bulk-csv-upload" className="bg-gradient-to-br from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-900/50 border-t border-gray-200 dark:border-zinc-800 p-8 sm:p-10">
            <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                    Beta
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    Bulk CSV Upload
                </h3>
                <h2 className="text-lg font-medium text-blue-600 dark:text-blue-400 mb-2">
                    Bulk CSV Packing Slip Generator (Up to 100 Orders)
                </h2>
                <Link
                    href="/bulk-csv-packing-slip"
                    className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:underline mb-8 block transition-colors"
                >
                    View detailed instructions & features &rarr;
                </Link>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto">
                    Generate up to 100 packing slips instantly. Upload a CSV with your orders and get a ZIP file containing all PDFs.
                </p>

                {/* Format Instructions */}
                <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 p-5 rounded-lg border border-blue-100 dark:border-blue-800 text-sm text-left max-w-2xl mx-auto">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">CSV format requirements</h4>
                    <p className="text-blue-800 dark:text-blue-200 mb-3">
                        Upload a CSV file where each row represents one item.
                        Orders with the same <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">OrderNumber</code> will be combined into a single packing slip.
                    </p>
                    <div className="mb-4">
                        <span className="font-medium text-blue-900 dark:text-blue-100 block mb-1">Supported columns (recommended order):</span>
                        <div className="bg-white dark:bg-zinc-900 p-2 rounded border border-blue-200 dark:border-blue-800 overflow-x-auto">
                            <code className="text-xs text-blue-700 dark:text-blue-300 whitespace-nowrap">
                                OrderNumber, SenderName, SenderAddress, SenderPhone, RecipientName, RecipientAddress, RecipientEmail, Date, PONumber, ShippingMethod, Carrier, TrackingNumber, Weight, SKU, Description, Quantity, Price
                            </code>
                        </div>
                        <p className="text-xs text-blue-800 dark:text-blue-200 mt-2 italic">
                            Only OrderNumber, SenderName, SenderAddress, RecipientName, RecipientAddress, Description, Quantity, Price are required. All other fields are optional.
                        </p>
                    </div>
                    <a
                        href="/sample-bulk-orders.csv"
                        download
                        className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-medium hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                            <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                        </svg>
                        Download sample CSV
                    </a>
                </div>

                <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group">
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600 dark:text-blue-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="csv-upload" className="cursor-pointer">
                                <span className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold shadow-sm transition-all inline-block hover:scale-105 active:scale-95">
                                    {isLoading ? 'Processing...' : 'Select CSV File'}
                                </span>
                                <input
                                    id="csv-upload"
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    disabled={isLoading}
                                    className="hidden"
                                />
                            </label>

                            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 space-y-1 text-left max-w-xs mx-auto">
                                <p>• One row = one item</p>
                                <p>• Same OrderNumber = grouped into one PDF</p>
                                <p>• Up to 100 orders per upload</p>
                                <p>• Output is a ZIP containing all PDFs</p>
                            </div>

                            <a
                                href="/sample-bulk-orders.csv"
                                download
                                className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm"
                            >
                                Download sample CSV (up to 100 orders)
                            </a>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                {status && !error && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-sm rounded-lg font-medium animate-pulse">
                        {status}
                    </div>
                )}
            </div>

            {/* Local FAQ */}
            <div className="max-w-3xl mx-auto mt-12 text-left border-t border-gray-200 dark:border-zinc-800 pt-8">
                <h4 className="font-bold text-gray-900 dark:text-white mb-6">Common Questions</h4>
                <div className="grid gap-6 sm:grid-cols-3">
                    <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">How many orders?</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Upload up to 100 orders at once in a single CSV file.</p>
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">Empty fields?</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Optional fields like SKU can be left blank. Required fields must be filled.</p>
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">Multiple items?</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Yes! Use the same OrderNumber for multiple rows to group them.</p>
                    </div>
                </div>
            </div>
        </section >
    );
};
