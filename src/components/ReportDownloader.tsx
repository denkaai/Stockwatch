"use client";

import { jsPDF } from "jspdf";

interface ReportItem {
    name: string;
    added: number;
    used: number;
    balance: number;
    unit: string;
}

export default function ReportDownloader({ data, hotelName }: { data: ReportItem[], hotelName: string }) {
    const downloadPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(194, 65, 12); // Primary color
        doc.text("StockWatch Report", 20, 20);

        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139);
        doc.text(`Hotel: ${hotelName}`, 20, 30);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 37);

        // Table
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text("Stock Summary", 20, 55);

        let y = 65;
        doc.setFontSize(10);
        doc.text("Item Name", 20, y);
        doc.text("Added", 80, y);
        doc.text("Used", 110, y);
        doc.text("Balance", 140, y);

        doc.line(20, y + 2, 190, y + 2);
        y += 10;

        data.forEach(item => {
            doc.text(item.name, 20, y);
            doc.text(`${item.added} ${item.unit}`, 80, y);
            doc.text(`${item.used} ${item.unit}`, 110, y);
            doc.text(`${item.balance} ${item.unit}`, 140, y);
            y += 8;
        });

        // Branding Footer
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(8);
        doc.text("Copyright © 2026 Denkaai. All rights reserved.", 20, 280);
        doc.text("Designed and developed by Denkaai.", 20, 285);

        doc.save(`StockWatch_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <button onClick={downloadPDF} className="btn btn-primary">
            Download PDF Report
        </button>
    );
}
