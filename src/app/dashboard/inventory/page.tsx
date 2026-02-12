import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canEditStock, canViewFinancials } from "@/lib/rbac";
import { analyzeLowStock } from "@/lib/lowstock";
import StockItemForm from "@/components/StockItemForm";
import StockEntryForm from "@/components/StockEntryForm";
import StockUsageForm from "@/components/StockUsageForm";

export default async function InventoryPage() {
    const session = await auth();
    const hotelId = (session?.user as any).hotelId;
    const role = (session?.user as any).role || "KITCHEN";
    const isOwner = canViewFinancials(role);
    const canEdit = canEditStock(role);

    const items = await prisma.stockItem.findMany({
        where: { hotelId },
        include: {
            entries: true,
            usages: true,
        },
    });

    const lowStockData = analyzeLowStock(items);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1>📦 Inventory Management</h1>
                {canEdit && <StockItemForm />}
            </div>

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead style={{ background: "rgba(0,0,0,0.05)" }}>
                        <tr>
                            <th style={{ padding: "1rem" }}>Status</th>
                            <th style={{ padding: "1rem" }}>Item Name</th>
                            <th style={{ padding: "1rem" }}>Balance</th>
                            <th style={{ padding: "1rem" }}>Unit</th>
                            {isOwner && <th style={{ padding: "1rem" }}>Price/Unit</th>}
                            {isOwner && <th style={{ padding: "1rem" }}>Value</th>}
                            <th style={{ padding: "1rem" }}>Min Level</th>
                            <th style={{ padding: "1rem" }}>Last Updated</th>
                            {canEdit && <th style={{ padding: "1rem" }}>Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item: any) => {
                            const totalAdded = item.entries.reduce((sum: number, e: any) => sum + e.quantity, 0);
                            const totalUsed = item.usages.reduce((sum: number, u: any) => sum + u.quantity, 0);
                            const balance = totalAdded - totalUsed;
                            const stockInfo = lowStockData.find(s => s.id === item.id);
                            const severity = stockInfo?.severity || "OK";
                            const value = balance * item.buyingPrice;

                            return (
                                <tr key={item.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td style={{ padding: "1rem" }}>
                                        {severity === "CRITICAL" && (
                                            <span style={{ padding: "0.15rem 0.5rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700, background: "#fecaca", color: "#991b1b" }}>🔴 LOW</span>
                                        )}
                                        {severity === "WARNING" && (
                                            <span style={{ padding: "0.15rem 0.5rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700, background: "#fef3c7", color: "#92400e" }}>🟡 REORDER</span>
                                        )}
                                        {severity === "OK" && (
                                            <span style={{ padding: "0.15rem 0.5rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700, background: "#dcfce7", color: "#166534" }}>🟢 OK</span>
                                        )}
                                    </td>
                                    <td style={{ padding: "1rem", fontWeight: 500 }}>{item.name}</td>
                                    <td style={{ padding: "1rem", fontWeight: 600, color: severity === "CRITICAL" ? "#ef4444" : "inherit" }}>{balance}</td>
                                    <td style={{ padding: "1rem", color: "#64748b" }}>{item.unit}</td>
                                    {isOwner && <td style={{ padding: "1rem" }}>KES {item.buyingPrice.toLocaleString()}</td>}
                                    {isOwner && <td style={{ padding: "1rem", fontWeight: 500 }}>KES {value.toLocaleString()}</td>}
                                    <td style={{ padding: "1rem", fontSize: "0.85rem" }}>{item.minimumLevel} {item.unit}</td>
                                    <td style={{ padding: "1rem", fontSize: "0.875rem" }}>
                                        {item.entries[0]?.createdAt.toLocaleDateString() || "N/A"}
                                    </td>
                                    {canEdit && (
                                        <td style={{ padding: "1rem" }}>
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                <StockEntryForm itemId={item.id} />
                                                <StockUsageForm itemId={item.id} />
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={9} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                                    No items in inventory. Add your first item above!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
