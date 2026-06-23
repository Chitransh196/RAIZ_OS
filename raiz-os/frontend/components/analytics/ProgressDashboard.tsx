"use client";
import { motion } from "framer-motion";
import { TrendingUp, Zap, Target, BarChart2, Award } from "lucide-react";
import { useStore } from "@/lib/store";

// ─── Pure deterministic analytics — zero Groq calls ─────────────────────────

function ScoreChart({ history }: { history: Array<{ date: string; score: number }> }) {
  const max = 100;
  const h = 60;
  const w = 200;
  const pts = history.map((p, i) => ({
    x: (i / Math.max(history.length - 1, 1)) * w,
    y: h - (p.score / max) * h,
    ...p,
  }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 60 }}>
        {/* Grid lines */}
        {[25, 50, 75].map(v => (
          <line key={v} x1={0} y1={h - (v / max) * h} x2={w} y2={h - (v / max) * h}
            stroke="#1E293B" strokeWidth="0.5" />
        ))}
        {/* Area fill */}
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill="url(#scoreGrad)" />
        <path d={path} fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 3 : 2}
            fill={i === pts.length - 1 ? "#22D3EE" : "#7C3AED"} />
        ))}
      </svg>
      {/* X labels */}
      <div className="flex justify-between mt-1">
        {history.map((p, i) => (
          <span key={i} className="text-[9px] font-mono text-text-muted">{p.date}</span>
        ))}
      </div>
    </div>
  );
}

function HintBar({ level, count, max }: { level: number; count: number; max: number }) {
  const colors = ["","text-accent-cyan","text-accent-purple","text-accent-orange","text-accent-pink","text-accent-green"];
  const bars   = ["","bg-accent-cyan","bg-accent-purple","bg-accent-orange","bg-accent-pink","bg-accent-green"];
  const labels = ["","Pattern","Direction","Logic","Optimize","Pseudocode"];
  return (
    <div className="flex items-center gap-2">
      <span className={`text-[10px] font-mono w-16 shrink-0 ${colors[level]}`}>{labels[level]}</span>
      <div className="flex-1 h-1.5 rounded-full bg-bg-card overflow-hidden">
        <motion.div className={`h-full rounded-full ${bars[level]}`}
          initial={{ width: 0 }} animate={{ width: max > 0 ? `${(count / max) * 100}%` : "0%" }}
          transition={{ duration: 0.6 }} />
      </div>
      <span className="text-[10px] font-mono text-text-muted w-4 text-right">{count}</span>
    </div>
  );
}

