import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canViewFinancials } from "@/lib/rbac";

export default async function UsagePage() {
    const session = await auth();
    const hotelId = (session?.user as any).hotelId;
    const role = (session?.user as any).role || "KITCHEN";
    const isOwner = canViewFinancials(role);

    const usages = await prisma.stockUsage.findMany({
        where: { hotelId },
        include: { item: true },
        orderBy: { createdAt: "desc" },
        take: 30
    });

    const totalCost = usages.reduce((s, u) => s + u.costOfUsage, 0);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1>🍳 Daily Kitchen Usage</h1>
                {isOwner && (
                    <div className="card" style={{ padding: "0.75rem 1.5rem", borderLeft: "4px solid var(--accent)" }}>
                        <p style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase" }}>Total Usage Cost</p>
                        <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--accent)" }}>KES {totalCost.toLocaleString()}</p>
                    </div>
                )}
            </div>

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead style={{ background: "rgba(0,0,0,0.05)" }}>
                        <tr>
                            <th style={{ padding: "1rem" }}>Item</th>
                            <th style={{ padding: "1rem" }}>Quantity Used</th>
                            {isOwner && <th style={{ padding: "1rem" }}>Cost (KES)</th>}
                            <th style={{ padding: "1rem" }}>Staff</th>
                            <th style={{ padding: "1rem" }}>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usages.map((usage) => (
                            <tr key={usage.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                <td style={{ padding: "1rem", fontWeight: 500 }}>{usage.item.name}</td>
                                <td style={{ padding: "1rem" }}>{usage.quantity} {usage.item.unit}</td>
                                {isOwner && (
                                    <td style={{ padding: "1rem", color: "var(--accent)", fontWeight: 500 }}>
                                        KES {usage.costOfUsage.toLocaleString()}
                                    </td>
                                )}
                                <td style={{ padding: "1rem" }}>{usage.usedBy}</td>
                                <td style={{ padding: "1rem", color: "#64748b", fontSize: "0.875rem" }}>
                                    {usage.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem" }}>
                                        {usage.createdAt.toLocaleDateString()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {usages.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                                    No usage recorded yet. Monitoring is active.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
