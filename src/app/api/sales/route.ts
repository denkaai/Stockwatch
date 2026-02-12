import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try { requireOwner(session); } catch { return NextResponse.json({ error: "Owner required" }, { status: 403 }); }

    const hotelId = (session.user as any).hotelId;
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || new Date().toISOString().split('T')[0];

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // 1. Fetch Sales
    const sales = await prisma.dailySale.findMany({
        where: { hotelId, date: { gte: startDate, lte: endDate } },
        include: { recipe: { include: { ingredients: { include: { item: true } } } } }
    });

    // 2. Calculate Theoretical Usage
    const theoreticalUsage: Record<string, number> = {};
    sales.forEach(sale => {
        sale.recipe.ingredients.forEach(ing => {
            if (!theoreticalUsage[ing.itemId]) theoreticalUsage[ing.itemId] = 0;
            theoreticalUsage[ing.itemId] += ing.quantity * sale.quantity;
        });
    });

    // 3. Fetch Actual Usage
    const actualUsages = await prisma.stockUsage.findMany({
        where: { hotelId, createdAt: { gte: startDate, lte: endDate } },
    });

    const actualUsageMap: Record<string, number> = {};
    actualUsages.forEach(usage => {
        if (!actualUsageMap[usage.itemId]) actualUsageMap[usage.itemId] = 0;
        actualUsageMap[usage.itemId] += usage.quantity;
    });

    // 4. Calculate Variance
    const varianceReport = await Promise.all(Object.keys(theoreticalUsage).map(async (itemId) => {
        const item = await prisma.stockItem.findUnique({ where: { id: itemId } });
        const theoretical = theoreticalUsage[itemId] || 0;
        const actual = actualUsageMap[itemId] || 0;
        const variance = actual - theoretical;
        const varianceCost = variance * (item?.buyingPrice || 0);

        return {
            itemName: item?.name,
            unit: item?.unit,
            theoretical,
            actual,
            variance,
            varianceCost,
            status: variance > 0 ? "OVER_USED" : variance < 0 ? "UNDER_USED" : "PERFECT"
        };
    }));

    return NextResponse.json(varianceReport);
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { recipeId, quantity } = await req.json();
    const hotelId = (session.user as any).hotelId;

    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
    if (!recipe) return NextResponse.json({ error: "Recipe not found" }, { status: 404 });

    const sale = await prisma.dailySale.create({
        data: {
            recipeId,
            quantity,
            totalRevenue: recipe.sellingPrice * quantity,
            hotelId,
            date: new Date(),
        }
    });

    return NextResponse.json(sale);
}
