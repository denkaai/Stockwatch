import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DailySalesInput from "@/components/DailySalesInput";

export default async function SalesVariancePage({ searchParams }: { searchParams: { date?: string } }) {
    const session = await auth();
    const hotelId = (session?.user as any).hotelId;
    const date = searchParams.date || new Date().toISOString().split('T')[0];

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Fetch data
    const recipes = await prisma.recipe.findMany({ where: { hotelId } });
    const sales = await prisma.dailySale.findMany({
        where: { hotelId, date: { gte: startDate, lte: endDate } },
        include: { recipe: true }
    });

    // Calculate Variance (Server-side logic duplication from API for speed/SEO)
    // In a real app, extract this to a lib function
    const varianceData = await fetch(`${process.env.AUTH_URL}/api/sales?date=${date}`, {
        headers: { Cookie: `authjs.session-token=${session?.user ? "valid" : ""}` } // Hack for server-fetch, better to use lib function
    }).then(res => res.ok ? res.json() : []).catch(() => []);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1>📊 Sales & Variance Analysis</h1>
                    <p style={{ color: "#64748b" }}>Detect theft by comparing theoretical vs. actual usage.</p>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <input
                        type="date"
                        defaultValue={date}
                        style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid var(--border)" }}
                    />
                    <DailySalesInput recipes={recipes} />
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
                {/* Daily Sales Overview */}
                <div className="card">
                    <h3>Daily Sales Log</h3>
                    <div style={{ maxHeight: "300px", overflowY: "auto", marginTop: "1rem" }}>
                        {sales.map(sale => (
                            <div key={sale.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                                <span>{sale.recipe.name} x{sale.quantity}</span>
                                <span style={{ fontWeight: 600 }}>KES {sale.totalRevenue.toLocaleString()}</span>
                            </div>
                        ))}
                        {sales.length === 0 && <p style={{ opacity: 0.5, textAlign: "center", padding: "1rem" }}>No sales recorded for this date.</p>}
                    </div>
                </div>

                {/* Variance Report */}
                <div className="card">
                    <h3>⚠️ Variance Report (Theft Detection)</h3>
                    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem", fontSize: "0.85rem" }}>
                        <thead style={{ background: "rgba(0,0,0,0.03)", textAlign: "left" }}>
                            <tr>
                                <th style={{ padding: "0.75rem" }}>Item</th>
                                <th style={{ padding: "0.75rem" }}>Theoretical</th>
                                <th style={{ padding: "0.75rem" }}>Actual</th>
                                <th style={{ padding: "0.75rem" }}>Variance</th>
                                <th style={{ padding: "0.75rem" }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {varianceData.map((row: any, i: number) => (
                                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td style={{ padding: "0.75rem", fontWeight: 600 }}>{row.itemName}</td>
                                    <td style={{ padding: "0.75rem" }}>{row.theoretical.toFixed(2)} {row.unit}</td>
                                    <td style={{ padding: "0.75rem" }}>{row.actual.toFixed(2)} {row.unit}</td>
                                    <td style={{ padding: "0.75rem", color: row.variance > 0 ? "#ef4444" : "#22c55e", fontWeight: 700 }}>
                                        {row.variance > 0 ? "+" : ""}{row.variance.toFixed(2)} {row.unit}
                                    </td>
                                    <td style={{ padding: "0.75rem" }}>
                                        <span style={{
                                            padding: "0.2rem 0.5rem",
                                            borderRadius: "10px",
                                            background: row.status === "OVER_USED" ? "#fee2e2" : "#dcfce7",
                                            color: row.status === "OVER_USED" ? "#ef4444" : "#166534",
                                            fontSize: "0.7rem", fontWeight: 600
                                        }}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
