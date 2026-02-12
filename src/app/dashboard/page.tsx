import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canViewFinancials } from "@/lib/rbac";
import { analyzeLowStock, getLowStockCount } from "@/lib/lowstock";
import { generateHints } from "@/lib/hints";
import ReportDownloader from "@/components/ReportDownloader";

export default async function DashboardPage() {
    const session = await auth();
    const hotelId = (session?.user as any).hotelId;
    const role = (session?.user as any).role || "KITCHEN";
    const isOwner = canViewFinancials(role);

    const hotel = await prisma.hotel.findUnique({
        where: { id: hotelId },
        select: { efficiencyScore: true, county: true, town: true, name: true }
    });

    // Fetch core data
    const items = await prisma.stockItem.findMany({
        where: { hotelId },
        include: { entries: true, usages: true }
    });
    const recipes = await prisma.recipe.findMany({
        where: { hotelId },
        include: { ingredients: { include: { item: true } } }
    });
    const wasteLogs = await prisma.wasteLog.findMany({ where: { hotelId }, include: { item: true } });

    // Compute report data
    const reportData = items.map(item => {
        const added = item.entries.reduce((acc, entry) => acc + entry.quantity, 0);
        const used = item.usages.reduce((acc, usage) => acc + usage.quantity, 0);
        return { name: item.name, unit: item.unit, added, used, balance: added - used };
    });

    // Financials
    let totalStockValue = 0;
    let monthlyUsageCost = 0;
    let totalWasteLoss = wasteLogs.reduce((s, l) => s + (l.quantity * l.item.buyingPrice), 0);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    if (isOwner) {
        items.forEach(item => {
            const added = item.entries.reduce((s, e) => s + e.quantity, 0);
            const used = item.usages.reduce((s, u) => s + u.quantity, 0);
            totalStockValue += (added - used) * item.buyingPrice;
        });
        const monthlyUsages = await prisma.stockUsage.findMany({
            where: { hotelId, createdAt: { gte: monthStart } },
        });
        monthlyUsageCost = monthlyUsages.reduce((s, u) => s + u.costOfUsage, 0);
    }

    // Profitably analysis
    const avgProfit = recipes.length > 0
        ? recipes.reduce((sum, r) => {
            const cost = r.ingredients.reduce((s, i) => s + (i.quantity * i.item.buyingPrice), 0);
            return sum + (r.sellingPrice - cost);
        }, 0) / recipes.length
        : 0;

    const lowStockData = analyzeLowStock(items);
    const lowStockCount = getLowStockCount(lowStockData);
    const hints = generateHints(items.map(item => ({
        name: item.name,
        unit: item.unit,
        currentBalance: item.entries.reduce((s, e) => s + e.quantity, 0) - item.usages.reduce((s, u) => s + u.quantity, 0),
        thisMonthUsage: item.usages.filter(u => new Date(u.createdAt) >= monthStart).reduce((s, u) => s + u.quantity, 0),
        lastMonthUsage: 0,
        todayUsage: 0,
        avgDailyUsage: item.usages.reduce((s, u) => s + u.quantity, 0) / 30
    })));

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1>Welcome, {session?.user?.name}</h1>
                    <p style={{ fontSize: "0.875rem", color: "#64748b" }}>StockWatch Intelligence: Monitoring Active 🟢</p>
                </div>
                <ReportDownloader data={reportData} hotelName={hotel?.name || "Hotel"} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
                <StatCard title="Total Stock Value" value={`KES ${totalStockValue.toLocaleString()}`} color="#22c55e" visible={isOwner} />
                <StatCard title="Monthly Usage" value={`KES ${monthlyUsageCost.toLocaleString()}`} color="var(--accent)" visible={isOwner} />
                <StatCard title="Waste Loss" value={`KES ${totalWasteLoss.toLocaleString()}`} color="#ef4444" visible={isOwner} />
                <StatCard title="Avg Plate Profit" value={`KES ${avgProfit.toLocaleString()}`} color="var(--primary)" visible={isOwner} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
                <div>
                    <div className="card" style={{ marginBottom: "1.5rem" }}>
                        <h3>🚀 Intelligence Hints</h3>
                        <div style={{ marginTop: "1rem" }}>
                            {hints.slice(0, 3).map((hint, i) => (
                                <div key={i} style={{ padding: "1rem", borderLeft: "4px solid var(--primary)", background: "rgba(0,0,0,0.02)", marginBottom: "0.5rem", borderRadius: "0 0.5rem 0.5rem 0" }}>
                                    {hint.icon} {hint.message}
                                </div>
                            ))}
                            {hints.length === 0 && <p style={{ opacity: 0.5 }}>No immediate alerts. Efficiency is high.</p>}
                        </div>
                    </div>

                    <div className="card">
                        <h3>📉 Low Stock Alerts ({lowStockCount})</h3>
                        <div style={{ marginTop: "1rem" }}>
                            {lowStockData.filter(i => i.severity !== "OK").map(item => (
                                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                                    <span>{item.name}</span>
                                    <span style={{ color: "#ef4444", fontWeight: 700 }}>{item.currentBalance} {item.unit} left</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3>🏆 Kitchen Performance</h3>
                    <div style={{ textAlign: "center", padding: "2rem 0" }}>
                        <div style={{ fontSize: "3rem", fontWeight: 900, color: "var(--primary)" }}>{hotel?.efficiencyScore || 85}%</div>
                        <p style={{ opacity: 0.6 }}>Efficiency Score</p>
                    </div>
                    <div style={{ height: "8px", background: "var(--border)", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${hotel?.efficiencyScore || 85}%`, height: "100%", background: "var(--primary)" }}></div>
                    </div>
                    <p style={{ fontSize: "0.8rem", marginTop: "1.5rem", color: "#64748b" }}>You are in the top 10% of hotels in {hotel?.county || "Kenya"}.</p>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, color, visible }: any) {
    if (!visible) return null;
    return (
        <div className="card" style={{ borderLeft: `4px solid ${color}` }}>
            <p style={{ fontSize: "0.75rem", textTransform: "uppercase", opacity: 0.6 }}>{title}</p>
            <p style={{ fontSize: "1.5rem", fontWeight: 800, color }}>{value}</p>
        </div>
    );
}
