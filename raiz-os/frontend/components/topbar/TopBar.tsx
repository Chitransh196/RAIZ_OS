"use client";
import { motion } from "framer-motion";
import { Zap, Target, Brain, Flame, Eye, EyeOff, Activity, ChevronRight, Swords } from "lucide-react";
import { useState } from "react";
import { PROBLEM_BANK } from "@/lib/store";
import { useStore } from "@/lib/store";

// FIX #5: static score color map instead of fragile glow-text-* CSS class strings
const scoreStyle = (score: number) =>
  score >= 80 ? { color: "#10B981", textShadow: "0 0 10px rgba(16,185,129,0.6)" }
  : score >= 60 ? { color: "#22D3EE", textShadow: "0 0 10px rgba(34,211,238,0.6)" }
  : { color: "#F59E0B", textShadow: "0 0 10px rgba(245,158,11,0.6)" };

const scoreBarColor = (score: number) =>
  score >= 80 ? "bg-accent-green" : score >= 60 ? "bg-accent-cyan" : "bg-accent-orange";

export default function TopBar() {
  const { state, dispatch } = useStore();
  // FIX #5: no dead AnimatePresence import
  const [aiStatus] = useState<"active" | "thinking" | "idle">("active");

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative z-50 h-14 glass-panel border-b border-border-dim flex items-center justify-between px-4 gap-4 shrink-0"
    >
      {/* Scan-line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/20 to-transparent"
          animate={{ top: ["0%", "100%"] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} />
      </div>

      {/* LEFT: Logo + Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center">
              <Brain size={14} className="text-white" />
            </div>
            <motion.div className="absolute -inset-0.5 rounded-md bg-gradient-to-br from-accent-purple/40 to-accent-cyan/40 blur-sm -z-10"
              animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />
          </div>
          <span className="font-display text-sm font-bold tracking-widest text-text-primary">
            RAIZ<span style={{ color: "#22D3EE", textShadow: "0 0 10px rgba(34,211,238,0.7)" }}> OS</span>
          </span>
        </div>

        <div className="w-px h-6 bg-border-dim" />

        {/* AI status pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full glass-panel border border-border-dim">
          <motion.div className={`w-2 h-2 rounded-full ${aiStatus === "active" ? "bg-accent-green" : "bg-text-muted"}`}
            animate={aiStatus === "active" ? { opacity: [1, 0.4, 1], scale: [1, 0.85, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }} />
          <span className="text-xs font-mono text-text-secondary">
            AI Mentor <span className={aiStatus === "active" ? "text-accent-green" : "text-text-muted"}>
              {aiStatus === "active" ? "Active" : "Idle"}
            </span>
          </span>
        </div>

        {/* Breadcrumb */}
        {state.currentProblem && (
          <div className="hidden md:flex items-center gap-1 text-xs text-text-muted">
            <span>{state.currentProblem.topic}</span>
            <ChevronRight size={10} />
            <span className="text-text-secondary">{state.currentProblem.title}</span>
            <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono ${
              state.currentProblem.difficulty === "Easy" ? "bg-accent-green/10 text-accent-green"
              : state.currentProblem.difficulty === "Medium" ? "bg-accent-orange/10 text-accent-orange"
              : "bg-accent-red/10 text-accent-red"
            }`}>{state.currentProblem.difficulty}</span>
          </div>
        )}
      </div>

      {/* CENTER: Score + Streak + Activity */}
      <div className="flex items-center gap-5">
        {/* Interview score */}
        <div className="flex items-center gap-2">
          <Target size={13} className="text-text-muted" />
          <span className="text-[11px] text-text-muted font-mono">Interview</span>
          <span className="font-display text-base font-bold" style={scoreStyle(state.interviewScore)}>
            {state.interviewScore}
          </span>
          <span className="text-[10px] text-text-muted">/100</span>
          <div className="w-14 h-1 rounded-full bg-bg-card overflow-hidden">
            <motion.div className={`h-full rounded-full ${scoreBarColor(state.interviewScore)}`}
              initial={{ width: 0 }} animate={{ width: `${state.interviewScore}%` }}
              transition={{ duration: 1, delay: 0.5 }} />
          </div>
        </div>

        <div className="w-px h-5 bg-border-dim" />

        {/* Streak */}
        <div className="flex items-center gap-1.5">
          <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <Flame size={14} className="text-accent-orange" />
          </motion.div>
          <span className="font-display text-sm font-bold text-accent-orange">{state.streak}</span>
          <span className="text-[11px] text-text-muted">day streak</span>
        </div>

        <div className="w-px h-5 bg-border-dim" />

        {/* Activity sparkline */}
        <div className="hidden lg:flex items-end gap-0.5 h-4">
          {[3,5,2,7,4,6,8,5,3,6].map((h, i) => (
            <motion.div key={i} className="w-1 rounded-sm bg-accent-purple/40"
              style={{ height: `${h * 2}px` }}
              initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.04, duration: 0.3 }} />
          ))}
        </div>
        <Activity size={11} className="hidden lg:block text-text-muted" />
      </div>

      {/* RIGHT: Hints + Focus + Avatar */}
      <div className="flex items-center gap-3">
        {/* Hint level dots */}
        <div className="hidden sm:flex items-center gap-1.5">
          <Zap size={12} className="text-text-muted" />
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map((lvl) => (
              <motion.div key={lvl}
                className={`w-2 h-2 rounded-sm ${lvl <= state.hintLevel ? "bg-accent-purple" : "bg-border-dim"}`}
                animate={lvl === state.hintLevel && state.hintLevel > 0 ? { opacity: [1, 0.4, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }} />
            ))}
          </div>
        </div>

        <div className="w-px h-5 bg-border-dim" />

        {/* Interview mode launch */}
        <motion.button
          onClick={() => {
            const p = PROBLEM_BANK[Math.floor(Math.random() * PROBLEM_BANK.length)];
            dispatch({ type: "START_INTERVIEW", payload: p });
          }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono border border-accent-cyan/35 bg-accent-cyan/8 text-accent-cyan hover:bg-accent-cyan/15 transition-all duration-200"
          style={{ background: "rgba(34,211,238,0.06)" }}
        >
          <Swords size={12} />
          <span className="hidden sm:block">Interview</span>
        </motion.button>

        {/* Focus mode toggle */}
        <motion.button onClick={() => dispatch({ type: "TOGGLE_FOCUS_MODE" })}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all duration-200 ${
            state.focusMode
              ? "border border-accent-purple/40 text-accent-purple"
              : "glass-panel border border-border-dim text-text-muted hover:text-text-primary hover:border-accent-purple/30"
          }`}
          style={state.focusMode ? { background: "rgba(124,58,237,0.12)", boxShadow: "0 0 12px rgba(124,58,237,0.2)" } : {}}
        >
          {state.focusMode ? <EyeOff size={12} /> : <Eye size={12} />}
          {state.focusMode ? "Exit Focus" : "Focus Mode"}
        </motion.button>

        {/* Avatar */}
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center text-xs font-bold font-mono cursor-pointer select-none">
            U
          </div>
          <motion.div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-accent-purple/30 to-accent-cyan/30 blur-sm -z-10"
            animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }} />
        </div>
      </div>
    </motion.header>
  );
}
