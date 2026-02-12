"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RecipeBuilder() {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [category, setCategory] = useState("Main");
    const [sellingPrice, setSellingPrice] = useState("");
    const [servings, setServings] = useState("1");
    const [ingredients, setIngredients] = useState<{ itemId: string; quantity: number }[]>([]);
    const [stockItems, setStockItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            fetch("/api/stock/items")
                .then(res => res.json())
                .then(data => setStockItems(data));
        }
    }, [isOpen]);

    const addIngredient = () => {
        setIngredients([...ingredients, { itemId: "", quantity: 0 }]);
    };

    const updateIngredient = (index: number, field: string, value: any) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };
        setIngredients(newIngredients);
    };

    const removeIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await fetch("/api/recipes", {
            method: "POST",
            body: JSON.stringify({
                name,
                category,
                sellingPrice: parseFloat(sellingPrice),
                servings: parseInt(servings),
                ingredients
            }),
            headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
            setIsOpen(false);
            setName("");
            setIngredients([]);
            router.refresh();
        }
        setLoading(false);
    };

    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)} className="btn btn-primary">
                + Create Recipe
            </button>
        );
    }

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
            <div className="card" style={{ width: "95%", maxWidth: "600px", maxHeight: "80vh", overflowY: "auto" }}>
                <h2 style={{ marginBottom: "1.5rem" }}>Build Recipe & Costing</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                        <div className="input-group">
                            <label>Recipe Name</label>
                            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Chicken Biryani" />
                        </div>
                        <div className="input-group">
                            <label>Menu Price (KES)</label>
                            <input type="number" required value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} />
                        </div>
                    </div>

                    <div style={{ marginBottom: "1.5rem" }}>
                        <h4 style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>Ingredients</h4>
                        {ingredients.map((ing, index) => (
                            <div key={index} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                <select
                                    style={{ flex: 2, padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid var(--border)" }}
                                    value={ing.itemId}
                                    onChange={e => updateIngredient(index, "itemId", e.target.value)}
                                    required
                                >
                                    <option value="">Select Stock Item</option>
                                    {stockItems.map(item => (
                                        <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Qty"
                                    style={{ flex: 1, padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid var(--border)" }}
                                    value={ing.quantity || ""}
                                    onChange={e => updateIngredient(index, "quantity", parseFloat(e.target.value))}
                                    required
                                />
                                <button type="button" onClick={() => removeIngredient(index)} style={{ padding: "0.5rem", background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "0.5rem", cursor: "pointer" }}>✕</button>
                            </div>
                        ))}
                        <button type="button" onClick={addIngredient} style={{ fontSize: "0.8rem", color: "var(--primary)", background: "none", border: "1px dashed var(--primary)", padding: "0.5rem", width: "100%", borderRadius: "0.5rem", cursor: "pointer" }}>+ Add Ingredient</button>
                    </div>

                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button type="button" onClick={() => setIsOpen(false)} className="btn" style={{ flex: 1, border: "1px solid var(--border)" }}>Cancel</button>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>{loading ? "Saving..." : "Save Recipe"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
