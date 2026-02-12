import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const hotelId = (session.user as any).hotelId;
    const logs = await prisma.shiftLog.findMany({
        where: { hotelId },
        orderBy: { createdAt: "desc" },
        take: 20
    });

    return NextResponse.json(logs);
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { shiftType, notes, cashHandover } = await req.json();
    const hotelId = (session.user as any).hotelId;
    const staffName = session.user?.name || "Unknown";

    const log = await prisma.shiftLog.create({
        data: {
            shiftType,
            staffName,
            notes,
            cashHandover: parseFloat(cashHandover) || 0,
            hotelId
        }
    });

    return NextResponse.json(log);
}