function TopicHeatmap() {
  const { state } = useStore();
  // 11 topics × heat based on progress
  const cells = state.topicProgress.map(t => ({
    name: t.name.split(" ")[0], // abbreviate
    heat: t.progress / 100,
    confidence: t.confidence,
  }));

  return (
    <div className="flex flex-wrap gap-1.5">
      {cells.map((c, i) => (
        <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: i * 0.03 }}
          className="relative group"
        >
          <div
            className="w-9 h-9 rounded-md flex items-center justify-center text-[9px] font-mono cursor-default transition-all"
            style={{
              background: c.heat > 0.6
                ? `rgba(16,185,129,${0.1 + c.heat * 0.3})`
                : c.heat > 0.3
                ? `rgba(124,58,237,${0.1 + c.heat * 0.3})`
                : `rgba(30,41,59,0.8)`,
              border: `1px solid ${c.heat > 0.6 ? "rgba(16,185,129,0.3)" : c.heat > 0.3 ? "rgba(124,58,237,0.3)" : "rgba(30,41,59,0.8)"}`,
              color: c.heat > 0.4 ? "#F1F5F9" : "#475569",
            }}
          >
            {c.name.slice(0, 3)}
          </div>
          {/* Tooltip */}
          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10">
            <div className="bg-bg-card border border-border-dim rounded px-2 py-1 text-[10px] font-mono text-text-secondary whitespace-nowrap">
              {c.name}: {Math.round(c.heat * 100)}%
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string | number; sub: string; color: string;
}) {
  return (
    <div className={`px-3 py-2.5 rounded-lg bg-bg-card border border-border-dim`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className={color}>{icon}</span>
        <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">{label}</span>
      </div>
      <div className={`font-display text-xl font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-text-muted mt-0.5">{sub}</div>
    </div>
  );
}

export default function ProgressDashboard() {
  const { state } = useStore();
  const { analytics } = state;

  // Deterministic derived metrics
  const totalHints   = Object.values(analytics.hintUsageByLevel).reduce((a, b) => a + b, 0);
  const hintDep      = totalHints > 0 ? Math.round(((analytics.hintUsageByLevel[4] || 0) + (analytics.hintUsageByLevel[5] || 0)) / totalHints * 100) : 0;
  const bruteForceRate = (analytics.bruteForceCount + analytics.optimalCount) > 0
    ? Math.round(analytics.bruteForceCount / (analytics.bruteForceCount + analytics.optimalCount) * 100) : 0;
  const maxHintCount = Math.max(...Object.values(analytics.hintUsageByLevel), 1);
  const latestScore = analytics.scoreHistory.at(-1)?.score ?? state.interviewScore;
  const prevScore   = analytics.scoreHistory.at(-2)?.score ?? latestScore;
  const delta = latestScore - prevScore;

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-4">
      {/* Top stats */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard icon={<Target size={11} />} label="Score" color="text-accent-cyan"
          value={state.interviewScore} sub={delta >= 0 ? `+${delta} this week` : `${delta} this week`} />
        <StatCard icon={<TrendingUp size={11} />} label="Optimal" color="text-accent-green"
          value={`${analytics.optimalCount}`} sub={`${analytics.bruteForceCount} brute force`} />
      </div>

      {/* Score trend */}
      <div className="px-3 py-2.5 rounded-lg bg-bg-card border border-border-dim">
        <div className="flex items-center gap-1.5 mb-2">
          <BarChart2 size={11} className="text-accent-purple" />
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Score Trend</span>
        </div>
        <ScoreChart history={analytics.scoreHistory} />
      </div>

      {/* Hint usage breakdown */}
      <div className="px-3 py-2.5 rounded-lg bg-bg-card border border-border-dim">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Zap size={11} className="text-accent-orange" />
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Hint Usage</span>
          </div>
          <span className="text-[10px] font-mono text-text-muted">{totalHints} total</span>
        </div>
        <div className="space-y-1.5">
          {[1,2,3,4,5].map(lvl => (
            <HintBar key={lvl} level={lvl}
              count={analytics.hintUsageByLevel[lvl] || 0}
              max={maxHintCount} />
          ))}
        </div>
        {hintDep > 30 && (
          <p className="mt-2 text-[10px] text-accent-orange font-mono">
            ⚠ High deep-hint dependency ({hintDep}%). Try solving without hints.
          </p>
        )}
      </div>

      {/* Topic heatmap */}
      <div className="px-3 py-2.5 rounded-lg bg-bg-card border border-border-dim">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Award size={11} className="text-accent-green" />
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Topic Mastery</span>
        </div>
        <TopicHeatmap />
        <div className="flex items-center gap-3 mt-2.5">
          {[
            { label: "Low",    color: "bg-bg-card border border-border-dim" },
            { label: "Med",    color: "bg-accent-purple/25 border border-accent-purple/30" },
            { label: "High",   color: "bg-accent-green/25 border border-accent-green/30" },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded-sm ${l.color}`} />
              <span className="text-[9px] text-text-muted font-mono">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Brute force warning */}
      {bruteForceRate > 40 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="px-3 py-2 rounded-lg border border-accent-orange/25 bg-accent-orange/5"
        >
          <p className="text-[11px] text-accent-orange font-mono leading-relaxed">
            🔴 {bruteForceRate}% of your solutions use brute force.<br />
            Focus on: HashMap, Two Pointers, Sliding Window.
          </p>
        </motion.div>
      )}
    </div>
  );
}
