"use client";

import { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";
import { TrendingUp, Gauge, CalendarCheck, Wallet } from "lucide-react";

const moneyFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const compactFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatMoney(value: number) {
  return `ETB ${moneyFormat.format(value)}`;
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
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">
        {label}
      </p>
      <p className="mt-1 text-base font-extrabold text-[#F5D76E]">{formatMoney(value)}</p>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  strong = false,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-[#D4AF37]/25 bg-[#0a0a0a] p-3.5">
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/50">
        <Icon size={14} aria-hidden="true" className="shrink-0 text-[#D4AF37]" />
        <span className="truncate">{label}</span>
      </p>
      <p
        className={`mt-1.5 break-words text-lg font-extrabold sm:text-xl ${
          strong ? "text-[#F5D76E]" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function RevenueTrendChart({
  data,
}: {
  data: { day: string; income: number }[];
}) {
  // The line draws in, except for people who ask their device to reduce motion.
  const [animate, setAnimate] = useState(true);
  useEffect(() => {
    setAnimate(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const total = data.reduce((sum, item) => sum + item.income, 0);
  const average = data.length > 0 ? total / data.length : 0;
  const best = data.reduce(
    (top, item) => (item.income > top.income ? item : top),
    data[0] ?? { day: "-", income: 0 }
  );

  return (
    <div className="ersms-gold-line relative w-full min-w-0 overflow-hidden rounded-2xl border bg-[#0b0b0b] p-4 sm:p-5">
      {/* Gold accent and one very soft light (no heavy blur) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.08),transparent_70%)]"
      />

      <div className="relative">
        <p className="mb-4 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#B87333]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#B87333]" />
          Revenue trend
        </p>

        {total === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#D4AF37]/30 bg-[#0a0a0a] px-6 text-center sm:h-64">
            <Wallet size={28} aria-hidden="true" className="text-[#D4AF37]/70" />
            <p className="text-sm font-semibold text-white/60">
              No income recorded in this period.
            </p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="mb-5 grid grid-cols-1 gap-3 min-[480px]:grid-cols-3">
              <Metric icon={TrendingUp} label="Period income" value={formatMoney(total)} strong />
              <Metric icon={Gauge} label="Daily average" value={formatMoney(Math.round(average))} />
              <Metric icon={CalendarCheck} label="Best day" value={`${best.day} · ${formatMoney(best.income)}`} />
            </div>

            {/* Chart (height grows with the screen) */}
            <div
              role="img"
              aria-label={`Revenue trend. Total ${formatMoney(total)}. Best day ${best.day}.`}
              className="h-56 w-full min-w-0 sm:h-64 lg:h-72"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 8, left: -6, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ersmsRevenueArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.35} />
                      <stop offset="70%" stopColor="#D4AF37" stopOpacity={0.06} />
                      <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ersmsRevenueLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#C9972B" />
                      <stop offset="100%" stopColor="#F5D76E" />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    vertical={false}
                    stroke="#D4AF37"
                    strokeOpacity={0.12}
                    strokeDasharray="3 6"
                  />

                  <XAxis
                    dataKey="day"
                    axisLine={{ stroke: "#D4AF37", strokeOpacity: 0.25 }}
                    tickLine={false}
                    tick={{ fill: "#a3a3a3", fontSize: 12, fontWeight: 600 }}
                    tickMargin={10}
                    minTickGap={12}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#737373", fontSize: 12 }}
                    tickFormatter={(value: number) => compactFormat.format(value)}
                    width={44}
                  />

                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ stroke: "#D4AF37", strokeOpacity: 0.4, strokeWidth: 1 }}
                  />

                  {/* Average line */}
                  <ReferenceLine
                    y={average}
                    stroke="#B87333"
                    strokeOpacity={0.7}
                    strokeDasharray="5 5"
                  />

                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="url(#ersmsRevenueLine)"
                    strokeWidth={2.5}
                    fill="url(#ersmsRevenueArea)"
                    dot={false}
                    isAnimationActive={animate}
                    animationBegin={100}
                    animationDuration={1200}
                    animationEasing="ease-out"
                    activeDot={{
                      r: 6,
                      fill: "#F5D76E",
                      stroke: "#0b0b0b",
                      strokeWidth: 3,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] font-semibold text-white/50">
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="h-0.5 w-4 rounded-full bg-gradient-to-r from-[#C9972B] to-[#F5D76E]" />
                Daily income
              </span>
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="h-0 w-4 border-t-2 border-dashed border-[#B87333]" />
                Daily average
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}