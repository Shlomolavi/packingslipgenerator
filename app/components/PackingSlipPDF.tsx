import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register a standard font (optional, but good for consistency)
// For now relying on default Helvetica which is standard for PDF

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
        fontSize: 10,
        padding: 40, // More generous margin (similar to web UI padding)
        color: '#111827', // Gray-900
    },
    header: {
        backgroundColor: '#2563EB', // Blue-600
        color: 'white',
        padding: 24, // Matching UI p-8 (approx 32px, simplified to 24pt for PDF scale)
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 24, // Matching UI text-3xl
        fontWeight: 'bold',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 10,
        color: '#DBEAFE', // Blue-100
    },
    section: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        gap: 30, // Increased gap for better visual separation
    },
    column: {
        flex: 1,
        flexDirection: 'column',
    },
    sectionTitle: {
        fontSize: 12, // text-xl is bigger, but 12pt is standard for PDF headers. Let's start with 14pt parity.
        fontWeight: 'bold',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB', // Gray-200
        marginBottom: 8,
        paddingBottom: 4,
        color: '#1F2937', // Gray-800
    },
    textLabel: {
        fontSize: 8, // text-sm
        color: '#374151', // Gray-700
        marginBottom: 2,
        fontWeight: 'medium',
    },
    textValue: {
        fontSize: 10,
        marginBottom: 8,
        lineHeight: 1.4,
    },
    // Table Styles
    table: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderTopLeftRadius: 6, // Matching rounded-lg
        borderTopRightRadius: 6,
        borderBottomRightRadius: 6,
        borderBottomLeftRadius: 6,
        overflow: 'hidden', // simulates rounded corners clipping
        marginTop: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6', // Gray-100
        minHeight: 30,
        alignItems: 'center',
    },
    tableHeader: {
        backgroundColor: '#F9FAFB', // Gray-50
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    tableCellHeader: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#4B5563', // Gray-600
        padding: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tableCell: {
        fontSize: 10,
        padding: 10,
        color: '#111827',
    },
    // Columns widths - Dynamic via props

    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 10,
        textAlign: 'center',
        color: '#9CA3AF', // Gray-400
        fontSize: 8,
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 12,
        paddingRight: 10,
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 10,
        color: '#111827',
    },
    totalValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2563EB', // Blue-600
    }
});

// Helper for currency formatting
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

interface Item {
    id: string;
    sku?: string;
    description: string;
    quantity: number; // PDF always receives parsed numbers
    unitPrice: number;
}

interface PackingSlipPDFProps {
    items: Item[];
    sender: {
        name: string;
        address: string;
        phone: string;
    };
    recipient: {
        name: string;
        address: string;
        email: string;
    };
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

    // Dynamic Column Widths
    const colSku = { width: '15%' };
    const colDesc = { width: showSku ? '30%' : '45%' };
    const colQty = { width: '15%', textAlign: 'center' as const };
    const colPrice = { width: '20%', textAlign: 'right' as const };
    const colTotal = { width: '20%', textAlign: 'right' as const };

