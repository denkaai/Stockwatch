import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getRoleLabel } from "@/lib/rbac";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin");
    }

    const role = (session.user as any).role || "KITCHEN";

    const navItems = [
        { href: "/dashboard", label: "📊 Overview", roles: ["OWNER", "MANAGER", "KITCHEN"] },
        { href: "/dashboard/inventory", label: "📦 Inventory", roles: ["OWNER", "MANAGER", "KITCHEN"] },
        { href: "/dashboard/recipes", label: "🍽️ Recipes", roles: ["OWNER", "MANAGER"] },
        { href: "/dashboard/sales", label: "📉 Sales Analysis", roles: ["OWNER"] }, // Phase 4
        { href: "/dashboard/purchases", label: "📦 Auto POs", roles: ["OWNER", "MANAGER"] }, // Phase 4
        { href: "/dashboard/shifts", label: "⏱️ Shift Log", roles: ["OWNER", "MANAGER", "KITCHEN"] }, // Phase 4
        { href: "/dashboard/usage", label: "🍳 Usage", roles: ["OWNER", "MANAGER", "KITCHEN"] },
        { href: "/dashboard/waste", label: "🗑️ Waste", roles: ["OWNER", "MANAGER"] },
        { href: "/dashboard/reports", label: "📈 Reports", roles: ["OWNER"] },
        { href: "/dashboard/audit", label: "🔒 Audit Log", roles: ["OWNER"] },
    ];

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            {/* Sidebar */}
            <aside style={{ width: "260px", background: "var(--card)", borderRight: "1px solid var(--border)", padding: "2rem", display: "flex", flexDirection: "column" }}>
                <h2 className="branding" style={{ marginBottom: "0.5rem" }}>StockWatch</h2>
                <p style={{ fontSize: "0.7rem", color: "#64748b", marginBottom: "2rem" }}>Kitchen Intelligence System</p>

                <nav style={{ flex: 1, overflowY: "auto" }}>
                    <ul style={{ listStyle: "none" }}>
                        {navItems
                            .filter(item => item.roles.includes(role))
                            .map(item => (
                                <li key={item.href} style={{ marginBottom: "0.5rem" }}>
                                    <Link href={item.href} style={{
                                        textDecoration: "none",
                                        color: "var(--text)",
                                        fontWeight: 500,
                                        display: "block",
                                        padding: "0.6rem 0.8rem",
                                        borderRadius: "0.5rem",
                                        transition: "background 0.2s",
                                        fontSize: "0.9rem",
                                    }}>
                                        {item.label}
                                    </Link>
                                </li>
                            ))
                        }
                    </ul>
                </nav>

                <div style={{ marginTop: "auto", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                    <div style={{ padding: "0.8rem", background: "rgba(194, 65, 12, 0.1)", borderRadius: "0.5rem", fontSize: "0.875rem", marginBottom: "1rem" }}>
                        <p style={{ fontWeight: 600 }}>{session.user?.name}</p>
                        <p style={{ opacity: 0.7, fontSize: "0.8rem" }}>{(session.user as any).hotelName}</p>
                        <p style={{ fontSize: "0.75rem", marginTop: "0.5rem", color: "var(--primary)" }}>{getRoleLabel(role)}</p>
                    </div>

                    <form action={async () => {
                        "use server";
                        await signOut();
                    }}>
                        <button type="submit" className="btn" style={{ width: "100%", fontSize: "0.875rem", border: "1px solid var(--border)", color: "#ef4444" }}>
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
                {children}

                <footer className="footer" style={{ marginTop: "4rem" }}>
                    <p>Copyright © 2026 Denkaai. All rights reserved.</p>
                    <p>Designed and developed by <span className="branding">Denkaai</span>.</p>
                </footer>
            </main>
        </div>
    );
}
