import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { requireManager } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const hotelId = (session.user as any).hotelId;

    const suppliers = await prisma.supplier.findMany({
        where: { hotelId },
        include: {
            entries: {
                include: { item: true },
                orderBy: { createdAt: "desc" },
                take: 10,
            },
        },
    });

    return NextResponse.json(suppliers);
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try { requireManager(session); } catch { return NextResponse.json({ error: "Manager+ required" }, { status: 403 }); }

    const { name, phone, location } = await req.json();
    const hotelId = (session.user as any).hotelId;

    const supplier = await prisma.supplier.create({
        data: { name, phone, location, hotelId },
    });

    return NextResponse.json(supplier);
}
