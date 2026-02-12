"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PurchasesPage() {
    const [pos, setPos] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetch("/api/purchases")
            .then(res => res.json())
            .then(data => setPos(data));
    }, []);

    const generatePO = async () => {
        setLoading(true);
        const res = await fetch("/api/purchases", { method: "POST" });
        if (res.ok) {
            const newPO = await res.json();
            if (newPO.message) {
                alert(newPO.message);
            } else {
                setPos([newPO, ...pos]);
                router.refresh();
            }
        }
        setLoading(false);
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1>📦 Purchase Orders (PO)</h1>
                    <p style={{ color: "#64748b" }}>Auto-generated orders based on low stock levels.</p>
                </div>
                <button onClick={generatePO} disabled={loading} className="btn btn-primary">
                    {loading ? "Generating..." : "⚡ Auto-Generate PO"}
                </button>
            </div>

            <div style={{ display: "grid", gap: "1.5rem" }}>
                {pos.map(po => (
                    <div key={po.id} className="card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                            <div>
                                <h3 style={{ margin: 0 }}>PO #{po.id.slice(-6).toUpperCase()}</h3>
                                <p style={{ fontSize: "0.8rem", opacity: 0.6 }}>{new Date(po.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <span style={{
                                    padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700,
                                    background: po.status === "DRAFT" ? "#fef3c7" : "#dcfce7",
                                    color: po.status === "DRAFT" ? "#d97706" : "#166534"
                                }}>
                                    {po.status}
                                </span>
                                <p style={{ fontWeight: 800, marginTop: "0.2rem" }}>KES {po.totalCost.toLocaleString()}</p>
                            </div>
                        </div>

                        <table style={{ width: "100%", fontSize: "0.85rem", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ opacity: 0.6, fontSize: "0.75rem", borderBottom: "1px solid var(--border)" }}>
                                    <th style={{ textAlign: "left", padding: "0.5rem" }}>Item</th>
                                    <th style={{ textAlign: "left", padding: "0.5rem" }}>Qty Order</th>
                                    <th style={{ textAlign: "right", padding: "0.5rem" }}>Est. Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                {po.items.map((item: any) => (
                                    <tr key={item.id}>
                                        <td style={{ padding: "0.5rem" }}>{item.item?.name || "Unknown Item"}</td>
                                        <td style={{ padding: "0.5rem" }}>{item.quantity} {item.item?.unit}</td>
                                        <td style={{ padding: "0.5rem", textAlign: "right" }}>KES {(item.quantity * item.unitCost).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                            <button className="btn" style={{ fontSize: "0.8rem", padding: "0.4rem 1rem", background: "#f1f5f9" }}>Download PDF</button>
                            <button className="btn" style={{ fontSize: "0.8rem", padding: "0.4rem 1rem", background: "#25D366", color: "white" }}>Send via WhatsApp</button>
                        </div>
                    </div>
                ))}

                {pos.length === 0 && (
                    <div style={{ textAlign: "center", padding: "3rem", opacity: 0.5 }}>
                        <p>No purchase orders yet. Click Auto-Generate to start.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
