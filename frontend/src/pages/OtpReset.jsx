import { useState } from "react";
import { Link } from "react-router-dom";

import { authApi } from "../services/api";

const OtpReset = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [success, setSuccess] = useState(false);

  const sendOtp = async () => {
    setError("");
    setLoading("otp");
    try {
      await authApi.sendOTP(email);
      setOtpSent(true);
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to send OTP"
      );
    } finally {
      setLoading("");
    }
  };

  const resetPassword = async (e) => {
    e?.preventDefault?.();
    setError("");
    setLoading("reset");
    try {
      await authApi.verifyOTP({ email, otp, password });
      setSuccess(true);
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Invalid or expired OTP"
      );
    } finally {
      setLoading("");
    }
  };

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <section className="w-full max-w-md rounded-[2rem] border border-white/60 bg-white/85 px-6 py-10 shadow-panel backdrop-blur">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Password reset
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            Your password has been updated. You can now sign in.
          </p>
          <Link
            to="/login"
            className="mt-6 inline-block rounded-2xl bg-coral px-4 py-3 font-semibold text-white transition hover:bg-[#ef6a49]"
          >
            Go to login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-[2rem] border border-white/60 bg-white/85 px-6 py-10 shadow-panel backdrop-blur">
        <h2 className="font-display text-2xl font-semibold text-ink">
          OTP reset password
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Receive a one-time code by email to reset your password.
        </p>

        <div className="mt-8 space-y-4">
          <div className="flex gap-2">
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-coral focus:bg-white"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="button"
              onClick={sendOtp}
              disabled={loading || !email}
              className="shrink-0 rounded-2xl bg-ink px-4 py-3 font-semibold text-white transition hover:bg-[#0b2236] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading === "otp" ? "Sending..." : "Send OTP"}
            </button>
          </div>

          {otpSent && (
            <form onSubmit={resetPassword} className="space-y-4">
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-coral focus:bg-white"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
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
                disabled={loading}
                className="w-full rounded-2xl bg-coral px-4 py-3 font-semibold text-white transition hover:bg-[#ef6a49] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading === "reset" ? "Resetting..." : "Reset password"}
              </button>
            </form>
          )}

          {!otpSent && error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : null}
        </div>

        <p className="mt-6 space-y-1 text-sm text-slate-500">
          <Link className="font-semibold text-teal" to="/login">
            Back to login
          </Link>
          <span className="block">
            <Link className="font-semibold text-teal" to="/forgot-password">
              Use link-based reset instead
            </Link>
          </span>
        </p>
      </section>
    </main>
  );
};

export default OtpReset;
