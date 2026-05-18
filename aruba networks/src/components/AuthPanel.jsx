import { useState, useRef, useEffect, useCallback } from 'react';
import './AuthPanel.css';

/* ─────────────────────────────────────────────────────
   UTILITY HOOKS & HELPERS
   ───────────────────────────────────────────────────── */

/** Validate email format */
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

/** Async delay helper */
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/** Compute password strength (0-5) */
function calcStrength(pwd) {
  if (!pwd) return 0;
  let s = 0;
  if (pwd.length >= 8)           s++;
  if (/[A-Z]/.test(pwd))        s++;
  if (/[0-9]/.test(pwd))        s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  if (pwd.length >= 14)          s++;
  return s;
}

const STRENGTH_LEVELS = [
  { pct: '0%',   color: 'transparent',  text: 'Enter password', textColor: 'rgba(130,155,195,0.6)' },
  { pct: '25%',  color: '#ff4d4d',      text: 'Weak',           textColor: '#ff5c5c' },
  { pct: '50%',  color: '#ff9900',      text: 'Fair',           textColor: '#ff9900' },
  { pct: '75%',  color: '#f5d800',      text: 'Good',           textColor: '#f5d800' },
  { pct: '90%',  color: '#36d399',      text: 'Strong',         textColor: '#36d399' },
  { pct: '100%', color: '#00e5a0',      text: 'Very Strong 🔒', textColor: '#00e5a0' },
];

/* ─────────────────────────────────────────────────────
   SMALL REUSABLE SUB-COMPONENTS
   ───────────────────────────────────────────────────── */

/** Aruba SVG logo mark */
function ArubaLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-label="Aruba Networks logo">
      <circle cx="24" cy="24" r="22" stroke="#FF6B00" strokeWidth="2.5" />
      <path d="M12 32 L24 14 L36 32" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M17 26 L31 26" stroke="#FF6B00" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Envelope SVG icon */
