"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp, CalendarCheck, Wallet } from "lucide-react";

const moneyFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const compactFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatMoney(value: number) {
  return `${moneyFormat.format(value)} ETB`;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string | number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const value = Number(payload[0]?.value ?? 0);

  return (
    <div className="rounded-xl border border-[#D4AF37]/40 bg-[#0a0a0a]/95 px-3.5 py-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.6)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#D4AF37]">
        {label}
      </p>
      <p className="mt-1 text-base font-extrabold text-white">{formatMoney(value)}</p>
    </div>
  );
}

export function IncomeChart({ data }: { data: { day: string; income: number }[] }) {
  // Bars animate in, except for people who ask their device to reduce motion.
  const [animate, setAnimate] = useState(true);
  useEffect(() => {
    setAnimate(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const total = data.reduce((sum, d) => sum + d.income, 0);

  if (total === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#D4AF37]/30 bg-[#0a0a0a] px-6 text-center sm:h-64">
        <Wallet size={28} aria-hidden="true" className="text-[#D4AF37]/70" />
        <p className="text-sm font-semibold text-white/60">
          No income recorded in the last 7 days.
        </p>
      </div>
    );
  }

  const best = data.reduce((top, d) => (d.income > top.income ? d : top), data[0]);

  return (
    <div className="min-w-0">
      {/* Summary */}
      <div className="mb-5 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
        <div className="rounded-xl border border-[#D4AF37]/25 bg-[#0a0a0a] p-3.5">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/50">
            <TrendingUp size={14} aria-hidden="true" className="text-[#D4AF37]" />
            Last 7 days
          </p>
          <p className="mt-1.5 break-words text-lg font-extrabold text-[#F5D76E] sm:text-xl">
            {formatMoney(total)}
          </p>
        </div>

        <div className="rounded-xl border border-[#D4AF37]/25 bg-[#0a0a0a] p-3.5">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/50">
            <CalendarCheck size={14} aria-hidden="true" className="text-[#D4AF37]" />
            Best day
          </p>
          <p className="mt-1.5 break-words text-lg font-extrabold text-white sm:text-xl">
            {best.day}
            <span className="ml-2 text-sm font-bold text-[#D4AF37]">
              {formatMoney(best.income)}
            </span>
          </p>
        </div>
      </div>

      {/* Chart (height grows with the screen) */}
      <div className="h-56 w-full min-w-0 sm:h-64 lg:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, left: -6, bottom: 0 }}>
            <defs>
              <linearGradient id="ersmsIncomeGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F5D76E" />
                <stop offset="100%" stopColor="#B8892A" />
              </linearGradient>
              <linearGradient id="ersmsIncomeSoft" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#8A6A1F" stopOpacity={0.45} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#D4AF37" strokeOpacity={0.12} strokeDasharray="3 6" vertical={false} />

            <XAxis
              dataKey="day"
              tick={{ fill: "#a3a3a3", fontSize: 12, fontWeight: 600 }}
              tickLine={false}
              axisLine={{ stroke: "#D4AF37", strokeOpacity: 0.25 }}
              tickMargin={10}
            />
            <YAxis
              tick={{ fill: "#737373", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => compactFormat.format(value)}
              width={44}
            />

            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "#D4AF37", fillOpacity: 0.07, radius: 8 }}
            />

            <Bar
              dataKey="income"
              radius={[8, 8, 0, 0]}
              maxBarSize={46}
              isAnimationActive={animate}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`${entry.day}-${index}`}
                  fill={index === data.length - 1 ? "url(#ersmsIncomeGold)" : "url(#ersmsIncomeSoft)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] font-semibold text-white/50">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-gradient-to-b from-[#F5D76E] to-[#B8892A]" />
          Today
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-gradient-to-b from-[#D4AF37]/70 to-[#8A6A1F]/45" />
          Previous days
        </span>
      </div>
    </div>
  );
}