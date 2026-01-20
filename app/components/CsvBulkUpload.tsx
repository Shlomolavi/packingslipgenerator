import React, { useState } from 'react';
import Papa from 'papaparse';
import * as fflate from 'fflate';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { PackingSlipPDF } from './PackingSlipPDF';

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
    Tracking?: string;
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
            tracking: firstRow.Tracking || '',
            shippingMethod: '',
            weight: '',
        },
        pageSize: 'A4' as const, // Default to A4 for bulk
        showSku: rows.some(r => r.SKU),
    };
};

export const CsvBulkUpload = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);

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

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);
        setStatus('Parsing CSV...');

        Papa.parse<CsvRow>(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                if (results.errors.length > 0) {
                    setError(`CSV Parsing Error: ${results.errors[0].message}`);
                    setIsLoading(false);
                    return;
                }

                const rows = results.data;
                if (rows.length === 0) {
                    setError('CSV file is empty.');
                    setIsLoading(false);
                    return;
                }

                if (rows.length > 100) {
                    setError('Limit exceeded: Max 100 rows per batch.');
                    setIsLoading(false);
                    return;
                }

                // Validate headers
                const headers = results.meta.fields || [];
                const missingColumns = requiredColumns.filter(col => !headers.includes(col));
                if (missingColumns.length > 0) {
                    setError(`Missing required columns: ${missingColumns.join(', ')}`);
                    setIsLoading(false);
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
                            return;
                        }
                        const zipBlob = new Blob([out] as BlobPart[], { type: 'application/zip' });
                        saveAs(zipBlob, 'bulk-packing-slips.zip');
                        setStatus('Done! Download started.');
                        setIsLoading(false);
                    });

                } catch (err: any) {
                    console.error(err);
                    setError(err.message || 'Failed to generate ZIP.');
                    setIsLoading(false);
                }
            },
            error: (err) => {
                setError(`Failed to read file: ${err.message}`);
                setIsLoading(false);
            }
        });
    };

    return (
        <section className="bg-gradient-to-br from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-900/50 border-t border-gray-200 dark:border-zinc-800 p-8 sm:p-10">
            <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                    Beta
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Bulk CSV Upload
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto">
                    Generate up to 100 packing slips instantly. Upload a CSV with your orders and get a ZIP file containing all PDFs.
                </p>

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
                            <p className="text-xs text-gray-400 mt-2">
                                Supported columns: OrderNumber, SenderName, RecipientName...
                            </p>
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
        </section>
    );
};
