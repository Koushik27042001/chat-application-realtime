import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* ─── Animated Floating Input ─────────────────────────────────── */
const FloatingInput = ({ label, type, name, value, onChange, children }) => {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div style={{ position: "relative" }}>
      <label
        style={{
          position: "absolute",
          left: "1rem",
          top: active ? "0.45rem" : "50%",
          transform: active ? "translateY(0) scale(0.78)" : "translateY(-50%) scale(1)",
          transformOrigin: "left center",
          color: focused ? "#a78bfa" : "#94a3b8",
          pointerEvents: "none",
          transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
          fontSize: "0.95rem",
          fontWeight: 500,
          zIndex: 2,
          letterSpacing: "0.01em",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete="off"
        style={{
          width: "100%",
          padding: "1.4rem 3rem 0.55rem 1rem",
          background: "rgba(255,255,255,0.04)",
          border: `1.5px solid ${focused ? "#a78bfa" : "rgba(255,255,255,0.1)"}`,
          borderRadius: "1rem",
          color: "#f1f5f9",
          fontSize: "0.95rem",
          outline: "none",
          transition: "border 0.22s, box-shadow 0.22s, background 0.22s",
          boxShadow: focused ? "0 0 0 3px rgba(167,139,250,0.15)" : "none",
          backdropFilter: "blur(4px)",
        }}
      />
      {children && (
        <div style={{
          position: "absolute",
          insetInlineEnd: "0",
          top: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          paddingRight: "1rem",
        }}>
          {children}
        </div>
      )}
    </div>
  );
};

/* ─── Main Component ──────────────────────────────────────────── */
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (e) =>
    setFormData((c) => ({ ...c, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(formData);
      navigate("/chat");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Unable to log in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080b14; font-family: 'DM Sans', sans-serif; }

        .login-root {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.25rem;
          position: relative;
          overflow: hidden;
          background: radial-gradient(ellipse 80% 60% at 50% -10%, #1a0a3c 0%, #080b14 70%);
        }
        .login-root::before {
          content: '';
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(167,139,250,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(167,139,250,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none; z-index: 0;
        }

        @keyframes drift1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(40px,50px) scale(1.08); }
        }
        @keyframes drift2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(-35px,-40px) scale(1.1); }
        }
        @keyframes drift3 {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(20px,-30px); }
        }

        .card {
          position: relative; z-index: 1;
          width: 100%; max-width: 980px;
          display: grid; grid-template-columns: 1fr;
          border-radius: 1.75rem; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(167,139,250,0.06) inset;
          background: rgba(10,12,24,0.72);
          backdrop-filter: blur(28px) saturate(1.5);
          opacity: 0;
          transform: translateY(28px) scale(0.98);
          transition: opacity 0.55s cubic-bezier(.4,0,.2,1), transform 0.55s cubic-bezier(.4,0,.2,1);
        }
        .card.show { opacity: 1; transform: translateY(0) scale(1); }
        @media (min-width: 768px) { .card { grid-template-columns: 1.1fr 0.9fr; } }

        .panel-left {
          display: none;
          padding: 3rem 3rem 3rem 3.5rem;
          background: linear-gradient(135deg, rgba(109,40,217,0.22) 0%, rgba(14,165,233,0.1) 100%);
          border-right: 1px solid rgba(255,255,255,0.06);
          flex-direction: column; justify-content: space-between;
          position: relative; overflow: hidden;
        }
        @media (min-width: 768px) { .panel-left { display: flex; } }
        .panel-left::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(167,139,250,0.4), transparent);
        }

        .brand-badge {
          display: inline-flex; align-items: center; gap: 0.45rem;
          background: rgba(167,139,250,0.12);
          border: 1px solid rgba(167,139,250,0.25);
          border-radius: 2rem; padding: 0.35rem 0.85rem;
          font-size: 0.72rem; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #c4b5fd; width: fit-content;
        }
        .brand-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #a78bfa; animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(0.7); }
        }

        .panel-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 800; line-height: 1.12;
          color: #f8fafc; margin-top: 2rem; letter-spacing: -0.02em;
        }
        .panel-title span {
          background: linear-gradient(135deg, #a78bfa, #38bdf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .panel-sub {
          margin-top: 1.25rem; font-size: 0.875rem;
          color: #94a3b8; line-height: 1.7; max-width: 320px;
        }
        .feature-list { margin-top: 2.5rem; display: flex; flex-direction: column; gap: 0.85rem; }
        .feature-item { display: flex; align-items: center; gap: 0.75rem; font-size: 0.82rem; color: #cbd5e1; }
        .feature-icon {
          width: 28px; height: 28px; border-radius: 0.5rem;
          background: rgba(167,139,250,0.15); border: 1px solid rgba(167,139,250,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; flex-shrink: 0;
        }
        .deco-circle { position: absolute; border-radius: 50%; border: 1px solid rgba(167,139,250,0.15); }

        .panel-right {
          padding: 2.5rem 2rem;
          display: flex; flex-direction: column; justify-content: center;
        }
        @media (min-width: 480px) { .panel-right { padding: 3rem 2.75rem; } }

        .form-title {
          font-family: 'Syne', sans-serif; font-size: 1.85rem;
          font-weight: 700; color: #f1f5f9; letter-spacing: -0.02em;
        }
        .form-sub { margin-top: 0.4rem; font-size: 0.83rem; color: #64748b; }

        .divider { display: flex; align-items: center; gap: 0.75rem; margin: 1.5rem 0; }
        .divider::before, .divider::after {
          content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.07);
        }
        .divider span { font-size: 0.72rem; color: #475569; letter-spacing: 0.06em; text-transform: uppercase; }

        .social-btn {
          width: 100%; display: flex; align-items: center; justify-content: center;
          gap: 0.65rem; padding: 0.75rem 1rem;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
          border-radius: 0.85rem; color: #cbd5e1; font-size: 0.85rem; font-weight: 500;
          cursor: pointer; transition: background 0.18s, border-color 0.18s, transform 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .social-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.16); transform: translateY(-1px); }
        .social-btn:active { transform: translateY(0); }

        .fields { display: flex; flex-direction: column; gap: 1rem; margin-top: 0.5rem; }

        .error-box {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.7rem 0.9rem; margin-top: 1rem;
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
          border-radius: 0.75rem; color: #fca5a5; font-size: 0.8rem;
          animation: shake 0.35s ease;
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25%      { transform: translateX(-6px); }
          75%      { transform: translateX(6px); }
        }

        .submit-btn {
          position: relative; width: 100%; padding: 0.95rem;
          border-radius: 1rem;
          font-family: 'Syne', sans-serif; font-size: 0.95rem;
          font-weight: 700; color: #fff; letter-spacing: 0.02em;
          cursor: pointer; border: none; overflow: hidden;
          background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
          transition: opacity 0.2s, transform 0.18s, box-shadow 0.2s;
          box-shadow: 0 4px 24px rgba(124,58,237,0.4);
        }
        .submit-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, #6d28d9 0%, #1d4ed8 100%);
          opacity: 0; transition: opacity 0.22s;
        }
        .submit-btn:hover:not(:disabled)::before { opacity: 1; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(124,58,237,0.55); }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .submit-btn span { position: relative; z-index: 1; }
        .submit-btn .shimmer {
          position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          animation: shimmer 2.5s infinite; z-index: 1;
        }
        @keyframes shimmer { 0% { left: -100%; } 100% { left: 200%; } }

        .spinner {
          display: inline-block; width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
          border-radius: 50%; animation: spin 0.7s linear infinite;
          vertical-align: middle; margin-right: 0.5rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .footer-link { margin-top: 1.5rem; text-align: center; font-size: 0.82rem; color: #475569; }
        .footer-link a { color: #a78bfa; font-weight: 600; text-decoration: none; transition: color 0.15s; }
        .footer-link a:hover { color: #c4b5fd; }

        .eye-btn {
          background: none; border: none; cursor: pointer; color: #64748b;
          display: flex; align-items: center; padding: 0.25rem; transition: color 0.15s;
        }
        .eye-btn:hover { color: #a78bfa; }

        .forgot {
          display: block; text-align: right; font-size: 0.78rem;
          color: #a78bfa; text-decoration: none; margin-top: 0.25rem; transition: color 0.15s;
        }
        .forgot:hover { color: #c4b5fd; }

        .reveal {
          opacity: 0; transform: translateY(16px);
          transition: opacity 0.45s cubic-bezier(.4,0,.2,1), transform 0.45s cubic-bezier(.4,0,.2,1);
        }
        .reveal.show { opacity: 1; transform: none; }
        .d1 { transition-delay: 0.12s; }
        .d2 { transition-delay: 0.22s; }
        .d3 { transition-delay: 0.32s; }
        .d4 { transition-delay: 0.40s; }
        .d5 { transition-delay: 0.48s; }
      `}</style>

      <main className="login-root">
        {/* Ambient orbs */}
        <div style={{ position: "absolute", borderRadius: "50%", filter: "blur(80px)", opacity: 0.25, width: 500, height: 500, top: -160, left: -120, background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)", animation: "drift1 14s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", borderRadius: "50%", filter: "blur(80px)", opacity: 0.2, width: 380, height: 380, bottom: -100, right: -80, background: "radial-gradient(circle, #0ea5e9 0%, transparent 70%)", animation: "drift2 18s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", borderRadius: "50%", filter: "blur(60px)", opacity: 0.18, width: 200, height: 200, top: "45%", right: "10%", background: "radial-gradient(circle, #f472b6 0%, transparent 70%)", animation: "drift3 11s ease-in-out infinite", pointerEvents: "none" }} />

        <div className={`card ${mounted ? "show" : ""}`}>

          {/* ── Left Panel ── */}
          <div className="panel-left">
            <div className="deco-circle" style={{ width: 300, height: 300, bottom: -100, right: -80, opacity: 0.15 }} />
            <div className="deco-circle" style={{ width: 180, height: 180, bottom: -40, right: -20, opacity: 0.1 }} />

            <div>
              <div className="brand-badge">
                <span className="brand-badge-dot" />
                Secure Access
              </div>
              <h1 className="panel-title">
                Your ideas,<br /><span>amplified</span><br />by AI.
              </h1>
              <p className="panel-sub">
                Sign in to your workspace and pick up exactly where you left
                off — conversations, history, everything intact.
              </p>
              <div className="feature-list">
                {[
                  { icon: "🔒", text: "End-to-end encrypted sessions" },
                  { icon: "⚡", text: "Instant response, zero lag" },
                  { icon: "💾", text: "Full conversation history saved" },
                ].map((f, i) => (
                  <div className="feature-item" key={i}>
                    <div className="feature-icon">{f.icon}</div>
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="panel-right">
            <div className={`reveal d1 ${mounted ? "show" : ""}`}>
              <p className="form-title">Welcome back 👋</p>
              <p className="form-sub">Sign in to continue to your dashboard</p>
            </div>

            {/* Google SSO */}
            <div className={`reveal d2 ${mounted ? "show" : ""}`} style={{ marginTop: "1.75rem" }}>
              <button className="social-btn" type="button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </div>

            <div className={`reveal d2 ${mounted ? "show" : ""}`}>
              <div className="divider"><span>or sign in with email</span></div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={`fields reveal d3 ${mounted ? "show" : ""}`}>
                <FloatingInput
                  label="Email address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <div>
                  <FloatingInput
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  >
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </FloatingInput>
                  <a href="/forgot-password" className="forgot">Forgot password?</a>
                </div>
              </div>

              {error && (
                <div className="error-box">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              <div className={`reveal d4 ${mounted ? "show" : ""}`} style={{ marginTop: "1.5rem" }}>
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  <div className="shimmer" />
                  <span>
                    {isSubmitting ? (
                      <><span className="spinner" />Signing you in…</>
                    ) : (
                      "Enter Dashboard →"
                    )}
                  </span>
                </button>
              </div>
            </form>

            <div className={`footer-link reveal d5 ${mounted ? "show" : ""}`}>
              New here?{" "}
              <Link to="/register">Create a free account</Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Login;