"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, ResponsiveContainer } from "recharts";
import { Wrench } from "lucide-react";

// Same family as the status pills used across the app:
// copper = repairing, amber = waiting, green = done, purple = diagnosing.
const COLORS: Record<string, string> = {
  Diagnosing: "#A78BFA",
  "Waiting for Parts": "#F5D76E",
  Repairing: "#C77D3A",
  Completed: "#34D399",
  Delivered: "#737373",
};
const FALLBACK_COLOR = "#737373";

export function RepairStatusChart({
  data,
  total,
}: {
  data: { name: string; value: number }[];
  total?: number;
}) {
  const [active, setActive] = useState<number | null>(null);

  // Slices animate in, except for people who ask their device to reduce motion.
  const [animate, setAnimate] = useState(true);
  useEffect(() => {
    setAnimate(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const sum = data.reduce((acc, d) => acc + d.value, 0);
  const centerTotal = total ?? sum;

  if (sum === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#D4AF37]/30 bg-[#0a0a0a] px-6 text-center sm:h-64">
        <Wrench size={28} aria-hidden="true" className="text-[#D4AF37]/70" />
        <p className="text-sm font-semibold text-white/60">No repairs to show yet.</p>
      </div>
    );
  }

  // The color of each slice lives in the data itself, so no <Cell> is needed.
  const chartData = data.map((entry, index) => ({
    ...entry,
    fill: COLORS[entry.name] ?? FALLBACK_COLOR,
    fillOpacity: active === null || active === index ? 1 : 0.35,
  }));

  const activeItem = active !== null ? data[active] : null;
  const summary = data.map((d) => `${d.name}: ${d.value}`).join(", ");

  return (
    <div className="@container min-w-0">
      <div className="flex flex-col items-center gap-6 @[460px]:flex-row @[460px]:justify-center @[460px]:gap-8">
        {/* Donut with a live readout in the middle */}
        <div
          role="img"
          aria-label={`Repair status chart. ${summary}`}
          className="relative h-52 w-52 shrink-0 sm:h-56 sm:w-56"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius="68%"
                outerRadius="98%"
                paddingAngle={3}
                cornerRadius={5}
                startAngle={90}
                endAngle={-270}
                stroke="#0f0f0f"
                strokeWidth={2}
                isAnimationActive={animate}
                animationDuration={800}
                animationEasing="ease-out"
                onMouseEnter={(_: any, index: number) => setActive(index)}
                onMouseLeave={() => setActive(null)}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="max-w-[110px] text-center">
              <p className="text-3xl font-extrabold tabular-nums leading-none text-white sm:text-4xl">
                {activeItem ? activeItem.value : centerTotal}
              </p>
              <p
                className="mt-1.5 truncate text-[11px] font-bold uppercase tracking-[0.14em]"
                style={{
                  color: activeItem
                    ? COLORS[activeItem.name] ?? FALLBACK_COLOR
                    : "rgba(255,255,255,0.5)",
                }}
              >
                {activeItem ? activeItem.name : "Total"}
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <ul className="w-full min-w-0 max-w-sm space-y-1.5 @[460px]:w-auto @[460px]:min-w-[210px]">
          {data.map((entry, index) => {
            const color = COLORS[entry.name] ?? FALLBACK_COLOR;
            const percent = Math.round((entry.value / sum) * 100);
            const isActive = active === index;

            return (
              <li
                key={entry.name}
                onMouseEnter={() => setActive(index)}
                onMouseLeave={() => setActive(null)}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-200 ${
                  isActive
                    ? "border-[#D4AF37]/45 bg-[#D4AF37]/[0.08]"
                    : "border-transparent bg-white/[0.03] hover:bg-white/[0.06]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: color, boxShadow: isActive ? `0 0 0 4px ${color}33` : "none" }}
                />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white/80">
                  {entry.name}
                </span>
                <span className="text-sm font-extrabold tabular-nums text-white">
                  {entry.value}
                </span>
                <span className="w-10 text-right text-xs font-semibold tabular-nums text-white/45">
                  {percent}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}