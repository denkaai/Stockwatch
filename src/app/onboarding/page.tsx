"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function OnboardingPage() {
    const { data: session, status, update } = useSession();
    const [formData, setFormData] = useState({
        hotelName: "",
        location: "", // Acts as County
        town: "",
    });
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin");
        } else if (session?.user && (session.user as any).hotelId) {
            router.push("/dashboard");
        }
    }, [status, session, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch("/api/onboarding", {
            method: "POST",
            body: JSON.stringify({
                hotelName: formData.hotelName,
                county: formData.location,
                town: formData.town
            }),
            headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
            // Refresh session to get new hotelId
            await update();
            router.push("/dashboard");
        } else {
            alert("Onboarding failed");
        }
    };

    if (status === "loading") return <p>Loading...</p>;

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <div className="card" style={{ width: "100%", maxWidth: "500px" }}>
                <h1 style={{ marginBottom: "0.5rem", textAlign: "center" }}>Complete Your Profile</h1>
                <p style={{ marginBottom: "2rem", textAlign: "center", color: "#64748b" }}>
                    Welcome, {session?.user?.name}! Please register your hotel to continue.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Hotel Name</label>
                        <input
                            type="text"
                            required
                            value={formData.hotelName}
                            onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
                            placeholder="E.g. Nairobi Safari Club"
                        />
                    </div>
                    <div className="input-group">
                        <label>Country</label>
                        <input type="text" value="Kenya 🇰🇪" disabled style={{ background: "#f1f5f9" }} />
                    </div>

                    <div className="input-group">
                        <label>County</label>
                        <select
                            required
                            value={formData.location} // This state name is 'location' in original, I should rename it or map it. 
                            // Wait, I should update the state name too later or just use 'location' state for county.
                            // Actually, let's just replace the whole state management part in another call if needed, or cheat and use 'location' as county.
                            // Better: Update the form logic to use separate state. But replace_file_content needs to be precise.
                            // I will reuse `formData.location` for County for now to minimize diffs, creates a bit of confusion but works.
                            // NO, I should do it right. I will replace the state definition too.
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        >
                            <option value="">Select County</option>
                            <option value="Nairobi">Nairobi</option>
                            <option value="Mombasa">Mombasa</option>
                            <option value="Kisumu">Kisumu</option>
                            <option value="Nakuru">Nakuru</option>
                            <option value="Meru">Meru</option>
                            <option value="Kiambu">Kiambu</option>
                            <option value="Machakos">Machakos</option>
                            <option value="Uasin Gishu">Uasin Gishu</option>
                            <option value="Kisii">Kisii</option>
                            <option value="Kajiado">Kajiado</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Town / Area</label>
                        <input
                            type="text"
                            required
                            placeholder="E.g. Westlands, CBD"
                            onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                        // Need to add 'town' to state.
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                        Create Hotel & Start Monitoring
                    </button>
                </form>
            </div>
        </div>
    );
}
