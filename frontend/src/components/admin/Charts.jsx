import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "rgba(15, 23, 42, 0.95)",
  border: "1px solid rgba(139, 92, 246, 0.35)",
  borderRadius: "12px",
  fontSize: "12px",
  color: "#e2e8f0",
};

export default function Charts({ loginActivity = [] }) {
  const data =
    loginActivity.length > 0
      ? loginActivity
      : [{ label: "—", logins: 0 }];

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-slate-900/50 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold text-white">
          Logins by day
        </h2>
        <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs font-medium text-violet-200">
          Last 7 days (UTC)
        </span>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
          >
            <defs>
              <linearGradient id="adminLoginGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={{ stroke: "rgba(148,163,184,0.2)" }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v) => [v, "Logins"]}
              labelFormatter={(l) => l}
            />
            <Area
              type="monotone"
              dataKey="logins"
              stroke="#a78bfa"
              strokeWidth={2}
              fill="url(#adminLoginGrad)"
              dot={{ fill: "#c4b5fd", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#ddd6fe" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