function IconEnvelope() {
  return (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M2 5.75A2.75 2.75 0 014.75 3h10.5A2.75 2.75 0 0118 5.75v8.5A2.75 2.75 0 0115.25 17H4.75A2.75 2.75 0 012 14.25v-8.5z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 6l7.5 5 7.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Lock SVG icon */
function IconLock() {
  return (
    <svg viewBox="0 0 20 20" fill="none">
      <rect x="3" y="9" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 9V7a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="13.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

/** User SVG icon */
function IconUser() {
  return (
    <svg viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 17c0-3.314 3.358-6 7.5-6s7.5 2.686 7.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Building SVG icon */
function IconBuilding() {
  return (
    <svg viewBox="0 0 20 20" fill="none">
      <rect x="2" y="7" width="16" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 7V5a4 4 0 018 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Check SVG icon */
function IconCheck() {
  return (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Role icon */
function IconRole() {
  return (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M10 2a6 6 0 100 12A6 6 0 0010 2zM4 18a6 6 0 0112 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Eye (visible) icon */
function IconEyeOpen() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="eye-icon">
      <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Eye (hidden) icon */
function IconEyeClosed() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="eye-icon">
      <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 3l14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── Generic text/email field ────────────────────────── */
function Field({ id, label, type = 'text', placeholder, icon, error, hint, autoComplete, required, value, onChange }) {
  return (
    <div className={`field-group${error ? ' has-error' : value ? ' is-valid' : ''}`}>
      <label className="field-label" htmlFor={id}>{label}</label>
      <div className="field-wrap">
        <span className="field-icon">{icon}</span>
        <input
          id={id}
          name={id}
          type={type}
          className="field-input"
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={onChange}
          aria-describedby={error ? `${id}Error` : hint ? `${id}Hint` : undefined}
          aria-required={required}
          aria-invalid={!!error}
        />
      </div>
      {error && <span className="field-error" id={`${id}Error`} role="alert">⚠ {error}</span>}
      {hint && !error && <span className="field-hint" id={`${id}Hint`}>{hint}</span>}
    </div>
  );
}

/* ── Password field with toggle + optional strength ──── */
function PasswordField({ id, label, placeholder, autoComplete, error, value, onChange, showStrength = false }) {
  const [visible, setVisible] = useState(false);
  const strength = showStrength ? STRENGTH_LEVELS[Math.min(calcStrength(value), 5)] : null;

  return (
    <div className={`field-group${error ? ' has-error' : value && !error ? ' is-valid' : ''}`}>
      <label className="field-label" htmlFor={id}>{label}</label>
      <div className="field-wrap">
        <span className="field-icon"><IconLock /></span>
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          className="field-input"
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          aria-required="true"
          aria-describedby={error ? `${id}Error` : undefined}
          aria-invalid={!!error}
        />
        <button
          type="button"
          className="toggle-password"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible(v => !v)}
          style={{ color: visible ? '#ff6b00' : '' }}
        >
          {visible ? <IconEyeClosed /> : <IconEyeOpen />}
        </button>
      </div>

      {/* Strength meter */}
      {showStrength && strength && (
        <div className="strength-meter" aria-label="Password strength">
          <div className="strength-track">
            <div className="strength-fill" style={{ width: strength.pct, background: strength.color }} />
          </div>
          <span className="strength-label" style={{ color: strength.textColor }}>{strength.text}</span>
        </div>
      )}

      {error && <span className="field-error" id={`${id}Error`} role="alert">⚠ {error}</span>}
    </div>
  );
}

/* ── Checkbox ─────────────────────────────────────────── */
function Checkbox({ id, checked, onChange, children }) {
  return (
    <label className="checkbox-label" htmlFor={id}>
      <input type="checkbox" id={id} name={id} checked={checked} onChange={onChange} style={{ display: 'none' }} />
      <span className={`checkbox-custom${checked ? ' checked' : ''}`} aria-hidden="true" />
      {children}
    </label>
  );
}

/* ── AI Greeting badge ────────────────────────────────── */
const AI_MESSAGES = [
  'AI Security Scan: Active ✓',
  'Zero-Trust Policy: Enforced ✓',
  'Threat Intelligence: Live ✓',
  'AIOps Engine: Running ✓',
  'Network Health: Optimal ✓',
];

function AIGreeting() {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % AI_MESSAGES.length);
        setFade(true);
      }, 350);
    }, 2800);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="ai-greeting" aria-live="polite">
      <span className="ai-dot" aria-hidden="true" />
      <span
        className="ai-text"
        style={{ opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(-6px)' }}
      >
        {AI_MESSAGES[idx]}
      </span>
    </div>
  );
}

/* ── Google brand SVG ─────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

/** Microsoft brand SVG */
function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11.4 24H0V12.6h11.4V24z" fill="#F25022"/>
      <path d="M24 24H12.6V12.6H24V24z" fill="#00A4EF"/>
      <path d="M11.4 11.4H0V0h11.4v11.4z" fill="#7FBA00"/>
      <path d="M24 11.4H12.6V0H24v11.4z" fill="#FFB900"/>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────
   LOGIN FORM
   ───────────────────────────────────────────────────── */
function LoginForm({ showToast }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    const e = {};
    if (!email.trim())         e.email = 'Email address is required.';
    else if (!isValidEmail(email)) e.email = 'Please enter a valid email address.';
    if (!password)             e.password = 'Password is required.';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await delay(1600);
    setLoading(false);
    showToast('✅ Signed in successfully! Redirecting…', 'success');
    setEmail(''); setPassword(''); setRemember(false); setErrors({});
  };

  const handleSocial = (provider) => {
    showToast(`Redirecting to ${provider} sign-in…`, 'info');
  };

  return (
    <form
      id="loginForm"
      className="auth-form"
      noValidate
      onSubmit={handleSubmit}
      role="tabpanel"
      aria-labelledby="tabLogin"
    >
      {/* Header */}
      <div className="form-header">
        <h2 className="form-title">Welcome back</h2>
        <p className="form-subtitle">Sign in to your Aruba Networks account</p>
      </div>

      {/* AI badge */}
      <AIGreeting />

      {/* Email */}
      <Field
        id="loginEmail"
        label="Email Address"
        type="email"
        placeholder="you@company.com"
        icon={<IconEnvelope />}
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
      />

      {/* Password */}
      <PasswordField
        id="loginPassword"
        label="Password"
        placeholder="••••••••••"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />

      {/* Remember + Forgot */}
      <div className="form-row-inline">
        <Checkbox id="rememberMe" checked={remember} onChange={(e) => setRemember(e.target.checked)}>
          Remember me
        </Checkbox>
        <a
          href="#"
          className="link-forgot"
          onClick={(e) => { e.preventDefault(); showToast('📧 Password reset link sent to your email.', 'success'); }}
        >
          Forgot password?
        </a>
      </div>

      {/* Submit */}
      <button type="submit" id="loginBtn" className="btn-primary" disabled={loading} aria-label="Sign in">
        {loading ? <span className="btn-spinner" /> : <span className="btn-text">Sign In</span>}
      </button>

      {/* Divider */}
      <div className="divider"><span>or continue with</span></div>

      {/* Social */}
      <div className="social-row">
        <button type="button" id="btnGoogle" className="btn-social" aria-label="Sign in with Google" onClick={() => handleSocial('Google')}>
          <GoogleIcon /> Google
        </button>
        <button type="button" id="btnMicrosoft" className="btn-social" aria-label="Sign in with Microsoft" onClick={() => handleSocial('Microsoft')}>
          <MicrosoftIcon /> Microsoft
        </button>
      </div>
    </form>
  );
}

/* ─────────────────────────────────────────────────────
   SIGNUP FORM
   ───────────────────────────────────────────────────── */
const ROLE_OPTIONS = [
  { value: 'network-admin',      label: 'Network Administrator' },
  { value: 'it-manager',         label: 'IT Manager' },
  { value: 'security-engineer',  label: 'Security Engineer' },
  { value: 'devops',             label: 'DevOps / Cloud Engineer' },
  { value: 'executive',          label: 'C-Level / Executive' },
  { value: 'other',              label: 'Other' },
];

function SignupForm({ showToast, onSuccessSwitch }) {
  const [fields, setFields] = useState({
    firstName: '', lastName: '', email: '',
    company: '', password: '', confirm: '', role: '',
  });
  const [agreed, setAgreed]   = useState(false);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setFields(f => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!fields.firstName.trim())       e.firstName = 'First name is required.';
    else if (fields.firstName.length < 2) e.firstName = 'Must be at least 2 characters.';
    if (!fields.lastName.trim())        e.lastName = 'Last name is required.';
    if (!fields.email.trim())           e.email = 'Work email is required.';
    else if (!isValidEmail(fields.email)) e.email = 'Enter a valid email address.';
    if (!fields.password)               e.password = 'Password is required.';
    else if (fields.password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (!fields.confirm)                e.confirm = 'Please confirm your password.';
    else if (fields.confirm !== fields.password) e.confirm = 'Passwords do not match.';
    if (!agreed)                        e.terms = 'You must accept the Terms of Service.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await delay(1800);
    setLoading(false);
    showToast(`🎉 Account created for ${fields.firstName}! Welcome to Aruba Networks.`, 'success');
    setTimeout(() => {
      setFields({ firstName: '', lastName: '', email: '', company: '', password: '', confirm: '', role: '' });
      setAgreed(false);
      setErrors({});
      onSuccessSwitch();
    }, 2200);
  };

  return (
    <form
      id="signupForm"
      className="auth-form"
      noValidate
      onSubmit={handleSubmit}
      role="tabpanel"
      aria-labelledby="tabSignup"
    >
      {/* Header */}
      <div className="form-header">
        <h2 className="form-title">Create account</h2>
        <p className="form-subtitle">Join thousands of enterprise teams</p>
      </div>

      {/* Name row */}
      <div className="field-row-2">
        <Field
          id="firstName"
          label="First Name"
          placeholder="John"
          icon={<IconUser />}
          autoComplete="given-name"
          required
          value={fields.firstName}
          onChange={set('firstName')}
          error={errors.firstName}
        />
        <Field
          id="lastName"
          label="Last Name"
          placeholder="Doe"
          icon={<IconUser />}
          autoComplete="family-name"
          required
          value={fields.lastName}
          onChange={set('lastName')}
          error={errors.lastName}
        />
      </div>

      {/* Email */}
      <Field
        id="signupEmail"
        label="Work Email"
        type="email"
        placeholder="john@company.com"
        icon={<IconEnvelope />}
        autoComplete="email"
        required
        value={fields.email}
        onChange={set('email')}
        error={errors.email}
      />

      {/* Company (optional) */}
      <Field
        id="company"
        label="Company / Organisation"
        placeholder="Acme Corp"
        icon={<IconBuilding />}
        autoComplete="organization"
        value={fields.company}
        onChange={set('company')}
        hint="Optional — helps us tailor your experience"
      />

      {/* Password with strength meter */}
      <PasswordField
        id="signupPassword"
        label="Password"
        placeholder="Create a strong password"
        autoComplete="new-password"
        value={fields.password}
        onChange={set('password')}
        error={errors.password}
        showStrength
      />

      {/* Confirm password */}
      <PasswordField
        id="confirmPassword"
        label="Confirm Password"
        placeholder="Repeat your password"
        autoComplete="new-password"
        value={fields.confirm}
        onChange={set('confirm')}
        error={errors.confirm}
      />

      {/* Role selector */}
      <div className="field-group">
        <label className="field-label" htmlFor="role">Your Role</label>
        <div className="field-wrap select-wrap">
          <span className="field-icon"><IconRole /></span>
          <select
            id="role"
            name="role"
            className="field-input field-select"
            value={fields.role}
            onChange={set('role')}
            aria-label="Select your role"
          >
            <option value="" disabled>Select your role</option>
            {ROLE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span className="select-arrow">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>

      {/* Terms */}
      <div>
        <Checkbox id="agreeTerms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}>
          I agree to Aruba's{' '}
          <a href="#" className="link-inline" onClick={(e) => e.preventDefault()}>Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="link-inline" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
        </Checkbox>
        {errors.terms && (
          <span className="field-error" id="agreeTermsError" role="alert" style={{ marginTop: 4 }}>
            ⚠ {errors.terms}
          </span>
        )}
      </div>

      {/* Submit */}
      <button type="submit" id="signupBtn" className="btn-primary" disabled={loading} aria-label="Create account">
        {loading ? <span className="btn-spinner" /> : <span className="btn-text">Create Account</span>}
      </button>
    </form>
  );
}

/* ─────────────────────────────────────────────────────
   TOAST NOTIFICATION
   ───────────────────────────────────────────────────── */
function Toast({ message, type, visible }) {
  return (
    <div
      className={`toast-fixed${visible ? ' show' : ''} ${type}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {message}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   AUTH PANEL (tabs + forms)
   ───────────────────────────────────────────────────── */
export default function AuthPanel() {
  const [activeTab, setActiveTab] = useState('login');
  const [toast, setToast]         = useState({ msg: '', type: 'info', visible: false });
  const toastTimer                = useRef(null);

  const showToast = useCallback((msg, type = 'info') => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type, visible: true });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3200);
  }, []);

  const switchTab = (tab) => setActiveTab(tab);

  return (
    <main className="auth-panel" aria-label="Authentication" aria-live="polite">
      {/* Mobile logo */}
      <div className="mobile-logo" aria-hidden="true">
        <ArubaLogo />
        <span>aruba <strong>networks</strong></span>
      </div>

      {/* Tab switcher */}
      <div className="tab-switcher" role="tablist" aria-label="Authentication tabs">
        <button
          id="tabLogin"
          className={`tab-btn${activeTab === 'login' ? ' active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'login'}
          aria-controls="loginForm"
          onClick={() => switchTab('login')}
        >
          Sign In
        </button>
        <button
          id="tabSignup"
          className={`tab-btn${activeTab === 'signup' ? ' active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'signup'}
          aria-controls="signupForm"
          onClick={() => switchTab('signup')}
        >
          Create Account
        </button>
        <div
          className={`tab-indicator${activeTab === 'signup' ? ' right' : ''}`}
          aria-hidden="true"
        />
      </div>

      {/* Conditionally render the active form */}
      {activeTab === 'login'
        ? <LoginForm showToast={showToast} />
        : <SignupForm showToast={showToast} onSuccessSwitch={() => switchTab('login')} />
      }

      {/* Toast */}
      <Toast message={toast.msg} type={toast.type} visible={toast.visible} />
    </main>
  );
}
