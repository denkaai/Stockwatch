"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StockUsageForm({ itemId }: { itemId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [quantity, setQuantity] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch("/api/stock/usage", {
            method: "POST",
            body: JSON.stringify({ itemId, quantity: parseFloat(quantity) }),
            headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
            setIsOpen(false);
            setQuantity("");
            router.refresh();
        }
    };

    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)} className="btn" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", border: "1px solid var(--border)" }}>
                - Usage
            </button>
        );
    }

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
            <div className="card" style={{ width: "90%", maxWidth: "400px" }}>
                <h2 style={{ marginBottom: "1.5rem" }}>Record Daily Usage</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Quantity Used</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                        />
                    </div>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button type="button" onClick={() => setIsOpen(false)} className="btn" style={{ flex: 1, border: "1px solid var(--border)" }}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Record Usage</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
