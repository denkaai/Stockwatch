"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ShiftsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [shiftType, setShiftType] = useState("MORNING");
    const [notes, setNotes] = useState("");
    const [cashHandover, setCashHandover] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetch("/api/shifts")
            .then(res => res.json())
            .then(data => setLogs(data));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await fetch("/api/shifts", {
            method: "POST",
            body: JSON.stringify({ shiftType, notes, cashHandover }),
            headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
            const newLog = await res.json();
            setLogs([newLog, ...logs]);
            setNotes("");
            setCashHandover("");
            router.refresh();
        }
        setLoading(false);
    };

    return (
        <div>
            <div style={{ marginBottom: "2rem" }}>
                <h1>⏱️ Digital Shift Handover</h1>
                <p style={{ color: "#64748b" }}>Track accountability between shifts.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
                {/* Handover Form */}
                <div className="card" style={{ height: "fit-content" }}>
                    <h3>Log Handover</h3>
                    <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
                        <div className="input-group">
                            <label>Shift Type</label>
                            <select value={shiftType} onChange={e => setShiftType(e.target.value)}>
                                <option value="MORNING">Morning Shift</option>
                                <option value="EVENING">Evening Shift</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Cash Handover (KES)</label>
                            <input type="number" value={cashHandover} onChange={e => setCashHandover(e.target.value)} placeholder="0.00" />
                        </div>
                        <div className="input-group">
                            <label>Handoff Notes</label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="E.g. Freezer 2 acting up, 3kg meat remaining..."
                                style={{ width: "100%", padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid var(--border)", minHeight: "100px" }}
                            />
                        </div>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%" }}>
                            {loading ? "Logging..." : "Complete Handover"}
                        </button>
                    </form>
                </div>

                {/* Logs Feed */}
                <div className="card">
                    <h3>Recent Shift Logs</h3>
                    <div style={{ marginTop: "1rem" }}>
                        {logs.map(log => (
                            <div key={log.id} style={{ padding: "1rem", borderBottom: "1px solid var(--border)", display: "flex", gap: "1rem" }}>
                                <div style={{
                                    width: "40px", height: "40px", borderRadius: "50%",
                                    background: log.shiftType === "MORNING" ? "#dbeafe" : "#fae8ff",
                                    color: log.shiftType === "MORNING" ? "#1d4ed8" : "#86198f",
                                    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem"
                                }}>
                                    {log.shiftType === "MORNING" ? "AM" : "PM"}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                                        <span style={{ fontWeight: 600 }}>{log.staffName}</span>
                                        <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>{new Date(log.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p style={{ fontSize: "0.9rem", color: "#334155", marginBottom: "0.5rem" }}>{log.notes}</p>
                                    {log.cashHandover > 0 && (
                                        <span style={{ fontSize: "0.75rem", background: "#dcfce7", color: "#166534", padding: "0.1rem 0.4rem", borderRadius: "10px", fontWeight: 600 }}>
                                            💵 Cash: KES {log.cashHandover.toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {logs.length === 0 && <p style={{ opacity: 0.5, padding: "1rem", textAlign: "center" }}>No logs yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
