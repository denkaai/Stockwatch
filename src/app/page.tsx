import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{ background: "#0f172a", color: "white", minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{ padding: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ color: "var(--primary)", fontWeight: 800, fontSize: "2rem" }}>StockWatch</h2>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <Link href="#features" style={{ color: "white", textDecoration: "none", opacity: 0.8 }}>Features</Link>
          <Link href="#pricing" style={{ color: "white", textDecoration: "none", opacity: 0.8 }}>Pricing</Link>
          <Link href="/auth/signin" className="btn btn-primary" style={{ padding: "0.6rem 2rem" }}>Login</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "8rem 2rem", textAlign: "center" }}>
        <span style={{ background: "rgba(194, 65, 12, 0.2)", color: "var(--primary)", padding: "0.5rem 1rem", borderRadius: "30px", fontSize: "0.85rem", fontWeight: 700 }}>NEW: KITCHEN INTELLIGENCE 2.0</span>
        <h1 style={{ fontSize: "4.5rem", fontWeight: 900, marginTop: "2rem", lineHeight: 1.1 }}>Stop Kitchen Loss.<br /><span style={{ color: "var(--primary)" }}>Grow Your Profit.</span></h1>
        <p style={{ fontSize: "1.25rem", color: "#94a3b8", maxWidth: "700px", margin: "2rem auto", lineHeight: 1.6 }}>The only stock management system designed specifically for Kenyan hotels. WhatsApp alerts, Recipe costing, Fraud detection, and Real-time analytics.</p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "3rem" }}>
          <Link href="/auth/signup" className="btn btn-primary" style={{ padding: "1rem 3rem", fontSize: "1.1rem" }}>Start Free Trial</Link>
          <Link href="#demo" className="btn" style={{ border: "1px solid #334155", color: "white", padding: "1rem 3rem" }}>Watch Demo</Link>
        </div>

        <div style={{ marginTop: "6rem", display: "flex", justifyContent: "center", gap: "4rem", opacity: 0.4, filter: "grayscale(1)" }}>
          <span style={{ fontSize: "1.5rem", fontWeight: 800 }}>MITSUMI</span>
          <span style={{ fontSize: "1.5rem", fontWeight: 800 }}>PRIDEINN</span>
          <span style={{ fontSize: "1.5rem", fontWeight: 800 }}>SAROVA</span>
          <span style={{ fontSize: "1.5rem", fontWeight: 800 }}>VILLA ROSA</span>
        </div>
      </section>

      {/* Killer Features */}
      <section id="features" style={{ background: "#1e293b", padding: "8rem 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "5rem" }}>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800 }}>Why StockWatch?</h2>
            <p style={{ color: "#94a3b8" }}>Built for the unique challenges of the hospitality industry.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
            <FeatureCard icon="📱" title="WhatsApp Alerts" desc="Real-time notifications for low stock and usage spikes sent directly to the owner." />
            <FeatureCard icon="🥘" title="Recipe Costing" desc="Link your menu and ingredients. See exactly how much profit you make per plate." />
            <FeatureCard icon="🛡️" title="Fraud Control" desc="Mandatory receipt uploads and audit logs ensure every gram of stock is accounted for." />
            <FeatureCard icon="📊" title="Daily Analytics" desc="Get a bird's eye view of your kitchen's efficiency and waste patterns." />
            <FeatureCard icon="🇰🇪" title="Made for Kenya" desc="Localized for Kenyan counties and towns. MPESA and local supplier integration ready." />
            <FeatureCard icon="🧠" title="Smart Forecasting" desc="Our system predicts when you'll run out of stock based on historical patterns." />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "4rem 2rem", background: "#0f172a", borderTop: "1px solid #1e293b", textAlign: "center" }}>
        <p style={{ color: "#94a3b8" }}>© 2026 Denkaai. All rights reserved.</p>
        <p style={{ color: "var(--primary)", fontWeight: 700, marginTop: "0.5rem" }}>StockWatch</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div style={{ background: "#0f172a", padding: "2.5rem", borderRadius: "1.5rem", border: "1px solid #334155" }}>
      <span style={{ fontSize: "2.5rem", marginBottom: "1.5rem", display: "block" }}>{icon}</span>
      <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>{title}</h3>
      <p style={{ color: "#94a3b8", lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}
