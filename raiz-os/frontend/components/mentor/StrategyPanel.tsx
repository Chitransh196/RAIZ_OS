"use client";
import { motion } from "framer-motion";
import { Brain, Sparkles, ChevronRight, Trophy, Zap } from "lucide-react";
import { useStore } from "@/lib/store";

const INTERVIEW_TIPS = [
  "State brute force first, then optimize aloud — interviewers reward communication",
  "Mention time/space trade-offs before you start coding",
  "Draw the data structure before writing any code",
  "Test edge cases: empty input, single element, duplicates, negatives",
];

const SCORE_BANDS = [
  { min: 80, label: "Interview Ready",   sub: "Apply to L5+ roles.",                color: "text-accent-green",  bar: "bg-accent-green"  },
  { min: 60, label: "Getting There",     sub: "Focus on medium difficulty.",         color: "text-accent-cyan",   bar: "bg-accent-cyan"   },
  { min: 0,  label: "Needs Practice",    sub: "Complete 3 more Array problems.",     color: "text-accent-orange", bar: "bg-accent-orange" },
];

function getBand(score: number) {
  return SCORE_BANDS.find((b) => score >= b.min) ?? SCORE_BANDS[2];
}

export default function StrategyPanel() {
  const { state } = useStore();
  const band = getBand(state.interviewScore);

  return (
    <div className="space-y-3">
      {/* Pattern detected */}
      <div className="px-3 py-2.5 rounded-lg border border-accent-cyan/25 bg-accent-cyan/5">
        <div className="flex items-center gap-2 mb-1">
          <Brain size={11} className="text-accent-cyan" />
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Pattern Detected</span>
        </div>
        <div className="flex items-center justify-between">
          <motion.span
            key={state.patternDetected}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm font-semibold text-accent-cyan"
          >
            {state.patternDetected}
          </motion.span>
          <Sparkles size={11} className="text-accent-cyan/50" />
        </div>
        <p className="mt-1 text-[10px] text-text-muted leading-relaxed">
          {state.currentProblem?.topic} — AI identified this as a {state.patternDetected} problem.
        </p>
      </div>

      {/* Interview score */}
      <div className="px-3 py-2.5 rounded-lg bg-bg-card border border-border-dim">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Trophy size={11} className="text-text-muted" />
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Readiness</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-base font-display font-bold ${band.color}`}>{state.interviewScore}</span>
            <span className="text-[10px] text-text-muted">/100</span>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-bg-primary overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${band.bar}`}
            initial={{ width: 0 }}
            animate={{ width: `${state.interviewScore}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            key={state.interviewScore}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <p className={`text-[10px] font-mono ${band.color}`}>{band.label}</p>
          <p className="text-[10px] text-text-muted">{band.sub}</p>
        </div>
      </div>

      {/* Complexity summary */}
      <div className="px-3 py-2 rounded-lg bg-bg-card border border-border-dim">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Zap size={11} className="text-text-muted" />
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Current Code</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="text-text-muted">Time:</span>
          <span className="text-accent-orange font-bold">{state.complexityEstimate.time}</span>
          <span className="text-border-dim">|</span>
          <span className="text-text-muted">Space:</span>
          <span className="text-accent-cyan font-bold">{state.complexityEstimate.space}</span>
        </div>
      </div>

      {/* Interview tips */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles size={11} className="text-accent-purple" />
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Interview Tips</span>
        </div>
        <div className="space-y-1.5">
          {INTERVIEW_TIPS.map((tip, i) => (
            <motion.div
              key={i}
              initial={{ x: 8, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-start gap-2 text-[11px] text-text-secondary"
            >
              <ChevronRight size={11} className="text-accent-purple/70 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{tip}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
