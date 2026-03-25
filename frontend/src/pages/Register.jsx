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
          position: "absolute", insetInlineEnd: "0",
          top: 0, bottom: 0,
          display: "flex", alignItems: "center", paddingRight: "1rem",
        }}>
          {children}
        </div>
      )}
    </div>
  );
};

/* ─── Password Strength Meter ─────────────────────────────────── */
const StrengthMeter = ({ password }) => {
  const calc = (pw) => {
    if (!pw) return { score: 0, label: "", color: "transparent" };
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    const map = [
      { label: "Too weak", color: "#ef4444" },
      { label: "Weak",     color: "#f97316" },
      { label: "Fair",     color: "#eab308" },
      { label: "Strong",   color: "#22c55e" },
      { label: "Strong",   color: "#22c55e" },
    ];
    return { score: s, ...map[s] };
  };
  const { score, label, color } = calc(password);
  if (!password) return null;

  return (
    <div style={{ marginTop: "0.5rem", paddingLeft: "0.25rem" }}>
      <div style={{ display: "flex", gap: "0.3rem", marginBottom: "0.3rem" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 99,
            background: i <= score ? color : "rgba(255,255,255,0.08)",
            transition: "background 0.3s",
          }} />
        ))}
      </div>
      <p style={{ fontSize: "0.7rem", color, fontWeight: 500 }}>{label}</p>
    </div>
  );
};

