import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import WasteLogger from "@/components/WasteLogger";

export default async function WastePage() {
    const session = await auth();
    const hotelId = (session?.user as any).hotelId;

    const wasteLogs = await prisma.wasteLog.findMany({
        where: { hotelId },
        include: { item: true },
        orderBy: { createdAt: "desc" }
    });

    const totalWasteValue = wasteLogs.reduce((sum, log) => sum + (log.quantity * log.item.buyingPrice), 0);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1>🗑️ Kitchen Waste Tracking</h1>
                <WasteLogger />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
                <div className="card" style={{ height: "fit-content" }}>
                    <h3>Waste Summary</h3>
                    <div style={{ marginTop: "1.5rem" }}>
                        <p style={{ fontSize: "0.8rem", opacity: 0.6 }}>Total Loss to Waste</p>
                        <h2 style={{ color: "#ef4444", fontSize: "2.5rem" }}>KES {totalWasteValue.toLocaleString()}</h2>
                    </div>

                    <div style={{ marginTop: "2rem" }}>
                        <p style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>Top Waste Reasons</p>
                        {["SPOILED", "OVERCOOKED", "DAMAGED", "OTHER"].map(reason => {
                            const count = wasteLogs.filter(l => l.reason === reason).length;
                            const pct = wasteLogs.length > 0 ? (count / wasteLogs.length) * 100 : 0;
                            return (
                                <div key={reason} style={{ marginBottom: "0.75rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.2rem" }}>
                                        <span>{reason}</span>
                                        <span>{count} logs</span>
                                    </div>
                                    <div style={{ height: "4px", background: "var(--border)", borderRadius: "2px" }}>
                                        <div style={{ width: `${pct}%`, height: "100%", background: "#ef4444" }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="card" style={{ padding: 0 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead style={{ background: "rgba(0,0,0,0.03)" }}>
                            <tr>
                                <th style={{ padding: "1rem" }}>Date</th>
                                <th style={{ padding: "1rem" }}>Item</th>
                                <th style={{ padding: "1rem" }}>Qty</th>
                                <th style={{ padding: "1rem" }}>Value</th>
                                <th style={{ padding: "1rem" }}>Reason</th>
                                <th style={{ padding: "1rem" }}>Logged By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wasteLogs.map(log => (
                                <tr key={log.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td style={{ padding: "1rem", fontSize: "0.85rem" }}>{new Date(log.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: "1rem", fontWeight: 600 }}>{log.item.name}</td>
                                    <td style={{ padding: "1rem" }}>{log.quantity} {log.item.unit}</td>
                                    <td style={{ padding: "1rem", color: "#ef4444" }}>KES {(log.quantity * log.item.buyingPrice).toLocaleString()}</td>
                                    <td style={{ padding: "1rem" }}>
                                        <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", borderRadius: "10px", background: "#fee2e2", color: "#ef4444" }}>{log.reason}</span>
                                    </td>
                                    <td style={{ padding: "1rem", fontSize: "0.85rem" }}>{log.loggedBy}</td>
                                </tr>
                            ))}
                            {wasteLogs.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>No waste logs yet. Keep it clean!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
