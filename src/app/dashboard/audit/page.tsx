import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AuditPage() {
    const session = await auth();
    if ((session?.user as any).role !== "OWNER") {
        redirect("/dashboard");
    }

    const hotelId = (session?.user as any).hotelId;

    const logs = await prisma.auditLog.findMany({
        where: { hotelId },
        orderBy: { createdAt: "desc" },
        take: 50,
    });

    const getActionColor = (action: string) => {
        switch (action) {
            case "STOCK_ADDED": return { bg: "#dcfce7", color: "#166534" };
            case "STOCK_USED": return { bg: "#fef3c7", color: "#92400e" };
            case "STOCK_EDITED": return { bg: "#dbeafe", color: "#1e40af" };
            case "STOCK_DELETED": return { bg: "#fecaca", color: "#991b1b" };
            case "ITEM_CREATED": return { bg: "#e0e7ff", color: "#3730a3" };
            default: return { bg: "#f1f5f9", color: "#475569" };
        }
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1>🔒 Audit Log</h1>
                <p style={{ color: "#64748b", fontSize: "0.875rem" }}>{logs.length} entries</p>
            </div>

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
                    <thead style={{ background: "rgba(0,0,0,0.05)" }}>
                        <tr>
                            <th style={{ padding: "1rem" }}>Action</th>
                            <th style={{ padding: "1rem" }}>Details</th>
                            <th style={{ padding: "1rem" }}>User</th>
                            <th style={{ padding: "1rem" }}>Date & Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => {
                            const actionStyle = getActionColor(log.action);
                            return (
                                <tr key={log.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td style={{ padding: "1rem" }}>
                                        <span style={{
                                            padding: "0.2rem 0.6rem",
                                            borderRadius: "9999px",
                                            fontSize: "0.7rem",
                                            fontWeight: 700,
                                            background: actionStyle.bg,
                                            color: actionStyle.color,
                                        }}>
                                            {log.action.replace(/_/g, " ")}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1rem" }}>{log.details}</td>
                                    <td style={{ padding: "1rem", fontWeight: 500 }}>{log.userName}</td>
                                    <td style={{ padding: "1rem", color: "#64748b" }}>
                                        {log.createdAt.toLocaleDateString()} {log.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                </tr>
                            );
                        })}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={4} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                                    No audit logs yet. All actions will be tracked here automatically.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
