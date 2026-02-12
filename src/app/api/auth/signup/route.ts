import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const { hotelName, location, name, email, password } = await req.json();

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Parse location into county and town
        const [county, town] = location.split(",").map((s: string) => s.trim());

        const result = await prisma.$transaction(async (tx: any) => {
            const hotel = await tx.hotel.create({
                data: {
                    name: hotelName,
                    county: county || null,
                    town: town || null,
                },
            });

            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
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
        console.error("Signup error:", error);
        return NextResponse.json({ error: "Signup failed" }, { status: 500 });
    }
}
