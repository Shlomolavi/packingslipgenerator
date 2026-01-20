import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
        fontSize: 10,
        padding: 40,
        color: '#111827',
    },
    // Compact Header
    header: {
        backgroundColor: '#2563EB',
        color: 'white',
        paddingHorizontal: 24,
        paddingVertical: 16, // Reduced height
        marginBottom: 20,
        borderRadius: 4, // Subtle polish
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18, // Reduced from 24
        fontWeight: 'bold',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 9,
        color: '#DBEAFE',
        opacity: 0.9,
    },
    // Sections
    section: {
        marginBottom: 16, // Tighter spacing
    },
    row: {
        flexDirection: 'row',
        gap: 24,
    },
    column: {
        flex: 1,
        flexDirection: 'column',
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#374151',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        marginBottom: 6,
        paddingBottom: 2,
    },
    // Typography Hierarchy
    textLabel: {
        fontSize: 8,
        color: '#6B7280', // Lighter for labels
        marginBottom: 1,
        textTransform: 'uppercase',
        fontWeight: 'bold',
    },
    textValue: {
        fontSize: 10,
        color: '#111827', // Darker for values
        marginBottom: 8,
        lineHeight: 1.3,
        fontFamily: 'Helvetica-Bold', // Slight emphasis
    },
    textValuePlain: { // Non-bold value for longer text
        fontSize: 10,
        color: '#111827',
        marginBottom: 8,
        lineHeight: 1.3,
    },
    // Table
    table: {
        display: 'flex',
        width: 'auto',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
        marginTop: 8,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        minHeight: 24, // Compact rows
        alignItems: 'center',
    },
    tableHeader: {
        backgroundColor: '#F9FAFB',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    tableCellHeader: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#4B5563',
        padding: 6,
        textTransform: 'uppercase',
    },
    tableCell: {
        fontSize: 9,
        padding: 6,
        color: '#1F2937',
    },
    // Footer & Totals
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 12,
        paddingRight: 6,
    },
    totalLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        marginRight: 12,
        color: '#374151',
    },
    totalValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2563EB',
    },
    footer: {
        position: 'absolute',
        bottom: 24,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 8,
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 8,
    },
});

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

// Sanitization: Replace newlines with comma+space to prevent rendering issues
const formatLines = (text?: string) => {
    if (!text) return '-';
    return text.replace(/\n/g, ', ').trim();
};

