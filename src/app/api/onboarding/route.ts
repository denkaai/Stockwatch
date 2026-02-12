import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { hotelName, county, town } = await req.json();

        const result = await prisma.$transaction(async (tx: any) => {
            const hotel = await tx.hotel.create({
                data: {
                    name: hotelName,
                    country: "Kenya",
                    county: county,
                    town: town,
                },
            });

            const user = await tx.user.update({
                where: { email: session.user?.email as string },
                data: {
                    role: "OWNER",
                    hotelId: hotel.id,
                },
            });

            await tx.subscription.create({
                data: {
                    hotelId: hotel.id,
                    type: "FREE",
                },
            });

            return { hotel, user };
        });

        return NextResponse.json({ success: true, hotelId: result.hotel.id });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Onboarding failed" }, { status: 500 });
    }
}
