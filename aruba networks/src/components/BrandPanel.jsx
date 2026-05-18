import './BrandPanel.css';

/* ── Aruba SVG logo ─────────────────────────────────── */
function ArubaLogo({ size = 52 }) {
  return (
    <svg
      className="logo-icon"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Aruba Networks logo"
    >
      <circle cx="24" cy="24" r="22" stroke="#FF6B00" strokeWidth="2.5" />
      <path
        d="M12 32 L24 14 L36 32"
        stroke="#FF6B00"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M17 26 L31 26" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const FEATURES = [
  { icon: '🧠', text: 'AIOps-driven automation' },
  { icon: '🔒', text: 'Zero-trust security' },
  { icon: '⚡', text: 'Real-time threat detection' },
  { icon: '🌐', text: 'Multi-cloud SD-WAN' },
];

const STATS = [
  { value: '20K+', label: 'Enterprise Clients' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '150+', label: 'Countries' },
];

/* ── BrandPanel component ───────────────────────────── */
export default function BrandPanel() {
  return (
    <aside className="brand-panel" aria-label="Aruba Networks branding">
      <div className="brand-inner">

        {/* Logo */}
        <div className="logo-wrap">
          <ArubaLogo />
          <span className="logo-text">
            aruba
            <span className="logo-sub">networks</span>
          </span>
        </div>

        {/* Headline */}
        <h1 className="brand-headline">
          AI-Powered<br />
          <span className="gradient-text">Network Intelligence</span>
        </h1>

        <p className="brand-sub">
          Secure, self-healing, and AI-driven infrastructure for the modern
          enterprise. Connect smarter. Scale further.
        </p>

        {/* Feature pills */}
        <ul className="feature-list" aria-label="Key features">
          {FEATURES.map(f => (
            <li key={f.text} className="feature-pill">
              <span className="pill-icon">{f.icon}</span>
              {f.text}
            </li>
          ))}
        </ul>

        {/* Stats */}
        <div className="stat-row" aria-label="Company stats">
          {STATS.map(s => (
            <div key={s.label} className="stat-card">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

      </div>
    </aside>
  );
}
