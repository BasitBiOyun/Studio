import React from 'react';
import { ComparisonMetric } from '../../types';
import { buildComparisonChartPoints, buildComparisonPercentilePoints } from '../../services/comparisonCharts';

export type ComparisonChartMode = 'radar' | 'bars' | 'percentile';

interface ComparisonChartProps {
  mode: ComparisonChartMode;
  metrics: ComparisonMetric[];
  player1Name: string;
  player2Name: string;
  accent1: string;
  accent2: string;
  compact?: boolean;
}

function shortLabel(label: string, max = 18): string {
  const clean = String(label || '').trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

function radarCoordinates(values: number[], cx: number, cy: number, radius: number): string {
  if (!values.length) return '';
  return values.map((value, index) => {
    const angle = (-Math.PI / 2) + (index * Math.PI * 2) / values.length;
    const r = radius * (Math.max(0, Math.min(100, value)) / 100);
    return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
  }).join(' ');
}

function RadarChart({ metrics, player1Name, player2Name, accent1, accent2 }: Omit<ComparisonChartProps, 'mode' | 'compact'>) {
  const points = buildComparisonChartPoints(metrics, true);
  if (points.length < 3) {
    return <div className="h-full flex items-center justify-center text-center text-xs font-bold uppercase tracking-widest text-neutral-500">At least 3 numeric metrics are required for radar view.</div>;
  }

  const cx = 260;
  const cy = 154;
  const radius = 108;
  const rings = [25, 50, 75, 100];
  const ringPolygons = rings.map((ring) => radarCoordinates(Array(points.length).fill(ring), cx, cy, radius));
  const p1 = radarCoordinates(points.map((point) => point.score1), cx, cy, radius);
  const p2 = radarCoordinates(points.map((point) => point.score2), cx, cy, radius);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-2 text-[10px] font-black uppercase tracking-[0.16em]">
        <div className="flex items-center gap-2 min-w-0"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accent1 }} /><span className="truncate text-neutral-300">{player1Name}</span></div>
        <div className="text-neutral-600">Pair-relative profile</div>
        <div className="flex items-center gap-2 min-w-0"><span className="truncate text-neutral-300">{player2Name}</span><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accent2 }} /></div>
      </div>
      <svg viewBox="0 0 520 320" className="w-full flex-1 min-h-0 overflow-visible" role="img" aria-label={`${player1Name} and ${player2Name} radar comparison`}>
        {ringPolygons.map((polygon, index) => <polygon key={rings[index]} points={polygon} fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="1" />)}
        {points.map((point, index) => {
          const angle = (-Math.PI / 2) + (index * Math.PI * 2) / points.length;
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;
          const lx = cx + Math.cos(angle) * (radius + 28);
          const ly = cy + Math.sin(angle) * (radius + 28);
          const anchor = Math.cos(angle) > 0.3 ? 'start' : Math.cos(angle) < -0.3 ? 'end' : 'middle';
          return <g key={point.id}><line x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(148,163,184,0.16)" strokeWidth="1" /><text x={lx} y={ly} textAnchor={anchor} dominantBaseline="middle" fill="#a3a3a3" fontSize="11" fontWeight="700">{shortLabel(point.label, 16)}</text></g>;
        })}
        <polygon points={p1} fill={`${accent1}28`} stroke={accent1} strokeWidth="3" strokeLinejoin="round" />
        <polygon points={p2} fill={`${accent2}24`} stroke={accent2} strokeWidth="3" strokeLinejoin="round" />
        {points.map((point, index) => {
          const angle = (-Math.PI / 2) + (index * Math.PI * 2) / points.length;
          const p1r = radius * point.score1 / 100;
          const p2r = radius * point.score2 / 100;
          return <g key={`${point.id}-dots`}><circle cx={cx + Math.cos(angle) * p1r} cy={cy + Math.sin(angle) * p1r} r="4" fill={accent1} /><circle cx={cx + Math.cos(angle) * p2r} cy={cy + Math.sin(angle) * p2r} r="4" fill={accent2} /></g>;
        })}
      </svg>
      <div className="text-[9px] leading-tight text-neutral-600 text-center">Direction-adjusted pair-relative scores. This is not a league percentile chart.</div>
    </div>
  );
}

