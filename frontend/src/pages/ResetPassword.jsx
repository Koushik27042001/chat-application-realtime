import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import { authApi } from "../services/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await authApi.resetPassword(token, password);
      navigate("/login", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Error resetting password";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-[2rem] border border-white/60 bg-white/85 px-6 py-10 shadow-panel backdrop-blur">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Reset password
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Enter your new password (min 6 characters).
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-coral focus:bg-white"
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-coral px-4 py-3 font-semibold text-white transition hover:bg-[#ef6a49] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Resetting..." : "Reset password"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-500">
          <Link className="font-semibold text-teal" to="/login">
            Back to login
          </Link>
        </p>
      </section>
    </main>
  );
};

export default ResetPassword;
