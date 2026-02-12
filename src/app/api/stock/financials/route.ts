import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        requireOwner(session);
    } catch {
        return NextResponse.json({ error: "Owner access required for financial data." }, { status: 403 });
    }

    const hotelId = (session.user as any).hotelId;

    // Get all items with entries and usages
    const items = await prisma.stockItem.findMany({
        where: { hotelId },
        include: {
            entries: true,
            usages: true,
        },
    });

    // Calculate total stock value
    let totalStockValue = 0;
    items.forEach(item => {
        const totalAdded = item.entries.reduce((s, e) => s + e.quantity, 0);
        const totalUsed = item.usages.reduce((s, u) => s + u.quantity, 0);
        const balance = totalAdded - totalUsed;
        totalStockValue += balance * item.buyingPrice;
    });

    // Calculate monthly usage cost (this month)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyUsages = await prisma.stockUsage.findMany({
        where: {
            hotelId,
            createdAt: { gte: monthStart },
        },
    });

    const monthlyUsageCost = monthlyUsages.reduce((s, u) => s + u.costOfUsage, 0);

    // Calculate monthly loss (simplified: sum of costOfUsage as proxy)
    // In future, compare against expected usage patterns
    const monthlyLoss = monthlyUsageCost * 0.05; // Estimated 5% loss baseline

    return NextResponse.json({
        totalStockValue,
        monthlyUsageCost,
        monthlyLoss,
    });
}
