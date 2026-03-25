import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Charts from "../components/admin/Charts";
import StatCard from "../components/admin/StatCard";
import UsersTable from "../components/admin/UsersTable";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { adminApi } from "../services/api";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setError("");
      setLoading(true);
      try {
        const { data: body } = await adminApi.analytics(token);
        if (!cancelled) setData(body);
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load analytics"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (token) load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return <Loader label="Loading admin analytics..." fullScreen />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#080b14] px-4 text-center">
        <p className="max-w-md text-sm text-red-300">{error}</p>
        <Link
          to="/chat"
          className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          Back to chat
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080b14] text-slate-200">
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <header className="relative z-10 border-b border-white/5 bg-slate-950/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/80">
              Admin
            </p>
            <h1 className="font-display text-2xl font-bold text-white">
              Analytics dashboard
            </h1>
          </div>
          <Link
            to="/chat"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-violet-400/40 hover:bg-violet-500/10"
          >
            ← Back to chat
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total users" value={data.totalUsers} />
          <StatCard
            title="Active (24h)"
            value={data.activeUsers}
            hint="Users with lastLogin in the last 24 hours"
          />
          <StatCard
            title="Messages today"
            value={data.messagesToday}
            hint="UTC midnight to now"
          />
          <StatCard title="All messages" value={data.totalMessages} />
        </div>

        <Charts loginActivity={data.loginActivity} />

        <UsersTable users={data.users} />
      </main>
    </div>
  );
}
