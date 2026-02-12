"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WasteLogger() {
    const [isOpen, setIsOpen] = useState(false);
    const [itemId, setItemId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [reason, setReason] = useState("SPOILED");
    const [notes, setNotes] = useState("");
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await fetch("/api/waste", {
            method: "POST",
            body: JSON.stringify({ itemId, quantity: parseFloat(quantity), reason, notes }),
            headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
            setIsOpen(false);
            setQuantity("");
            setItemId("");
            router.refresh();
        }
        setLoading(false);
    };

    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)} className="btn" style={{ border: "1px solid #ef4444", color: "#ef4444" }}>
                🗑️ Log Waste
            </button>
        );
    }

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
            <div className="card" style={{ width: "90%", maxWidth: "400px" }}>
                <h2 style={{ marginBottom: "1.5rem", color: "#ef4444" }}>Log Kitchen Waste</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Item</label>
                        <select required value={itemId} onChange={e => setItemId(e.target.value)}>
                            <option value="">Select Item</option>
                            {stockItems.map(item => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Quantity Wasted</label>
                        <input type="number" step="0.01" required value={quantity} onChange={e => setQuantity(e.target.value)} />
                    </div>
                    <div className="input-group">
                        <label>Reason</label>
                        <select value={reason} onChange={e => setReason(e.target.value)}>
                            <option value="SPOILED">Spoiled / Expired</option>
                            <option value="OVERCOOKED">Overcooked / Burnt</option>
                            <option value="DAMAGED">Damaged in storage</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Notes</label>
                        <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Extra details..." />
                    </div>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button type="button" onClick={() => setIsOpen(false)} className="btn" style={{ flex: 1, border: "1px solid var(--border)" }}>Cancel</button>
                        <button type="submit" disabled={loading} className="btn" style={{ flex: 1, background: "#ef4444", color: "white" }}>{loading ? "Saving..." : "Log Waste"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
