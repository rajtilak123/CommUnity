"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type RegistrationsData = {
  month: string;
  count: number;
};

type StatusRateData = {
  status: string;
  count: number;
};

type CategoryData = {
  category: string;
  count: number;
};

// ── 1. RESIDENT GROWTH AREA CHART ─────────────────────────────
export function ResidentGrowthChart({ data }: { data: RegistrationsData[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center text-body-sm text-on-surface-variant">
        Loading growth analytics...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="month"
          stroke="var(--outline)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis
          stroke="var(--outline)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--surface-container-lowest)",
            border: "1px solid var(--outline-variant)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "var(--on-surface)",
          }}
          labelStyle={{ fontWeight: "bold" }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="var(--primary)"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorCount)"
          name="New Residents"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── 2. BOOKING APPROVAL RADIAL DONUT CHART ────────────────────
export function BookingApprovalChart({ statusRate }: { statusRate: StatusRateData[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center text-body-sm text-on-surface-variant">
        Loading booking breakdown...
      </div>
    );
  }

  const total = statusRate.reduce((sum, item) => sum + item.count, 0);
  const approved = statusRate.find((item) => item.status === "approved")?.count || 0;
  const rate = total > 0 ? Math.round((approved / total) * 100) : 100;

  // Pie chart slices map
  const chartData = [
    {
      name: "Approved",
      value: approved || (total === 0 ? 1 : 0),
      color: "var(--color-emerald-500, #10B981)",
    },
    {
      name: "Pending",
      value: statusRate.find((item) => item.status === "pending")?.count || 0,
      color: "var(--color-amber-500, #F59E0B)",
    },
    {
      name: "Rejected/Cancelled",
      value:
        statusRate
          .filter((item) => item.status !== "approved" && item.status !== "pending")
          .reduce((sum, item) => sum + item.count, 0) || 0,
      color: "var(--color-red-500, #EF4444)",
    },
  ].filter((item) => item.value > 0);

  return (
    <div className="relative size-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--surface-container-lowest)",
              border: "1px solid var(--outline-variant)",
              borderRadius: "8px",
              fontSize: "11px",
              color: "var(--on-surface)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center label */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-headline-lg font-black text-on-surface leading-none">
          {rate}%
        </span>
        <span className="text-[11px] text-on-surface-variant font-semibold mt-1">
          Approved
        </span>
      </div>
    </div>
  );
}

// ── 3. COMPLAINT DISTRIBUTION CHART (HORIZONTAL PROGRESS BARS) ──
export function ComplaintDistributionChart({ categories }: { categories: CategoryData[] }) {
  const total = categories.reduce((sum, item) => sum + item.count, 0);

  if (categories.length === 0) {
    return (
      <div className="flex h-[150px] items-center justify-center text-body-sm text-on-surface-variant">
        No complaints filed.
      </div>
    );
  }

  return (
    <div className="space-y-4 px-1">
      {categories.slice(0, 4).map((item, idx) => {
        const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
        return (
          <div key={idx} className="space-y-1.5">
            <div className="flex justify-between text-body-sm font-semibold text-on-surface">
              <span className="capitalize">{item.category}</span>
              <span className="text-on-surface-variant">
                {item.count} <span className="text-[11px] font-normal">({pct}%)</span>
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-container-high overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
