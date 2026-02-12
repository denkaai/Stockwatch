"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StockEntryForm({ itemId }: { itemId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [quantity, setQuantity] = useState("");
    const [unitPrice, setUnitPrice] = useState("");
    const [supplier, setSupplier] = useState("");
    const [receipt, setReceipt] = useState<File | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const receiptUrl = receipt ? `https://demo-receipts.com/${receipt.name}` : null;

        const res = await fetch("/api/stock/entries", {
            method: "POST",
            body: JSON.stringify({
                itemId,
                quantity: parseFloat(quantity),
                unitPrice: parseFloat(unitPrice) || 0,
                supplier: supplier || null,
                receiptUrl,
            }),
            headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
            setIsOpen(false);
            setQuantity("");
            setUnitPrice("");
            setSupplier("");
            setReceipt(null);
            router.refresh();
        }
    };

    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)} className="btn btn-primary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>
                + Entry
            </button>
        );
    }

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
            <div className="card" style={{ width: "90%", maxWidth: "480px" }}>
                <h2 style={{ marginBottom: "1.5rem" }}>Add Stock Receipt</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div className="input-group">
                            <label>Quantity Purchased</label>
                            <input type="number" step="0.01" required value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label>Unit Price (KES)</label>
                            <input type="number" step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} placeholder="Price per unit" />
                        </div>
                        <div className="input-group" style={{ gridColumn: "span 2" }}>
                            <label>Supplier Name</label>
                            <input type="text" value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="E.g. Naivas, Wholesale Market" />
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Receipt Photo (Required)</label>
                        <input type="file" accept="image/*" required onChange={(e) => setReceipt(e.target.files?.[0] || null)} />
                    </div>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button type="button" onClick={() => setIsOpen(false)} className="btn" style={{ flex: 1, border: "1px solid var(--border)" }}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add Stock</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