interface Item {
    id: string;
    sku?: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

interface PackingSlipPDFProps {
    items: Item[];
    sender: { name: string; address: string; phone: string; };
    recipient: { name: string; address: string; email: string; };
    shipment: {
        date: string;
        orderNumber: string;
        poNumber: string;
        carrier?: string;
        shippingMethod?: string;
        tracking?: string;
        weight?: string;
    };
    pageSize: 'A4' | 'LETTER';
    showSku?: boolean;
    notes?: string;
}

export const PackingSlipPDF = ({ items, sender, recipient, shipment, pageSize, showSku, notes }: PackingSlipPDFProps) => {
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    // Columns
    const colSku = { width: '15%' };
    const colDesc = { width: showSku ? '35%' : '50%' };
    const colQty = { width: '10%', textAlign: 'right' as const };
    const colPrice = { width: '20%', textAlign: 'right' as const };
    const colTotal = { width: '20%', textAlign: 'right' as const };

    return (
        <Document>
            <Page size={pageSize} style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Packing Slip</Text>
                        <Text style={styles.headerSubtitle}>Order #{shipment.orderNumber || 'Draft'}</Text>
                    </View>
                    <View>
                        <Text style={{ color: 'white', fontSize: 10, opacity: 0.9 }}>{shipment.date}</Text>
                    </View>
                </View>

                {/* Sender & Recipient */}
                <View style={styles.row}>
                    <View style={styles.column}>
                        <Text style={styles.sectionTitle}>Sender (From)</Text>
                        <View>
                            <Text style={styles.textLabel}>Name</Text>
                            <Text style={styles.textValue}>{sender.name || '-'}</Text>
                        </View>
                        <View>
                            <Text style={styles.textLabel}>Address</Text>
                            <Text style={styles.textValuePlain}>{formatLines(sender.address)}</Text>
                        </View>
                        <View>
                            <Text style={styles.textLabel}>Phone</Text>
                            <Text style={styles.textValue}>{sender.phone || '-'}</Text>
                        </View>
                    </View>

                    <View style={styles.column}>
                        <Text style={styles.sectionTitle}>Recipient (To)</Text>
                        <View>
                            <Text style={styles.textLabel}>Name</Text>
                            <Text style={styles.textValue}>{recipient.name || '-'}</Text>
                        </View>
                        <View>
                            <Text style={styles.textLabel}>Address</Text>
                            <Text style={styles.textValuePlain}>{formatLines(recipient.address)}</Text>
                        </View>
                        <View>
                            <Text style={styles.textLabel}>Email</Text>
                            <Text style={styles.textValue}>{recipient.email || '-'}</Text>
                        </View>
                    </View>
                </View>

                {/* Shipment Details */}
                <View style={[styles.section, { marginTop: 12 }]}>
                    <Text style={styles.sectionTitle}>Shipment Details</Text>
                    <View style={styles.row}>
                        <View style={styles.column}>
                            <Text style={styles.textLabel}>Order #</Text>
                            <Text style={styles.textValue}>{shipment.orderNumber || '-'}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.textLabel}>PO Number</Text>
                            <Text style={styles.textValue}>{shipment.poNumber || '-'}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.textLabel}>Carrier</Text>
                            <Text style={styles.textValue}>{shipment.carrier || '-'}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.textLabel}>Tracking</Text>
                            <Text style={styles.textValue}>{shipment.tracking || '-'}</Text>
                        </View>
                    </View>
                </View>

                {/* Items Table */}
                <View style={{ marginTop: 4 }}>
                    <Text style={styles.sectionTitle}>Packing List</Text>
                    <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableHeader]} fixed>
                            {showSku && <Text style={[styles.tableCellHeader, colSku]}>SKU</Text>}
                            <Text style={[styles.tableCellHeader, colDesc]}>Item Description</Text>
                            <Text style={[styles.tableCellHeader, colQty]}>Qty</Text>
                            <Text style={[styles.tableCellHeader, colPrice]}>Price</Text>
                            <Text style={[styles.tableCellHeader, colTotal]}>Total</Text>
                        </View>
                        {items.map((item) => (
                            <View key={item.id} style={styles.tableRow} wrap={false}>
                                {showSku && <Text style={[styles.tableCell, colSku]}>{item.sku || '-'}</Text>}
                                <Text style={[styles.tableCell, colDesc]}>{item.description}</Text>
                                <Text style={[styles.tableCell, colQty]}>{item.quantity}</Text>
                                <Text style={[styles.tableCell, colPrice]}>{formatCurrency(item.unitPrice)}</Text>
                                <Text style={[styles.tableCell, colTotal]}>{formatCurrency(item.quantity * item.unitPrice)}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Total */}
                <View style={styles.totalSection}>
                    <Text style={styles.totalLabel}>Grand Total:</Text>
                    <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
                </View>

                {/* Notes */}
                {notes && (
                    <View style={[styles.section, { marginTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 }]}>
                        <Text style={[styles.textLabel, { marginBottom: 4 }]}>Notes & Instructions</Text>
                        <Text style={[styles.textValuePlain, { fontSize: 9, color: '#4B5563' }]}>{formatLines(notes)}</Text>
                    </View>
                )}

                {/* Footer */}
                <Text style={styles.footer} fixed>
                    Thank you for your business!
                </Text>
            </Page>
        </Document>
    );
};
