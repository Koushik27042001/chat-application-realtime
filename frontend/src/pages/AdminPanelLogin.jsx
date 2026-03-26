import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { ADMIN_PANEL_SECRET } from "../config/adminPanel";
import bgImage from "../assets/bg_pic.jpg";

const AdminPanelLogin = () => {
  const { panelSecret } = useParams();
  const navigate = useNavigate();
  const { adminPanelLogin } = useAuth();

  const [username, setUsername] = useState("admin_koushik");
  const [password, setPassword] = useState("admin@123");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  if (panelSecret !== ADMIN_PANEL_SECRET) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await adminPanelLogin({
        username: username.trim(),
        password: password.trim(),
      });
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to sign in"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      className="min-h-[100dvh] flex items-center justify-center p-5 relative overflow-hidden"
      style={{
        background: `linear-gradient(180deg, rgba(8,11,20,0.88), rgba(8,11,20,0.92)), url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className={`relative z-[1] w-full max-w-md rounded-2xl border border-violet-500/25 bg-[rgba(10,12,24,0.75)] p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-violet-300/90">
          Restricted
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold text-white">
          Admin sign-in
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          This page is not linked from the public app.
        </p>
        <p className="mt-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
          Default admin credentials for this project: <span className="font-semibold text-white">admin_koushik</span> / <span className="font-semibold text-white">admin@123</span>
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              User ID
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-violet-500/30 focus:ring-2"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-400">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none ring-violet-500/30 focus:ring-2"
            />
          </div>

          {error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-violet-900/40 transition hover:brightness-110 disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Enter admin dashboard"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          <Link to="/login" className="text-violet-400 hover:text-violet-300">
            ← Public login
          </Link>
        </p>
      </div>
    </main>
  );
};

export default AdminPanelLogin;
