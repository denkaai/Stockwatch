import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        if (!process.env.DATABASE_URL) {
            console.error("DATABASE_URL is missing");
            return NextResponse.json({ error: "Service Unavailable: Database config missing" }, { status: 503 });
        }

        const session = await auth();
        // Check for specific session structure.
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Safely access hotelId, with fallback/checking
        const user = session.user as any;
        if (!user.hotelId) {
            return NextResponse.json({ error: "Forbidden: No Hotel ID associated" }, { status: 403 });
        }

        const logs = await prisma.shiftLog.findMany({
            where: { hotelId: user.hotelId },
            orderBy: { createdAt: "desc" },
            take: 20
        });

        return NextResponse.json(logs);
    } catch (error) {
        console.error("Error fetching shift logs:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        if (!process.env.DATABASE_URL) {
            return NextResponse.json({ error: "Service Unavailable" }, { status: 503 });
        }

        const session = await auth();
        if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json().catch(() => null);
        if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

        const { shiftType, notes, cashHandover } = body;
        const user = session.user as any;

        if (!user.hotelId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const staffName = user.name || "Unknown";

        const log = await prisma.shiftLog.create({
            data: {
                shiftType,
                staffName,
                notes,
                cashHandover: parseFloat(cashHandover) || 0,
                hotelId: user.hotelId
            }
        });

        return NextResponse.json(log);
    } catch (error) {
        console.error("Error logging shift:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
