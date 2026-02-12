import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import RecipeBuilder from "@/components/RecipeBuilder";

export default async function RecipesPage() {
    const session = await auth();
    const hotelId = (session?.user as any).hotelId;

    const recipes = await prisma.recipe.findMany({
        where: { hotelId },
        include: { ingredients: { include: { item: true } } },
    });

    const calculateCost = (ingredients: any[]) => {
        return ingredients.reduce((sum, ing) => sum + (ing.quantity * ing.item.buyingPrice), 0);
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1>🍽️ Recipe & Menu Costing</h1>
                <RecipeBuilder />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                {recipes.map(recipe => {
                    const cost = calculateCost(recipe.ingredients);
                    const margin = recipe.sellingPrice - cost;
                    const foodCostPct = recipe.sellingPrice > 0 ? (cost / recipe.sellingPrice) * 100 : 0;

                    return (
                        <div key={recipe.id} className="card" style={{ display: "flex", flexDirection: "column" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                                <div>
                                    <h3 style={{ margin: 0 }}>{recipe.name}</h3>
                                    <span style={{ fontSize: "0.75rem", background: "rgba(0,0,0,0.05)", padding: "0.1rem 0.5rem", borderRadius: "10px" }}>{recipe.category}</span>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ fontWeight: 700, margin: 0, color: "var(--primary)" }}>KES {recipe.sellingPrice.toLocaleString()}</p>
                                    <p style={{ fontSize: "0.7rem", opacity: 0.7 }}>Selling Price</p>
                                </div>
                            </div>

                            <div style={{ background: "rgba(0,0,0,0.02)", padding: "1rem", borderRadius: "0.5rem", marginBottom: "1rem", flex: 1 }}>
                                <p style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>Cost Breakdown</p>
                                {recipe.ingredients.map((ing: any) => (
                                    <div key={ing.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.2rem" }}>
                                        <span>{ing.item.name} ({ing.quantity} {ing.item.unit})</span>
                                        <span>KES {(ing.quantity * ing.item.buyingPrice).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                <div style={{ padding: "0.5rem", background: "#f1f5f9", borderRadius: "0.4rem", textAlign: "center" }}>
                                    <p style={{ fontSize: "0.6rem", textTransform: "uppercase", opacity: 0.6 }}>Food Cost %</p>
                                    <p style={{ fontWeight: 700, color: foodCostPct > 35 ? "#ef4444" : "#22c55e" }}>{foodCostPct.toFixed(1)}%</p>
                                </div>
                                <div style={{ padding: "0.5rem", background: "#f1f5f9", borderRadius: "0.4rem", textAlign: "center" }}>
                                    <p style={{ fontSize: "0.6rem", textTransform: "uppercase", opacity: 0.6 }}>G.Profit (KES)</p>
                                    <p style={{ fontWeight: 700, color: "#22c55e" }}>{margin.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {recipes.length === 0 && (
                <div className="card" style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
                    <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>👨‍🍳</p>
                    <h3>No Recipes Built Yet</h3>
                    <p>Start building your recipes to unlock automatic food-cost calculation and profit tracking.</p>
                </div>
            )}
        </div>
    );
}
