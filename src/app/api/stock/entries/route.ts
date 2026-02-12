import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { sendAlert } from "@/lib/alerts";
import { requireManager } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        requireManager(session);
    } catch {
        return NextResponse.json({ error: "Only Owners and Managers can add stock." }, { status: 403 });
    }

    const { itemId, quantity, receiptUrl, supplier, unitPrice } = await req.json();

    // 1. Strict Receipt Enforcement
    if (!receiptUrl) {
        return NextResponse.json({ error: "Receipt upload is MANDATORY for stock entries." }, { status: 400 });
    }

    const hotelId = (session.user as any).hotelId;

    // Fetch the item to get buying price for cost calculation
    const stockItem = await prisma.stockItem.findUnique({
        where: { id: itemId },
        include: { entries: true, usages: true }
    });
    if (!stockItem) {
        return NextResponse.json({ error: "Stock item not found." }, { status: 404 });
    }

    // 2. Weighted Average Cost (WAC) Calculation
    // Formula: ((OldQty * OldPrice) + (NewQty * NewPrice)) / (OldQty + NewQty)
    const currentStock = stockItem.entries.reduce((acc, e) => acc + e.quantity, 0) -
        stockItem.usages.reduce((acc, u) => acc + u.quantity, 0);

    // Only calculate WAC if there is positive stock remaining
    let newWeightedPrice = unitPrice || stockItem.buyingPrice;

    if (currentStock > 0 && unitPrice && unitPrice > 0 && unitPrice !== stockItem.buyingPrice) {
        const totalValue = (currentStock * stockItem.buyingPrice) + (quantity * unitPrice);
        const totalQty = currentStock + quantity;
        newWeightedPrice = totalValue / totalQty;
    }

    // Update item price with WAC
    await prisma.stockItem.update({
        where: { id: itemId },
        data: { buyingPrice: newWeightedPrice },
    });

    const entry = await prisma.stockEntry.create({
        data: {
            itemId,
            quantity,
            unitPrice: unitPrice || stockItem.buyingPrice || 0,
            supplier: supplier || null,
            receiptUrl,
            hotelId,
            addedBy: session.user?.name || "Unknown",
        },
        include: { item: true }
    });

    // Audit log
    await createAuditLog(
        "STOCK_ADDED",
        `Added ${quantity} ${entry.item.unit} of ${entry.item.name} @ KES ${unitPrice || 0}/unit. Supplier: ${supplier || "N/A"}`,
        (session.user as any).id,
        session.user?.name || "Unknown",
        hotelId
    );

    // 2. Tiered Alert Logic
    const hotel = await prisma.hotel.findUnique({
        where: { id: hotelId },
        include: { subscription: true }
    });

    const isPremium = hotel?.subscription?.type === "PREMIUM";
    const alertType = isPremium ? "WHATSAPP" : "SMS";
    const contact = "HOTEL_OWNER_CONTACT";

    await sendAlert(
        alertType,
        `New Stock Added: ${quantity} ${entry.item.unit} of ${entry.item.name} by ${entry.addedBy}. Cost: KES ${(quantity * (unitPrice || 0)).toLocaleString()}`,
        contact,
        isPremium ? receiptUrl : undefined
    );

    return NextResponse.json(entry);
}
