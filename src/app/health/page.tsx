"use client";

import { useState, useEffect } from "react";
import { HealthData, PersonHealth } from "@/types/health";
import { Sparkline } from "@/components/sparkline";
import { cn } from "@/lib/utils";

function daysBetween(a: string, b: string) {
  return Math.floor(
    (new Date(b).getTime() - new Date(a).getTime()) / 86400000
  );
}

function DeltaBadge({ value, suffix = "kg" }: { value: number; suffix?: string }) {
  const isLoss = value < 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
        isLoss
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
          : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
      )}
    >
      {isLoss ? "↓" : "↑"} {Math.abs(value).toFixed(1)}
      {suffix}
    </span>
  );
}

function ProgressBar({
  start,
  current,
  target,
  color,
}: {
  start: number;
  current: number;
  target: number;
  color: string;
}) {
  const totalToLose = start - target;
  const lost = start - current;
  const pct = Math.min(100, Math.max(0, (lost / totalToLose) * 100));

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>{start}kg</span>
        <span className="font-semibold text-foreground">{pct.toFixed(0)}%</span>
        <span>{target}kg</span>
      </div>
      <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-3 warm-shadow ring-1 ring-foreground/5"
      style={{ backgroundColor: `${color}08` }}
    >
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="text-lg font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function PersonCard({
  name,
  initial,
  person,
  accentColor,
  fillColor,
  bgColor,
}: {
  name: string;
  initial: string;
  person: PersonHealth;
  accentColor: string;
  fillColor: string;
  bgColor: string;
}) {
  const weightDelta = person.currentWeight - person.startWeight;
  const bfDelta = person.bodyFat.current - person.bodyFat.start;
  const daysIn = daysBetween(person.startDate, "2026-03-28");

  return (
    <div className="rounded-2xl bg-card warm-shadow ring-1 ring-foreground/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white"
          style={{ backgroundColor: accentColor }}
        >
          {initial}
        </div>
        <div className="flex-1">
          <h2 className="font-heading text-lg font-bold">{name}</h2>
          <p className="text-xs text-muted-foreground">Day {daysIn} of program</p>
        </div>
      </div>

      {/* Weight hero */}
      <div className="px-4 pb-1">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold tracking-tight" style={{ color: accentColor }}>
            {person.currentWeight}
          </span>
          <span className="text-sm font-medium text-muted-foreground">kg</span>
          <DeltaBadge value={weightDelta} />
        </div>
      </div>

      {/* Sparkline */}
      <div className="px-3 py-1">
        <Sparkline
          data={person.weightHistory}
          color={accentColor}
          fillColor={fillColor}
        />
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <ProgressBar
          start={person.startWeight}
          current={person.currentWeight}
          target={person.targetWeight}
          color={accentColor}
        />
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-2 px-4 pb-4">
        <StatCard
          label="Body Fat"
          value={`${person.bodyFat.current}%`}
          sub={`${bfDelta > 0 ? "+" : ""}${bfDelta.toFixed(1)}% from start`}
          color={accentColor}
        />
        {person.ftp != null && (
          <StatCard
            label="FTP"
            value={`${person.ftp}W`}
            sub={person.ctl != null ? `CTL ${person.ctl}` : undefined}
            color={accentColor}
          />
        )}
        <StatCard
          label="Avg Calories"
          value={`${person.weeklyAvg.calories}`}
          sub="weekly avg"
          color={accentColor}
        />
        <StatCard
          label="Avg Protein"
          value={`${person.weeklyAvg.protein}g`}
          sub="weekly avg"
          color={accentColor}
        />
      </div>
    </div>
  );
}

export default function HealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/health-data.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load health data");
        return res.json();
      })
      .then((d: HealthData) => setData(d))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-destructive">{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  const programDays = daysBetween("2025-12-08", "2026-03-28");

  return (
    <div className="space-y-4 px-4 pb-6 pt-2">
      {/* Program header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold">Health Tracker</h1>
          <p className="text-xs text-muted-foreground">
            Day {programDays} · Started Dec 8, 2025
          </p>
        </div>
        <span className="text-2xl">❤️</span>
      </div>

      {/* Jason */}
      <PersonCard
        name="Jason"
        initial="J"
        person={data.jason}
        accentColor="#3B82F6"
        fillColor="#3B82F6"
        bgColor="#EFF6FF"
      />

      {/* Penny */}
      <PersonCard
        name="Penny"
        initial="P"
        person={data.penny}
        accentColor="#F472B6"
        fillColor="#F472B6"
        bgColor="#FDF2F8"
      />

      {/* Updated timestamp */}
      <p className="text-center text-[11px] text-muted-foreground">
        Updated {new Date(data.updatedAt).toLocaleDateString("en-AU", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>
    </div>
  );
}