function BarsChart({ metrics, player1Name, player2Name, accent1, accent2, compact = false }: Omit<ComparisonChartProps, 'mode'>) {
  const points = buildComparisonChartPoints(metrics, false);
  if (!points.length) return <div className="h-full flex items-center justify-center text-xs font-bold uppercase tracking-widest text-neutral-500">Numeric comparison metrics required.</div>;

  return <div className={`h-full flex flex-col justify-center ${compact ? 'gap-2' : 'gap-3'}`}>{points.map((point) => (
    <div key={point.id} className="grid grid-cols-[minmax(0,1fr)_120px_minmax(0,1fr)] items-center gap-3">
      <div className="min-w-0">
        <div className="flex justify-between gap-2 mb-1 text-[10px] font-black"><span className="truncate" style={{ color: accent1 }}>{player1Name}</span><span className="text-white tabular-nums">{point.display1}{point.unit || ''}</span></div>
        <div className="h-2 rounded-full bg-neutral-900 overflow-hidden flex justify-end"><div className="h-full rounded-full" style={{ width: `${point.score1}%`, backgroundColor: accent1 }} /></div>
      </div>
      <div className="text-center text-[11px] font-black uppercase tracking-wide text-neutral-400 leading-tight">{shortLabel(point.label, 20)}</div>
      <div className="min-w-0">
        <div className="flex justify-between gap-2 mb-1 text-[10px] font-black"><span className="text-white tabular-nums">{point.display2}{point.unit || ''}</span><span className="truncate" style={{ color: accent2 }}>{player2Name}</span></div>
        <div className="h-2 rounded-full bg-neutral-900 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${point.score2}%`, backgroundColor: accent2 }} /></div>
      </div>
    </div>
  ))}<div className="text-[9px] leading-tight text-neutral-600 text-center">Bar lengths are scaled within each metric pair. Raw values remain the source of truth.</div></div>;
}

function PercentileChart({ metrics, player1Name, player2Name, accent1, accent2 }: Omit<ComparisonChartProps, 'mode' | 'compact'>) {
  const points = buildComparisonPercentilePoints(metrics);
  if (!points.length) return <div className="h-full flex flex-col items-center justify-center text-center px-8"><div className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">Percentile data not supplied</div><div className="text-[11px] leading-relaxed text-neutral-600">Add percentile1 and percentile2 values from 0–100 to comparison metrics. Studio will not invent percentile ranks from raw stats.</div></div>;

  return <div className="h-full flex flex-col justify-center gap-3">{points.map((point) => (
    <div key={point.id}>
      <div className="text-[10px] font-black uppercase tracking-wide text-neutral-400 mb-1.5">{shortLabel(point.label, 28)}</div>
      <div className="grid grid-cols-2 gap-3">
        <div><div className="flex justify-between text-[10px] font-bold mb-1"><span className="truncate text-neutral-300">{player1Name}</span><span style={{ color: accent1 }}>{point.percentile1 == null ? '—' : `P${Math.round(point.percentile1)}`}</span></div><div className="h-2.5 rounded-full bg-neutral-900 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${point.percentile1 || 0}%`, backgroundColor: accent1 }} /></div></div>
        <div><div className="flex justify-between text-[10px] font-bold mb-1"><span className="truncate text-neutral-300">{player2Name}</span><span style={{ color: accent2 }}>{point.percentile2 == null ? '—' : `P${Math.round(point.percentile2)}`}</span></div><div className="h-2.5 rounded-full bg-neutral-900 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${point.percentile2 || 0}%`, backgroundColor: accent2 }} /></div></div>
      </div>
    </div>
  ))}<div className="text-[9px] leading-tight text-neutral-600 text-center">Percentiles are rendered only when explicitly supplied by the data pack.</div></div>;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = (props) => {
  const title = props.mode === 'radar' ? 'Relative Radar' : props.mode === 'percentile' ? 'Percentile Profile' : 'Metric Bars';
  return <div className="rounded-2xl border backdrop-blur-md shadow-2xl p-4 min-h-[250px] h-full flex flex-col" style={{ backgroundColor: 'rgba(5, 9, 18, 0.94)', borderColor: 'rgba(255,255,255,0.08)' }}><div className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-2">Studio Charts • {title}</div><div className="flex-1 min-h-0">{props.mode === 'radar' ? <RadarChart {...props} /> : props.mode === 'percentile' ? <PercentileChart {...props} /> : <BarsChart {...props} />}</div></div>;
};
