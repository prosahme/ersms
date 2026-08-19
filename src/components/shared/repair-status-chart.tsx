"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

const COLORS: Record<string, string> = {
  Diagnosing: "#a855f7",
  "Waiting for Parts": "#f59e0b",
  Repairing: "#ea580c",
  Completed: "#16a34a",
  Delivered: "#64748b",
};

export function RepairStatusChart({
  data,
  total,
}: {
  data: { name: string; value: number }[];
  total?: number;
}) {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] ?? "#94a3b8"} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      {total !== undefined && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginBottom: 32 }}>
          <div className="text-center">
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-xs text-slate-500">Total</p>
          </div>
        </div>
      )}
    </div>
  );
}