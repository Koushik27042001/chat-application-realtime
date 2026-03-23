import { useState } from "react";
import { Link } from "react-router-dom";

import { authApi } from "../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Something went wrong";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <section className="w-full max-w-md rounded-[2rem] border border-white/60 bg-white/85 px-6 py-10 shadow-panel backdrop-blur">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Check your email
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            If an account exists for <strong>{email}</strong>, we've sent a reset
            link. It expires in 10 minutes.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block text-sm font-semibold text-teal hover:underline"
          >
            Back to login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-[2rem] border border-white/60 bg-white/85 px-6 py-10 shadow-panel backdrop-blur">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Forgot password
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Enter your email and we'll send you a reset link.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-coral focus:bg-white"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-coral px-4 py-3 font-semibold text-white transition hover:bg-[#ef6a49] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 space-y-1 text-sm text-slate-500">
          <Link className="font-semibold text-teal" to="/login">
            Back to login
          </Link>
          <span className="block">
            Prefer OTP? <Link className="font-semibold text-teal" to="/otp-reset">Use OTP reset</Link>
          </span>
        </p>
      </section>
    </main>
  );
};

export default ForgotPassword;
