import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(formData);
      navigate("/chat");
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        requestError?.message ||
        "Unable to log in";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen px-4 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/60 bg-white/85 shadow-panel backdrop-blur lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden bg-ink px-10 py-12 text-white lg:block">
          <p className="text-sm uppercase tracking-[0.3em] text-coral">Secure access</p>
          <h1 className="mt-5 font-display text-5xl font-semibold leading-tight">
            Sign in and jump straight into the chat dashboard.
          </h1>
          <p className="mt-6 max-w-md text-sm text-slate-200">
            Your credentials are verified by the backend API and stored in a secure session.
          </p>
        </div>

        <div className="px-6 py-10 sm:px-10">
          <h2 className="text-3xl font-semibold font-display text-ink">Login</h2>
          <p className="mt-2 text-sm text-slate-500">
            Enter the email and password you used to register.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <input
              className="w-full px-4 py-3 transition border outline-none rounded-2xl border-slate-200 bg-slate-50 focus:border-coral focus:bg-white"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            <div className="relative">
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 outline-none transition focus:border-coral focus:bg-white"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-sm font-semibold text-slate-500 transition hover:text-slate-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {error ? <p className="text-sm text-red-500">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-coral px-4 py-3 font-semibold text-white transition hover:bg-[#ef6a49] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Signing in..." : "Enter Chat"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            New here? <Link className="font-semibold text-teal" to="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Login;




