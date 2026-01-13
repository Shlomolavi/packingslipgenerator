"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { PackingSlipPDF } from "./components/PackingSlipPDF";

// Dynamically import PDFDownloadLink to avoid SSR issues
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => null,
  }
);

interface Item {
  id: string;
  sku?: string;
  description: string;
  quantity: string | number; // Allow string to support raw input like "1." or ""
  unitPrice: string | number;
}

// Helper to safely parse numbers for calculations
const parseNumber = (val: string | number): number => {
  if (typeof val === 'number') return val;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
};

// Helper to format currency for Display only
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([
    { id: "1", sku: "", description: "", quantity: 1, unitPrice: 0 },
  ]);

  // Page Size State with Persistence
  const [pageSize, setPageSize] = useState<'A4' | 'LETTER'>('A4');
  const [showSku, setShowSku] = useState(false);

  // Form States
  const [sender, setSender] = useState({ name: "", address: "", phone: "" });
  const [recipient, setRecipient] = useState({ name: "", address: "", email: "" });
  const [shipment, setShipment] = useState({
    date: "",
    orderNumber: "",
    poNumber: "",
    carrier: "",
    tracking: "",
    shippingMethod: "",
    weight: ""
  });
  const [notes, setNotes] = useState("");

  const [isClient, setIsClient] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Undo State
  const [deletedItem, setDeletedItem] = useState<{ item: Item, index: number } | null>(null);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Focus Ref
  const lastItemDescRef = useRef<HTMLInputElement>(null);
  const prevItemsLength = useRef(items.length);

  // Load persistence
  useEffect(() => {
    setIsClient(true);

    // Page Size
    const savedSize = localStorage.getItem('packingSlip_pageSize');
    if (savedSize === 'LETTER') {
      setPageSize('LETTER');
    }

    // SKU setting
    const savedSku = localStorage.getItem('packingSlip_showSku');
    if (savedSku === 'true') {
      setShowSku(true);
    }

    // Form Data
    const savedData = localStorage.getItem('packingSlip_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.sender) setSender(parsed.sender);
        if (parsed.recipient) setRecipient(parsed.recipient);
        if (parsed.shipment) setShipment(parsed.shipment);
        if (parsed.items) setItems(parsed.items);
        if (parsed.notes) setNotes(parsed.notes);
      } catch (error) {
        console.error("Failed to load saved data:", error);
      }
    }
  }, []);

  // Save persistence
  useEffect(() => {
    if (!isClient) return;
    const data = { sender, recipient, shipment, items, notes };
    localStorage.setItem('packingSlip_data', JSON.stringify(data));
  }, [sender, recipient, shipment, items, notes, isClient]);

  // Handle Focus on new item
  useEffect(() => {
    if (items.length > prevItemsLength.current) {
      // Item added
      setTimeout(() => {
        lastItemDescRef.current?.focus();
      }, 0);
    }
    prevItemsLength.current = items.length;
  }, [items.length]);

  // Save pageSize on change
  const handlePageSizeChange = (size: 'A4' | 'LETTER') => {
    setPageSize(size);
    localStorage.setItem('packingSlip_pageSize', size);
  };

  const handleToggleSku = () => {
    const newVal = !showSku;
    setShowSku(newVal);
    localStorage.setItem('packingSlip_showSku', String(newVal));
  };

  const handleClearForm = () => {
    if (window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      setItems([{ id: crypto.randomUUID(), sku: "", description: "", quantity: 1, unitPrice: 0 }]);
      setSender({ name: "", address: "", phone: "" });
      setRecipient({ name: "", address: "", email: "" });
      setShipment({
        date: "",
        orderNumber: "",
        poNumber: "",
        carrier: "",
        tracking: "",
        shippingMethod: "",
        weight: ""
      });
      setNotes("");
      localStorage.removeItem('packingSlip_data');
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: crypto.randomUUID(), sku: "", description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const handleRemoveItem = (id: string, index: number) => {
    const itemToRemove = items.find(i => i.id === id);
    if (!itemToRemove) return;

    // Save for undo
    setDeletedItem({ item: itemToRemove, index });

    // Clear previous timeout if any
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);

    // Auto-dismiss undo after 5 seconds
    undoTimeoutRef.current = setTimeout(() => {
      setDeletedItem(null);
    }, 5000);

    setItems(items.filter((item) => item.id !== id));
  };

  const handleUndoDelete = () => {
    if (!deletedItem) return;

    const newItems = [...items];
    newItems.splice(deletedItem.index, 0, deletedItem.item);
    setItems(newItems);
    setDeletedItem(null);
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
  };

  const handleItemChange = (
    id: string,
    field: keyof Item,
    value: string | number
  ) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Prepare items for PDF (ensure they are numbers)
  const pdfItems = items.map(item => ({
    ...item,
    quantity: parseNumber(item.quantity),
    unitPrice: parseNumber(item.unitPrice)
  }));

  const grandTotal = items.reduce((sum, item) => sum + (parseNumber(item.quantity) * parseNumber(item.unitPrice)), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 p-6 sm:p-12 font-sans text-gray-900 dark:text-gray-100 relative">
      <main className="max-w-5xl mx-auto bg-white dark:bg-zinc-900 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 pb-20">

        {/* Header Section */}
        <header className="bg-blue-600 dark:bg-blue-700 p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Packing Slip Generator</h1>
            <p className="text-blue-100 mt-2">Create and print professional packing slips.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">

            {/* Controls Group */}
            <div className="flex items-center gap-3">
              {/* Page Size Selector */}
              <div className="flex items-center gap-1 bg-blue-700/50 rounded-lg p-1 border border-blue-500/30">
                <button
                  type="button"
                  onClick={() => handlePageSizeChange('A4')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${pageSize === 'A4' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-100 hover:bg-blue-600/50'}`}
                >
                  A4
                </button>
                <button
                  type="button"
                  onClick={() => handlePageSizeChange('LETTER')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${pageSize === 'LETTER' ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-100 hover:bg-blue-600/50'}`}
                >
                  Letter
                </button>
              </div>

              {/* Clear Button */}
              <button
                type="button"
                onClick={handleClearForm}
                className="text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
              >
                Clear Form
              </button>
            </div>

            {/* Download Button Area */}
            <div className="flex flex-col items-center">
              {isClient ? (
                <PDFDownloadLink
                  document={
                    <PackingSlipPDF
                      items={pdfItems}
                      sender={sender}
                      recipient={recipient}
                      shipment={shipment}
                      notes={notes}
                      pageSize={pageSize}
                      showSku={showSku}
                    />
                  }
                  onError={(error: any) => setPdfError(error.message || 'Failed to generate PDF')}
                  fileName={`packing-slip-${shipment.orderNumber || 'draft'}.pdf`}
                  className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-2.5 rounded-full font-bold shadow-lg shadow-blue-900/20 transition-all hover:scale-105 active:scale-95 data-[loading]:opacity-80 data-[loading]:cursor-wait whitespace-nowrap min-w-[160px] text-center"
                >
                  {({ loading }: { loading: boolean }) =>
                    loading ? 'Generating...' : 'Download PDF'
                  }
                </PDFDownloadLink>
              ) : (
                <button type="button" className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-2.5 rounded-full font-bold shadow-sm transition-colors cursor-not-allowed opacity-80 min-w-[160px]" disabled>
                  Download PDF
                </button>
              )}
              {pdfError && (
                <span className="text-xs text-red-200 mt-1 bg-red-900/30 px-2 py-0.5 rounded">
                  Error: {pdfError}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Form Container */}
        <div className="p-8 sm:p-10">
          <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>

            {/* Top Grid: Sender & Receiver */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

              {/* Sender Details */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-zinc-700 pb-2">
                  Sender (From)
                </h2>
                <div className="grid gap-4">
                  <div>
                    <label htmlFor="fromName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name / Name</label>
                    <input
                      type="text"
                      id="fromName"
                      placeholder="Your Company Inc."
                      value={sender.name}
                      onChange={(e) => setSender({ ...sender, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="fromAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                    <textarea
                      id="fromAddress"
                      rows={3}
                      placeholder="123 Shipper Way&#10;Logistics City, ST 12345"
                      value={sender.address}
                      onChange={(e) => setSender({ ...sender, address: e.target.value })}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="fromPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone (Optional)</label>
                    <input
                      type="tel"
                      id="fromPhone"
                      placeholder="(555) 123-4567"
                      value={sender.phone}
                      onChange={(e) => setSender({ ...sender, phone: e.target.value })}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </section>

              {/* Receiver Details */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-zinc-700 pb-2">
                  Recipient (To)
                </h2>
                <div className="grid gap-4">
                  <div>
                    <label htmlFor="toName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer / Company Name</label>
                    <input
                      type="text"
                      id="toName"
                      placeholder="Client Corp."
                      value={recipient.name}
                      onChange={(e) => setRecipient({ ...recipient, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="toAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shipping Address</label>
                    <textarea
                      id="toAddress"
                      rows={3}
                      placeholder="789 Receiver Blvd&#10;Delivery Town, ST 67890"
                      value={recipient.address}
                      onChange={(e) => setRecipient({ ...recipient, address: e.target.value })}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="toEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      id="toEmail"
                      placeholder="contact@client.com"
                      value={recipient.email}
                      onChange={(e) => setRecipient({ ...recipient, email: e.target.value })}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Shipment Meta Data */}
            <section className="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Shipment Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label htmlFor="orderDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input
                    type="date"
                    id="orderDate"
                    value={shipment.date}
                    onChange={(e) => setShipment({ ...shipment, date: e.target.value })}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order Number</label>
                  <input
                    type="text"
                    id="orderNumber"
                    placeholder="#ORD-2025-001"
                    value={shipment.orderNumber}
                    onChange={(e) => setShipment({ ...shipment, orderNumber: e.target.value })}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="poNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PO Number</label>
                  <input
                    type="text"
                    id="poNumber"
                    placeholder="PO-998877"
                    value={shipment.poNumber}
                    onChange={(e) => setShipment({ ...shipment, poNumber: e.target.value })}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="shippingMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shipping Method</label>
                  <input
                    type="text"
                    id="shippingMethod"
                    placeholder="Ground / Express"
                    value={shipment.shippingMethod}
                    onChange={(e) => setShipment({ ...shipment, shippingMethod: e.target.value })}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="carrier" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Carrier</label>
                  <input
                    type="text"
                    id="carrier"
                    placeholder="FedEx / UPS / USPS"
                    value={shipment.carrier}
                    onChange={(e) => setShipment({ ...shipment, carrier: e.target.value })}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="tracking" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tracking Number</label>
                  <input
                    type="text"
                    id="tracking"
                    placeholder="1Z999..."
                    value={shipment.tracking}
                    onChange={(e) => setShipment({ ...shipment, tracking: e.target.value })}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Weight</label>
                  <input
                    type="text"
                    id="weight"
                    placeholder="5 lbs / 2 kg"
                    value={shipment.weight}
                    onChange={(e) => setShipment({ ...shipment, weight: e.target.value })}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Items Section */}
            <section className="pt-6">
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Packing List</h2>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-gray-400 select-none">
                  <input
                    type="checkbox"
                    checked={showSku}
                    onChange={handleToggleSku}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Show SKU Column
                </label>
              </div>

              <div className="overflow-x-auto border border-gray-200 dark:border-zinc-700 rounded-lg">
                <table className="w-full text-left bg-white dark:bg-zinc-900/50 text-sm">
                  <thead className="bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 uppercase tracking-wider font-semibold">
                    <tr>
                      {showSku && <th className="px-4 py-3 w-32">SKU</th>}
                      <th className="px-4 py-3 min-w-[200px]">Description</th>
                      <th className="px-4 py-3 w-24 text-center">Qty</th>
                      <th className="px-4 py-3 w-32 text-right">Unit Price</th>
                      <th className="px-4 py-3 w-32 text-right">Total</th>
                      <th className="px-4 py-3 w-16 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
                    {items.map((item, index) => (
                      <tr key={item.id} className="group hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                        {showSku && (
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={item.sku || ""}
                              onChange={(e) => handleItemChange(item.id, "sku", e.target.value)}
                              placeholder="SKU-123"
                              className="w-full bg-transparent border-none focus:ring-0 p-1 placeholder-gray-400 dark:placeholder-gray-600"
                            />
                          </td>
                        )}
                        <td className="px-4 py-2">
                          <input
                            ref={index === items.length - 1 ? lastItemDescRef : null}
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                            placeholder="Item description"
                            className="w-full bg-transparent border-none focus:ring-0 p-1 placeholder-gray-400 dark:placeholder-gray-600"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)}
                            className="w-full text-center bg-transparent border-none focus:ring-0 p-1 appearance-none"
                          />
                        </td>
                        <td className="px-4 py-2 text-right">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(item.id, "unitPrice", e.target.value)}
                            className="w-full text-right bg-transparent border-none focus:ring-0 p-1 appearance-none"
                          />
                        </td>
                        <td className="px-4 py-2 text-right font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(parseNumber(item.quantity) * parseNumber(item.unitPrice))}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id, index)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            aria-label="Remove item"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add Item
                </button>

                <div className="text-right">
                  {items.length > 0 && (
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      Total: <span className="text-blue-600 dark:text-blue-400">
                        {formatCurrency(grandTotal)}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Notes Section */}
            <section className="pt-6 border-t border-gray-100 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Notes & Instructions (Optional)</h2>
              <textarea
                rows={4}
                placeholder="Thank you for your business! &#10;Delivery Instructions: Gate code 1234."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-y"
              />
            </section>

          </form>
        </div>
      </main>

      {/* Undo Toast */}
      {deletedItem && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-gray-900 dark:bg-zinc-800 text-white px-5 py-3 rounded-full shadow-xl flex items-center gap-4 border border-gray-700">
            <span className="text-sm">Item deleted</span>
            <button
              onClick={handleUndoDelete}
              className="text-blue-400 hover:text-blue-300 font-semibold text-sm transition-colors"
            >
              Undo
            </button>
            <button
              onClick={() => {
                setDeletedItem(null);
                if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
              }}
              className="text-gray-500 hover:text-gray-300 ml-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <footer className="max-w-5xl mx-auto mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} Packing Slip Generator. All rights reserved.</p>
      </footer>
    </div>
  );
}
