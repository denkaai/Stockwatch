export default function Footer() {
    return (
        <footer className="footer" style={{
            textAlign: 'center',
            padding: '2rem',
            backgroundColor: 'var(--background-secondary)',
            borderTop: '1px solid var(--border-color)',
            marginTop: 'auto',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem'
        }}>
            <div style={{ marginBottom: '0.5rem' }}>
                <strong>StockWatch</strong> — Smart Food & Cost Control for Hotels 🇰🇪
            </div>
            <div>
                &copy; 2026 Denkaai. All rights reserved.<br />
                Designed and developed by Denkaai.
            </div>
        </footer>
    );
}
