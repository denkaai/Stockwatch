import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/audit";

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { itemId, quantity, reason, notes, photoUrl } = await req.json();
    const hotelId = (session.user as any).hotelId;

    const item = await prisma.stockItem.findUnique({ where: { id: itemId } });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    const waste = await prisma.wasteLog.create({
        data: {
            itemId,
            quantity,
            reason: reason || "OTHER",
            notes,
            photoUrl,
            hotelId,
            loggedBy: session.user?.name || "Unknown",
        },
        include: { item: true },
    });

    await createAuditLog(
        "STOCK_DELETED",
        `Waste logged: ${quantity} ${item.unit} of ${item.name}. Reason: ${reason}. Value: KES ${(quantity * item.buyingPrice).toLocaleString()}`,
        (session.user as any).id,
        session.user?.name || "Unknown",
        hotelId
    );

    return NextResponse.json(waste);
}

export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const hotelId = (session.user as any).hotelId;

    const wastes = await prisma.wasteLog.findMany({
        where: { hotelId },
        include: { item: true },
        orderBy: { createdAt: "desc" },
        take: 50,
    });

    return NextResponse.json(wastes);
}
