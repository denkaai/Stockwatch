import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { requireManager } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const hotelId = (session.user as any).hotelId;

    const pos = await prisma.purchaseOrder.findMany({
        where: { hotelId },
        include: { supplier: true, items: { include: { item: true } } },
        orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(pos);
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try { requireManager(session); } catch { return NextResponse.json({ error: "Manager required" }, { status: 403 }); }

    const hotelId = (session.user as any).hotelId;

    // 1. Find Low Stock Items
    const items = await prisma.stockItem.findMany({
        where: { hotelId },
        include: { entries: true, usages: true }
    });

    const lowStockItems = items.filter(item => {
        const totalEntry = item.entries.reduce((acc, e) => acc + e.quantity, 0);
        const totalUsage = item.usages.reduce((acc, u) => acc + u.quantity, 0);
        const balance = totalEntry - totalUsage;
        return balance <= item.reorderLevel;
    });

    if (lowStockItems.length === 0) return NextResponse.json({ message: "No items need reordering" });

    // 2. Group by Supplier (Simple version: generic PO for now, or group by last supplier)
    // For MVP, we create one draft PO with all items, user can assign supplier later if complex
    // Or better: Group by entries[0].supplierId if available

    // Let's create a single DRAFT PO for all low stock items
    const poItems = lowStockItems.map(item => ({
        itemId: item.id,
        quantity: item.reorderLevel * 1.5, // Order enough to go 50% above reorder level
        unitCost: item.buyingPrice
    }));

    const totalCost = poItems.reduce((acc, i) => acc + (i.quantity * i.unitCost), 0);

    const po = await prisma.purchaseOrder.create({
        data: {
            hotelId,
            status: "DRAFT",
            totalCost,
            items: {
                create: poItems
            }
        },
        include: { items: { include: { item: true } } }
    });

    return NextResponse.json(po);
}
