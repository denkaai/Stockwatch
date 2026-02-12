import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { requireManager } from "@/lib/rbac";
import { createAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const hotelId = (session.user as any).hotelId;
    const items = await prisma.stockItem.findMany({
        where: { hotelId },
    });

    return NextResponse.json(items);
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        requireManager(session);
    } catch {
        return NextResponse.json({ error: "Only Owners and Managers can add stock items." }, { status: 403 });
    }

    const { name, unit, buyingPrice, minimumLevel, reorderLevel } = await req.json();
    const hotelId = (session.user as any).hotelId;

    const item = await prisma.stockItem.create({
        data: {
            name,
            unit,
            buyingPrice: buyingPrice || 0,
            minimumLevel: minimumLevel || 0,
            reorderLevel: reorderLevel || 0,
            hotelId,
        },
    });

    await createAuditLog(
        "ITEM_CREATED",
        `Created item "${name}" (${unit}) with price KES ${buyingPrice || 0}`,
        (session.user as any).id,
        session.user?.name || "Unknown",
        hotelId
    );

    return NextResponse.json(item);
}
