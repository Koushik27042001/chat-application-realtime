export default function UsersTable({ users = [] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-violet-500/20 bg-slate-900/50 backdrop-blur-sm">
      <div className="border-b border-white/5 px-5 py-4">
        <h2 className="font-display text-lg font-semibold text-white">Users</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Up to 500 accounts, newest first
        </p>
      </div>
      <div className="max-h-[420px] overflow-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur">
            <tr className="border-b border-white/5 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Email</th>
              <th className="px-5 py-3 font-semibold">Role</th>
              <th className="px-5 py-3 font-semibold">Last login</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {users.map((u) => (
              <tr
                key={u.id}
                className="transition hover:bg-white/[0.03]"
              >
                <td className="px-5 py-3 font-medium text-white">{u.name}</td>
                <td className="px-5 py-3 text-slate-400">{u.email}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      u.role === "admin"
                        ? "bg-amber-500/20 text-amber-200"
                        : "bg-slate-600/30 text-slate-300"
                    }`}
                  >
                    {u.role || "user"}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-400">
                  {u.lastLogin
                    ? new Date(u.lastLogin).toLocaleString()
                    : "Never"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">
            No users yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
