import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { itemId, quantity } = await req.json();
    const hotelId = (session.user as any).hotelId;

    // Fetch item to calculate cost
    const stockItem = await prisma.stockItem.findUnique({
        where: { id: itemId },
        include: { entries: true, usages: true }
    }) as (import("@prisma/client").StockItem & {
        entries: import("@prisma/client").StockEntry[],
        usages: import("@prisma/client").StockUsage[]
    }) | null;
    if (!stockItem) {
        return NextResponse.json({ error: "Stock item not found." }, { status: 404 });
    }

    // 1. Strict Stock Validation
    const totalEntry = stockItem.entries.reduce((acc, e) => acc + e.quantity, 0);
    const totalUsage = stockItem.usages.reduce((acc, u) => acc + u.quantity, 0);
    const currentStock = totalEntry - totalUsage;

    if (currentStock < quantity) {
        return NextResponse.json({
            error: `Insufficient stock! Available: ${currentStock} ${stockItem.unit}, Requested: ${quantity} ${stockItem.unit}`
        }, { status: 400 });
    }

    const costOfUsage = quantity * stockItem.buyingPrice;

    const usage = await prisma.stockUsage.create({
        data: {
            itemId,
            quantity,
            costOfUsage,
            hotelId,
            usedBy: session.user?.name || "Unknown",
        },
        include: { item: true }
    });

    // Audit log
    await createAuditLog(
        "STOCK_USED",
        `Used ${quantity} ${usage.item.unit} of ${usage.item.name}. Cost: KES ${costOfUsage.toLocaleString()}`,
        (session.user as any).id,
        session.user?.name || "Unknown",
        hotelId
    );

    return NextResponse.json(usage);
}
