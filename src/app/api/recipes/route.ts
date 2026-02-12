import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { requireManager } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export async function GET() {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const hotelId = (session.user as any).hotelId;

    const recipes = await prisma.recipe.findMany({
        where: { hotelId },
        include: { ingredients: { include: { item: true } } },
    });

    const enriched = recipes.map(r => {
        const foodCost = r.ingredients.reduce((sum, ing) => sum + (ing.quantity * ing.item.buyingPrice), 0);
        const foodCostPct = r.sellingPrice > 0 ? (foodCost / r.sellingPrice) * 100 : 0;
        const profit = r.sellingPrice - foodCost;
        return { ...r, foodCost, foodCostPct, profit };
    });

    return NextResponse.json(enriched);
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try { requireManager(session); } catch { return NextResponse.json({ error: "Manager+ required" }, { status: 403 }); }

    const { name, category, sellingPrice, servings, ingredients } = await req.json();
    const hotelId = (session.user as any).hotelId;

    const recipe = await prisma.recipe.create({
        data: {
            name,
            category: category || "Main",
            sellingPrice: sellingPrice || 0,
            servings: servings || 1,
            hotelId,
            ingredients: {
                create: (ingredients || []).map((ing: any) => ({
                    itemId: ing.itemId,
                    quantity: ing.quantity,
                })),
            },
        },
        include: { ingredients: { include: { item: true } } },
    });

    return NextResponse.json(recipe);
}