    return (
        <Document>
            <Page size={pageSize} style={styles.page}>

                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Packing Slip Generator</Text>
                        <Text style={styles.headerSubtitle}>Create and print professional packing slips.</Text>
                    </View>
                </View>

                {/* Sender & Recipient Grid */}
                <View style={styles.row}>
                    {/* Sender */}
                    <View style={styles.column}>
                        <Text style={styles.sectionTitle}>Sender (From)</Text>
                        <View>
                            <Text style={styles.textLabel}>Company Name / Name</Text>
                            <Text style={styles.textValue}>{sender.name || '-'}</Text>
                        </View>
                        <View>
                            <Text style={styles.textLabel}>Address</Text>
                            <Text style={styles.textValue}>{sender.address || '-'}</Text>
                        </View>
                        <View>
                            <Text style={styles.textLabel}>Phone</Text>
                            <Text style={styles.textValue}>{sender.phone || '-'}</Text>
                        </View>
                    </View>

                    {/* Recipient */}
                    <View style={styles.column}>
                        <Text style={styles.sectionTitle}>Recipient (To)</Text>
                        <View>
                            <Text style={styles.textLabel}>Customer / Company Name</Text>
                            <Text style={styles.textValue}>{recipient.name || '-'}</Text>
                        </View>
                        <View>
                            <Text style={styles.textLabel}>Shipping Address</Text>
                            <Text style={styles.textValue}>{recipient.address || '-'}</Text>
                        </View>
                        <View>
                            <Text style={styles.textLabel}>Email</Text>
                            <Text style={styles.textValue}>{recipient.email || '-'}</Text>
                        </View>
                    </View>
                </View>

                {/* Shipment Details */}
                <View style={[styles.section, { marginTop: 10 }]}>
                    <Text style={styles.sectionTitle}>Shipment Details</Text>
                    {/* Row 1 */}
                    <View style={styles.row}>
                        <View style={styles.column}>
                            <Text style={styles.textLabel}>Date</Text>
                            <Text style={styles.textValue}>{shipment.date || '-'}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.textLabel}>Order Number</Text>
                            <Text style={styles.textValue}>{shipment.orderNumber || '-'}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.textLabel}>PO Number</Text>
                            <Text style={styles.textValue}>{shipment.poNumber || '-'}</Text>
                        </View>
                    </View>
                    {/* Row 2 - Extra Fields */}
                    <View style={[styles.row, { marginTop: 10 }]}>
                        <View style={styles.column}>
                            <Text style={styles.textLabel}>Carrier</Text>
                            <Text style={styles.textValue}>{shipment.carrier || '-'}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.textLabel}>Method</Text>
                            <Text style={styles.textValue}>{shipment.shippingMethod || '-'}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.textLabel}>Tracking</Text>
                            <Text style={styles.textValue}>{shipment.tracking || '-'}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.textLabel}>Weight</Text>
                            <Text style={styles.textValue}>{shipment.weight || '-'}</Text>
                        </View>
                    </View>
                </View>

                {/* Items Table */}
                <View>
                    <Text style={styles.sectionTitle}>Packing List</Text>
                </View>

                <View style={styles.table}>
                    {/* Table Header */}
                    <View style={[styles.tableRow, styles.tableHeader]} fixed>
                        {showSku && <Text style={[styles.tableCellHeader, colSku]}>SKU</Text>}
                        <Text style={[styles.tableCellHeader, colDesc]}>Description</Text>
                        <Text style={[styles.tableCellHeader, colQty]}>Qty</Text>
                        <Text style={[styles.tableCellHeader, colPrice]}>Unit Price</Text>
                        <Text style={[styles.tableCellHeader, colTotal]}>Total</Text>
                    </View>

                    {/* Table Rows */}
                    {items.map((item, index) => (
                        <View key={item.id} style={styles.tableRow} wrap={false}>
                            {showSku && <Text style={[styles.tableCell, colSku]}>{item.sku || '-'}</Text>}
                            <Text style={[styles.tableCell, colDesc]}>{item.description}</Text>
                            <Text style={[styles.tableCell, colQty]}>{item.quantity}</Text>
                            <Text style={[styles.tableCell, colPrice]}>{formatCurrency(item.unitPrice)}</Text>
                            <Text style={[styles.tableCell, colTotal]}>{formatCurrency(item.quantity * item.unitPrice)}</Text>
                        </View>
                    ))}
                </View>

                {/* Total */}
                <View style={styles.totalSection}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
                </View>

                {/* Notes Section - Renders only if notes exist */}
                {notes && (
                    <View style={[styles.section, { marginTop: 24, borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12 }]}>
                        <Text style={[styles.sectionTitle, { borderBottomWidth: 0, fontSize: 10, color: '#4B5563' }]}>Notes & Instructions</Text>
                        <Text style={[styles.textValue, { color: '#6B7280', fontSize: 9 }]}>{notes}</Text>
                    </View>
                )}

                {/* Footer */}
                <Text style={styles.footer} fixed>
                    © {new Date().getFullYear()} Packing Slip Generator.
                </Text>

            </Page>
        </Document>
    );
};
