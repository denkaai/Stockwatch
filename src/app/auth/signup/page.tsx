"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
    const [formData, setFormData] = useState({
        hotelName: "",
        location: "",
        name: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                body: JSON.stringify(formData),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                router.push("/auth/signin?registered=true");
            } else {
                const data = await res.json();
                setError(data.error || "Signup failed");
                setLoading(false);
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    const inputStyle = {
        width: "100%",
        padding: "0.75rem",
        borderRadius: "0.5rem",
        background: "#0f172a",
        border: "1px solid #334155",
        color: "white",
        outline: "none"
    };

    const labelStyle = {
        color: "#cbd5e1",
        marginBottom: "0.4rem",
        display: "block",
        fontSize: "0.85rem",
        fontWeight: 500
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", padding: "2rem 1rem" }}>
            <div className="card" style={{ width: "100%", maxWidth: "550px", background: "#1e293b", border: "1px solid #334155", color: "white" }}>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <h1 style={{ marginBottom: "0.5rem", fontSize: "1.75rem", fontWeight: 800 }}>Start Your Free Trial</h1>
                    <p style={{ color: "#94a3b8" }}>Join 50+ hotels using StockWatch Intelligence.</p>
                </div>

                {error && (
                    <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "0.75rem", borderRadius: "0.5rem", marginBottom: "1.5rem", border: "1px solid rgba(239, 68, 68, 0.2)", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "1.5rem" }}>
                        <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--primary)", fontWeight: 700, marginBottom: "1rem", letterSpacing: "0.05em" }}>Hotel Details</h3>
                        <div style={{ display: "grid", gap: "1rem" }}>
                            <div>
                                <label style={labelStyle}>Hotel Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.hotelName}
                                    onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
                                    placeholder="E.g. Nairobi Safari Club"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Location (County, Town)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="E.g. Nairobi, Westlands"
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ borderTop: "1px solid #334155", margin: "1.5rem 0" }}></div>

                    <div style={{ marginBottom: "2rem" }}>
                        <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "var(--primary)", fontWeight: 700, marginBottom: "1rem", letterSpacing: "0.05em" }}>Owner Account</h3>
                        <div style={{ display: "grid", gap: "1rem" }}>
                            <div>
                                <label style={labelStyle}>Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Min 8 characters"
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: "100%", padding: "0.875rem", fontSize: "1rem", fontWeight: 600 }}>
                        {loading ? "Creating Account..." : "Create Free Account"}
                    </button>
                    <p style={{ fontSize: "0.75rem", color: "#64748b", textAlign: "center", marginTop: "1rem" }}>
                        By joining, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </form>

                <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem", color: "#94a3b8" }}>
                    Already have an account? <Link href="/auth/signin" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>Sign In</Link>
                </p>
            </div>
        </div>
    );
}
