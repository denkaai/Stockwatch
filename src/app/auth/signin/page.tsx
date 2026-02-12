"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
                setLoading(false);
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            setError("Something went wrong");
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", padding: "1rem" }}>
            <div className="card" style={{ width: "100%", maxWidth: "420px", background: "#1e293b", border: "1px solid #334155", color: "white" }}>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <h1 style={{ marginBottom: "0.5rem", fontSize: "1.75rem", fontWeight: 800 }}>Welcome Back</h1>
                    <p style={{ color: "#94a3b8" }}>Sign in to access your kitchen intelligence.</p>
                </div>

                {error && (
                    <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "0.75rem", borderRadius: "0.5rem", marginBottom: "1.5rem", border: "1px solid rgba(239, 68, 68, 0.2)", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group" style={{ marginBottom: "1.25rem" }}>
                        <label style={{ color: "#cbd5e1", marginBottom: "0.5rem", display: "block", fontSize: "0.9rem" }}>Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="owner@hotel.com"
                            style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", background: "#0f172a", border: "1px solid #334155", color: "white", outline: "none" }}
                        />
                    </div>
                    <div className="input-group" style={{ marginBottom: "1.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                            <label style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>Password</label>
                            <a href="#" style={{ fontSize: "0.8rem", color: "var(--primary)", textDecoration: "none" }}>Forgot?</a>
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", background: "#0f172a", border: "1px solid #334155", color: "white", outline: "none" }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: "100%", padding: "0.875rem", fontSize: "1rem", fontWeight: 600, display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
                        {loading ? "Signing In..." : "Sign In to Dashboard"}
                        {!loading && <span>→</span>}
                    </button>
                </form>

                <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem", color: "#94a3b8" }}>
                    Don't have an account? <Link href="/auth/signup" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>Start Free Trial</Link>
                </p>
            </div>
        </div>
    );
}
