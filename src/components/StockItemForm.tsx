"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StockItemForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [unit, setUnit] = useState("kg");
    const [buyingPrice, setBuyingPrice] = useState("");
    const [minimumLevel, setMinimumLevel] = useState("");
    const [reorderLevel, setReorderLevel] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/stock/items", {
            method: "POST",
            body: JSON.stringify({
                name,
                unit,
                buyingPrice: parseFloat(buyingPrice) || 0,
                minimumLevel: parseFloat(minimumLevel) || 0,
                reorderLevel: parseFloat(reorderLevel) || 0,
            }),
            headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
            setIsOpen(false);
            setName("");
            setBuyingPrice("");
            setMinimumLevel("");
            setReorderLevel("");
            router.refresh();
        }
    };

    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)} className="btn btn-primary">
                + Add New Item
            </button>
        );
    }

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
            <div className="card" style={{ width: "90%", maxWidth: "480px" }}>
                <h2 style={{ marginBottom: "1.5rem" }}>New Stock Item</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className="input-group" style={{ gridColumn: "span 2" }}>
                            <label>Item Name</label>
                            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="E.g. Basmati Rice" />
                        </div>
                        <div className="input-group">
                            <label>Unit</label>
                            <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                                <option value="kg">Kilograms (kg)</option>
                                <option value="litres">Litres (L)</option>
                                <option value="count">Count (pcs)</option>
                                <option value="bags">Bags</option>
                                <option value="crates">Crates</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Buying Price (KES/unit)</label>
                            <input type="number" step="0.01" value={buyingPrice} onChange={(e) => setBuyingPrice(e.target.value)} placeholder="0.00" />
                        </div>
                        <div className="input-group">
                            <label>Minimum Level</label>
                            <input type="number" step="0.01" value={minimumLevel} onChange={(e) => setMinimumLevel(e.target.value)} placeholder="Alert threshold" />
                        </div>
                        <div className="input-group">
                            <label>Reorder Level</label>
                            <input type="number" step="0.01" value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)} placeholder="Warning threshold" />
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                        <button type="button" onClick={() => setIsOpen(false)} className="btn" style={{ flex: 1, border: "1px solid var(--border)" }}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Item</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
