"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DailySalesInput({ recipes }: { recipes: any[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [recipeId, setRecipeId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await fetch("/api/sales", {
            method: "POST",
            body: JSON.stringify({ recipeId, quantity: parseInt(quantity) }),
            headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
            setIsOpen(false);
            setRecipeId("");
            setQuantity("");
            router.refresh();
        }
        setLoading(false);
    };

    if (!isOpen) {
        return <button onClick={() => setIsOpen(true)} className="btn btn-primary">+ Record Sales</button>;
    }

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
            <div className="card" style={{ width: "90%", maxWidth: "400px" }}>
                <h3 style={{ marginBottom: "1rem" }}>Record Daily Sales</h3>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Menu Item</label>
                        <select required value={recipeId} onChange={e => setRecipeId(e.target.value)}>
                            <option value="">Select Recipe</option>
                            {recipes.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Quantity Sold</label>
                        <input type="number" required min="1" value={quantity} onChange={e => setQuantity(e.target.value)} />
                    </div>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                        <button type="button" onClick={() => setIsOpen(false)} className="btn" style={{ flex: 1, border: "1px solid var(--border)" }}>Cancel</button>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
                            {loading ? "Saving..." : "Save Sales"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
