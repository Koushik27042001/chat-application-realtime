import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await register(formData);
      navigate("/chat");
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        requestError?.message ||
        "Unable to register";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/60 bg-white/85 shadow-panel backdrop-blur lg:grid-cols-[0.95fr_1.05fr]">
        <div className="px-6 py-10 sm:px-10">
          <h2 className="font-display text-3xl font-semibold text-ink">Create account</h2>
          <p className="mt-2 text-sm text-slate-500">
            Create an account to enter the chat workspace.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-coral focus:bg-white"
              type="text"
              name="name"
              placeholder="Full name"
              value={formData.name}
              onChange={handleChange}
            />
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-coral focus:bg-white"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-coral focus:bg-white"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />

            {error ? <p className="text-sm text-red-500">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-ink px-4 py-3 font-semibold text-white transition hover:bg-[#0b2236] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Creating..." : "Create And Continue"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            Already registered? <Link className="font-semibold text-teal" to="/login">Login</Link>
          </p>
        </div>

        <div className="hidden bg-gradient-to-br from-coral via-[#ff9b73] to-[#ffd2bf] px-10 py-12 lg:block">
          <p className="text-sm uppercase tracking-[0.3em] text-white/80">Welcome aboard</p>
          <h1 className="mt-5 font-display text-5xl font-semibold leading-tight text-white">
            Your new account unlocks real-time conversations.
          </h1>
          <p className="mt-6 max-w-md text-sm text-white/90">
            Register once and jump straight into your chat workspace.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Register;