/* ─── Main Component ──────────────────────────────────────────── */
const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError]           = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted]       = useState(false);
  const [agreed, setAgreed]         = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (e) =>
    setFormData((c) => ({ ...c, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) { setError("Please accept the terms to continue."); return; }
    setError("");
    setIsSubmitting(true);
    try {
      await register(formData);
      navigate("/chat");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Unable to register");
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

        .reg-root {
          min-height: 100dvh;
          display: flex; align-items: center; justify-content: center;
          padding: 1.25rem;
          position: relative; overflow: hidden;
          background:
            linear-gradient(180deg, rgba(8,11,20,0.7), rgba(8,11,20,0.85)),
            url("/src/assets/bg_pic.jpg");
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
        }
        .reg-root::before {
          content: ''; position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none; z-index: 0;
        }

        @keyframes driftA {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(-40px, -50px) scale(1.08); }
        }
        @keyframes driftB {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(35px, 40px) scale(1.1); }
        }
        @keyframes driftC {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(-20px, 30px); }
        }

        /* card */
        .card {
          position: relative; z-index: 1;
          width: 100%; max-width: 980px;
          display: grid; grid-template-columns: 1fr;
          border-radius: 1.75rem; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(139,92,246,0.08) inset;
          background: rgba(10,12,24,0.38);
          backdrop-filter: blur(30px) saturate(1.35);
          opacity: 0;
          transform: translateY(28px) scale(0.98);
          transition: opacity 0.55s cubic-bezier(.4,0,.2,1), transform 0.55s cubic-bezier(.4,0,.2,1);
          max-height: calc(100dvh - 3rem);
        }
        .card.show { opacity: 1; transform: translateY(0) scale(1); }
        @media (min-width: 768px) { .card { grid-template-columns: 0.9fr 1.1fr; } }

        /* ── left decorative panel ── */
        .panel-left {
          display: none;
          padding: 2.25rem 2.5rem;
          background: linear-gradient(145deg, rgba(14,165,233,0.14) 0%, rgba(109,40,217,0.18) 100%);
          border-right: 1px solid rgba(255,255,255,0.06);
          flex-direction: column; justify-content: flex-start;
          position: relative; overflow: hidden;
          gap: 1.1rem;
        }
        @media (min-width: 768px) { .panel-left { display: flex; } }
        .panel-left::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 60% at 20% 80%, rgba(14,165,233,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .step-list { display: flex; flex-direction: column; gap: 0.85rem; margin-top: 1.5rem; }
        .step-item { display: flex; align-items: flex-start; gap: 0.85rem; }
        .step-num {
          width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #38bdf8, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.72rem; font-weight: 700; color: #fff;
          font-family: 'Syne', sans-serif;
          box-shadow: 0 0 14px rgba(56,189,248,0.3);
        }
        .step-body { padding-top: 0.15rem; }
        .step-title { font-size: 0.82rem; font-weight: 600; color: #e2e8f0; font-family: 'Syne', sans-serif; }
        .step-sub   { font-size: 0.72rem; color: #64748b; margin-top: 0.15rem; line-height: 1.5; }

        .panel-badge {
          display: inline-flex; align-items: center; gap: 0.45rem;
          background: rgba(56,189,248,0.1); border: 1px solid rgba(56,189,248,0.25);
          border-radius: 2rem; padding: 0.35rem 0.85rem;
          font-size: 0.72rem; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #7dd3fc; width: fit-content;
        }
        .panel-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #38bdf8; animation: blink 2s infinite;
        }
        @keyframes blink {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.4; transform: scale(0.7); }
        }

        .panel-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.9rem, 3vw, 2.8rem);
          font-weight: 800; line-height: 1.14;
          color: #f8fafc; margin-top: 1.75rem; letter-spacing: -0.02em;
        }
        .panel-title span {
          background: linear-gradient(135deg, #38bdf8, #a78bfa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .left-hero {
          width: 100%;
          height: 180px;
          border-radius: 1.2rem;
          background:
            linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.35)),
            url("/src/assets/bg_pic.jpg");
          background-size: cover;
          background-position: center;
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 18px 40px rgba(0,0,0,0.35);
        }
        .left-hero-desc {
          font-size: 0.85rem;
          color: #b6c2d1;
          line-height: 1.7;
        }
        .panel-sub {
          margin-top: 1rem; font-size: 0.86rem;
          color: #94a3b8; line-height: 1.7; max-width: 300px;
        }

        /* testimonial card */
        .testimonial {
          margin-top: 0.5rem;
          padding: 1rem 1.1rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 1rem;
          backdrop-filter: blur(8px);
        }
        .testimonial-text { font-size: 0.8rem; color: #cbd5e1; line-height: 1.6; font-style: italic; }
        .testimonial-author {
          margin-top: 0.65rem; display: flex; align-items: center; gap: 0.5rem;
        }
        .testimonial-avatar {
          width: 26px; height: 26px; border-radius: 50%;
          background: linear-gradient(135deg, #38bdf8, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.65rem; font-weight: 700; color: #fff;
          font-family: 'Syne', sans-serif;
        }
        .testimonial-name { font-size: 0.75rem; font-weight: 600; color: #94a3b8; font-family: 'Syne', sans-serif; }
        .stars { font-size: 0.65rem; color: #fbbf24; letter-spacing: 0.05em; margin-top: 0.1rem; }

        /* deco rings */
        .deco-ring {
          position: absolute; border-radius: 50%;
          border: 1px solid rgba(56,189,248,0.1);
          pointer-events: none;
        }

        /* ── right form panel ── */
        .panel-right {
          padding: 2.25rem 2rem;
          display: flex; flex-direction: column; justify-content: center;
        }
        @media (min-width: 480px) { .panel-right { padding: 2.5rem 2.5rem; } }

        .form-title {
          font-family: 'Syne', sans-serif; font-size: 1.85rem;
          font-weight: 700; color: #f1f5f9; letter-spacing: -0.02em;
        }
        .form-sub { margin-top: 0.4rem; font-size: 0.83rem; color: #64748b; }

        .divider { display: flex; align-items: center; gap: 0.75rem; margin: 1.4rem 0; }
        .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .divider span { font-size: 0.72rem; color: #475569; letter-spacing: 0.06em; text-transform: uppercase; }

        .social-btn {
          width: 100%; display: flex; align-items: center; justify-content: center;
          gap: 0.65rem; padding: 0.72rem 1rem;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
          border-radius: 0.85rem; color: #cbd5e1; font-size: 0.85rem; font-weight: 500;
          cursor: pointer; transition: background 0.18s, border-color 0.18s, transform 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .social-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.16); transform: translateY(-1px); }
        .social-btn:active { transform: translateY(0); }

        .fields { display: flex; flex-direction: column; gap: 1rem; }

        /* eye btn */
        .eye-btn {
          background: none; border: none; cursor: pointer; color: #64748b;
          display: flex; align-items: center; padding: 0.25rem; transition: color 0.15s;
        }
        .eye-btn:hover { color: #a78bfa; }

        /* checkbox */
        .terms-row {
          display: flex; align-items: flex-start; gap: 0.65rem;
          margin-top: 0.5rem;
        }
        .custom-check {
          width: 18px; height: 18px; flex-shrink: 0; margin-top: 1px;
          border-radius: 0.35rem; cursor: pointer;
          border: 1.5px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.04);
          display: flex; align-items: center; justify-content: center;
          transition: border-color 0.18s, background 0.18s;
        }
        .custom-check.checked {
          background: linear-gradient(135deg,#7c3aed,#4f46e5);
          border-color: #7c3aed;
        }
        .terms-text { font-size: 0.78rem; color: #64748b; line-height: 1.55; }
        .terms-text a { color: #a78bfa; text-decoration: none; font-weight: 600; }
        .terms-text a:hover { color: #c4b5fd; }

        /* error */
        .error-box {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.7rem 0.9rem; margin-top: 0.25rem;
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
          border-radius: 0.75rem; color: #fca5a5; font-size: 0.8rem;
          animation: shake 0.35s ease;
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25%      { transform: translateX(-6px); }
          75%      { transform: translateX(6px); }
        }

        /* submit */
        .submit-btn {
          position: relative; width: 100%; padding: 0.95rem;
          border-radius: 1rem; font-family: 'Syne', sans-serif;
          font-size: 0.95rem; font-weight: 700; color: #fff;
          letter-spacing: 0.02em; cursor: pointer; border: none; overflow: hidden;
          background: linear-gradient(135deg, #0ea5e9 0%, #7c3aed 100%);
          transition: transform 0.18s, box-shadow 0.2s;
          box-shadow: 0 4px 24px rgba(14,165,233,0.35);
          margin-top: 1.25rem;
        }
        .submit-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, #0284c7 0%, #6d28d9 100%);
          opacity: 0; transition: opacity 0.22s;
        }
        .submit-btn:hover:not(:disabled)::before { opacity: 1; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(14,165,233,0.45); }
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

        .footer-link {
          margin-top: 1.4rem; text-align: center;
          font-size: 0.82rem; color: #475569;
        }
        .footer-link a { color: #a78bfa; font-weight: 600; text-decoration: none; transition: color 0.15s; }
        .footer-link a:hover { color: #c4b5fd; }

        /* stagger reveals */
        .reveal {
          opacity: 0; transform: translateY(16px);
          transition: opacity 0.45s cubic-bezier(.4,0,.2,1), transform 0.45s cubic-bezier(.4,0,.2,1);
        }
        .reveal.show { opacity: 1; transform: none; }
        .d1 { transition-delay: 0.10s; }
        .d2 { transition-delay: 0.18s; }
        .d3 { transition-delay: 0.26s; }
        .d4 { transition-delay: 0.34s; }
        .d5 { transition-delay: 0.42s; }
        .d6 { transition-delay: 0.50s; }

        @media (max-height: 820px) {
          .card { max-height: calc(100dvh - 1.5rem); }
          .panel-left { padding: 1.75rem 2rem; gap: 0.9rem; }
          .panel-right { padding: 1.75rem 2rem; }
          .left-hero { height: 150px; }
          .step-list { margin-top: 1rem; gap: 0.7rem; }
          .testimonial-text { font-size: 0.75rem; }
        }
      `}</style>

      <main className="reg-root">
        {/* Ambient orbs */}
        <div style={{ position:"absolute", borderRadius:"50%", filter:"blur(90px)", opacity:0.22, width:480, height:480, top:-140, right:-100, background:"radial-gradient(circle,#0ea5e9 0%,transparent 70%)", animation:"driftA 16s ease-in-out infinite", pointerEvents:"none" }} />
        <div style={{ position:"absolute", borderRadius:"50%", filter:"blur(80px)", opacity:0.2, width:380, height:380, bottom:-100, left:-80, background:"radial-gradient(circle,#7c3aed 0%,transparent 70%)", animation:"driftB 20s ease-in-out infinite", pointerEvents:"none" }} />
        <div style={{ position:"absolute", borderRadius:"50%", filter:"blur(60px)", opacity:0.15, width:200, height:200, top:"40%", left:"15%", background:"radial-gradient(circle,#22d3ee 0%,transparent 70%)", animation:"driftC 13s ease-in-out infinite", pointerEvents:"none" }} />

        <div className={`card ${mounted ? "show" : ""}`}>

          {/* ══ Left Panel ══ */}
          <div className="panel-left">
            <div className="deco-ring" style={{ width:260, height:260, top:-80, right:-80, opacity:0.2 }} />
            <div className="deco-ring" style={{ width:160, height:160, top:-30, right:-30, opacity:0.12 }} />
            <div className="panel-badge">
              <span className="panel-badge-dot" />
              Free to join
            </div>
            <h1 className="panel-title">
              Start chatting<br />in under<br /><span>60 seconds.</span>
            </h1>
            <div className="left-hero" />
            <p className="left-hero-desc">
              A clean, focused workspace for fast conversations and files that stay in sync.
            </p>
            <div className="testimonial">
              <p className="testimonial-text">
                "Koushik Chakraborty delivers reliable, well-structured solutions with a sharp eye for performance and scalability. Quick to solve complex problems and always improving, his work reflects consistency, clarity, and strong technical understanding."
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">KC</div>
                <div>
                  <p className="testimonial-name">Koushik Chakraborty - Developer</p>
                  <p className="stars">*****</p>
                </div>
              </div>
            </div>
          </div>
          <div className="panel-right">

            <div className={`reveal d1 ${mounted ? "show" : ""}`}>
              <p className="form-title">Create account ✨</p>
              <p className="form-sub">Join thousands already in the workspace</p>
            </div>

            {/* Google SSO */}
            <div className={`reveal d2 ${mounted ? "show" : ""}`} style={{ marginTop:"1.6rem" }}>
              <button className="social-btn" type="button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign up with Google
              </button>
            </div>

            <div className={`reveal d2 ${mounted ? "show" : ""}`}>
              <div className="divider"><span>or register with email</span></div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={`fields reveal d3 ${mounted ? "show" : ""}`}>
                <FloatingInput
                  label="Full name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
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
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </FloatingInput>
                  <StrengthMeter password={formData.password} />
                </div>
              </div>

              {/* Terms checkbox */}
              <div className={`reveal d4 ${mounted ? "show" : ""}`} style={{ marginTop:"1.1rem" }}>
                <div className="terms-row">
                  <div
                    className={`custom-check ${agreed ? "checked" : ""}`}
                    onClick={() => setAgreed((a) => !a)}
                    role="checkbox"
                    aria-checked={agreed}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === " " && setAgreed((a) => !a)}
                  >
                    {agreed && (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2 6 5 9 10 3"/>
                      </svg>
                    )}
                  </div>
                  <p className="terms-text">
                    I agree to the{" "}
                    <a href="/terms">Terms of Service</a>
                    {" "}and{" "}
                    <a href="/privacy">Privacy Policy</a>
                  </p>
                </div>
              </div>

              {error && (
                <div className="error-box">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              <div className={`reveal d5 ${mounted ? "show" : ""}`}>
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  <div className="shimmer" />
                  <span>
                    {isSubmitting
                      ? <><span className="spinner" />Creating your account…</>
                      : "Create Account →"
                    }
                  </span>
                </button>
              </div>
            </form>

            <div className={`footer-link reveal d6 ${mounted ? "show" : ""}`}>
              Already have an account?{" "}
              <Link to="/login">Sign in</Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Register;




