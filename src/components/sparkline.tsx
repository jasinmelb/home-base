"use client";

import { WeightEntry } from "@/types/health";

interface SparklineProps {
  data: WeightEntry[];
  color: string;
  fillColor: string;
  width?: number;
  height?: number;
}

export function Sparkline({
  data,
  color,
  fillColor,
  width = 280,
  height = 60,
}: SparklineProps) {
  if (data.length < 2) return null;

  const weights = data.map((d) => d.weight);
  const min = Math.min(...weights) - 0.3;
  const max = Math.max(...weights) + 0.3;
  const range = max - min || 1;

  const padding = { top: 4, bottom: 4, left: 2, right: 2 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - ((d.weight - min) / range) * chartH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${height} L${points[0].x},${height} Z`;

  const last = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={`fill-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={fillColor} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#fill-${color})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="3" fill={color} />
    </svg>
  );
}
