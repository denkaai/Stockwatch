import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ReportDownloader from "@/components/ReportDownloader";

export default async function ReportsPage() {
    const session = await auth();
    if ((session?.user as any).role !== "OWNER") {
        redirect("/dashboard");
    }

    const hotelId = (session?.user as any).hotelId;

    // Fetch summary data
    const items = await prisma.stockItem.findMany({
        where: { hotelId },
        include: { entries: true, usages: true }
    });

    const reportData = items.map((item: any) => {
        const totalAdded = item.entries.reduce((sum: number, e: any) => sum + e.quantity, 0);
        const totalUsed = item.usages.reduce((sum: number, u: any) => sum + u.quantity, 0);
        return {
            name: item.name,
            added: totalAdded,
            used: totalUsed,
            balance: totalAdded - totalUsed,
            unit: item.unit,
            buyingPrice: item.buyingPrice,
            addedCost: item.entries.reduce((sum: number, e: any) => sum + (e.unitPrice * e.quantity), 0),
            usedCost: item.usages.reduce((sum: number, u: any) => sum + u.costOfUsage, 0),
        };
    });

    // Totals
    const totalStockValue = reportData.reduce((s, r) => s + (r.balance * r.buyingPrice), 0);
    const totalAddedCost = reportData.reduce((s, r) => s + r.addedCost, 0);
    const totalUsedCost = reportData.reduce((s, r) => s + r.usedCost, 0);
    const estimatedLoss = totalUsedCost * 0.05;

    // Recent entries with supplier info
    const recentEntries = await prisma.stockEntry.findMany({
        where: { hotelId },
        include: { item: true },
        orderBy: { createdAt: "desc" },
        take: 10,
    });

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1>📈 Business Reports</h1>
                <ReportDownloader data={reportData} hotelName={(session?.user as any)?.hotelName || "Hotel"} />
            </div>

            {/* Financial Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
                <div className="card" style={{ padding: "1rem", borderLeft: "4px solid #22c55e" }}>
                    <p style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase" }}>Stock Value</p>
                    <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#22c55e" }}>KES {totalStockValue.toLocaleString()}</p>
                </div>
                <div className="card" style={{ padding: "1rem", borderLeft: "4px solid #3b82f6" }}>
                    <p style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase" }}>Total Purchased</p>
                    <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#3b82f6" }}>KES {totalAddedCost.toLocaleString()}</p>
                </div>
                <div className="card" style={{ padding: "1rem", borderLeft: "4px solid var(--accent)" }}>
                    <p style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase" }}>Total Used</p>
                    <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent)" }}>KES {totalUsedCost.toLocaleString()}</p>
                </div>
                <div className="card" style={{ padding: "1rem", borderLeft: "4px solid #ef4444", background: "rgba(239, 68, 68, 0.05)" }}>
                    <p style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase" }}>Est. Loss</p>
                    <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#ef4444" }}>KES {estimatedLoss.toLocaleString()}</p>
                </div>
            </div>

            {/* Stock Breakdown Table */}
            <div className="card" style={{ marginBottom: "2rem" }}>
                <h3 style={{ marginBottom: "1rem" }}>💰 Financial Breakdown by Item</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                    <thead>
                        <tr style={{ textAlign: "left", borderBottom: "2px solid var(--border)" }}>
                            <th style={{ padding: "0.75rem" }}>Item</th>
                            <th style={{ padding: "0.75rem" }}>Added</th>
                            <th style={{ padding: "0.75rem" }}>Used</th>
                            <th style={{ padding: "0.75rem" }}>Balance</th>
                            <th style={{ padding: "0.75rem" }}>Price/Unit</th>
                            <th style={{ padding: "0.75rem" }}>Purchased Cost</th>
                            <th style={{ padding: "0.75rem" }}>Usage Cost</th>
                            <th style={{ padding: "0.75rem" }}>Stock Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.map((d: any) => (
                            <tr key={d.name} style={{ borderBottom: "1px solid var(--border)" }}>
                                <td style={{ padding: "0.75rem", fontWeight: 500 }}>{d.name}</td>
                                <td style={{ padding: "0.75rem" }}>{d.added} {d.unit}</td>
                                <td style={{ padding: "0.75rem" }}>{d.used} {d.unit}</td>
                                <td style={{ padding: "0.75rem", fontWeight: 600, color: d.balance <= 0 ? "#ef4444" : "inherit" }}>{d.balance} {d.unit}</td>
                                <td style={{ padding: "0.75rem" }}>KES {d.buyingPrice.toLocaleString()}</td>
                                <td style={{ padding: "0.75rem", color: "#3b82f6" }}>KES {d.addedCost.toLocaleString()}</td>
                                <td style={{ padding: "0.75rem", color: "var(--accent)" }}>KES {d.usedCost.toLocaleString()}</td>
                                <td style={{ padding: "0.75rem", fontWeight: 600, color: "#22c55e" }}>KES {(d.balance * d.buyingPrice).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Recent Purchase Log */}
            <div className="card">
                <h3 style={{ marginBottom: "1rem" }}>🧾 Recent Purchases & Receipts</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                    <thead>
                        <tr style={{ textAlign: "left", borderBottom: "2px solid var(--border)" }}>
                            <th style={{ padding: "0.75rem" }}>Item</th>
                            <th style={{ padding: "0.75rem" }}>Qty</th>
                            <th style={{ padding: "0.75rem" }}>Unit Price</th>
                            <th style={{ padding: "0.75rem" }}>Total</th>
                            <th style={{ padding: "0.75rem" }}>Supplier</th>
                            <th style={{ padding: "0.75rem" }}>Added By</th>
                            <th style={{ padding: "0.75rem" }}>Receipt</th>
                            <th style={{ padding: "0.75rem" }}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentEntries.map((entry) => (
                            <tr key={entry.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                <td style={{ padding: "0.75rem", fontWeight: 500 }}>{entry.item.name}</td>
                                <td style={{ padding: "0.75rem" }}>{entry.quantity} {entry.item.unit}</td>
                                <td style={{ padding: "0.75rem" }}>KES {entry.unitPrice.toLocaleString()}</td>
                                <td style={{ padding: "0.75rem", fontWeight: 600 }}>KES {(entry.quantity * entry.unitPrice).toLocaleString()}</td>
                                <td style={{ padding: "0.75rem" }}>{entry.supplier || "—"}</td>
                                <td style={{ padding: "0.75rem" }}>{entry.addedBy}</td>
                                <td style={{ padding: "0.75rem" }}>
                                    {entry.receiptUrl ? (
                                        <span style={{ color: "#22c55e", fontWeight: 600 }}>✅ Yes</span>
                                    ) : (
                                        <span style={{ color: "#ef4444", fontWeight: 600 }}>❌ Missing</span>
                                    )}
                                </td>
                                <td style={{ padding: "0.75rem", fontSize: "0.8rem", color: "#64748b" }}>{entry.createdAt.toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
