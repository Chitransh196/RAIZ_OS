"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  BookOpen, ChevronRight, Lock, CheckCircle2, TrendingUp,
  Layers, Network, GitBranch, Search, SlidersHorizontal,
  BarChart3, RotateCcw, ArrowRight,
} from "lucide-react";
import { useStore, PROBLEM_BANK, type TopicProgress } from "@/lib/store";

const TOPIC_ICONS: Record<string, React.ReactNode> = {
  Arrays:              <Layers size={13} />,
  HashMap:             <Search size={13} />,
  "Sliding Window":    <SlidersHorizontal size={13} />,
  "Two Pointers":      <ChevronRight size={13} />,
  "Binary Search":     <Search size={13} />,
  "Dynamic Programming": <BarChart3 size={13} />,
  Trees:               <GitBranch size={13} />,
  Graphs:              <Network size={13} />,
  Greedy:              <TrendingUp size={13} />,
  Backtracking:        <RotateCcw size={13} />,
  Stacks:              <Layers size={13} />,
};

const CONF_CFG = {
  Low:    { color: "text-accent-red",    bar: "bg-accent-red"    },
  Medium: { color: "text-accent-orange", bar: "bg-accent-orange" },
  High:   { color: "text-accent-green",  bar: "bg-accent-green"  },
};

// Topics unlocked in Phase 1 (first 7)
const UNLOCKED = new Set(["Arrays","HashMap","Sliding Window","Two Pointers","Stacks","Binary Search","Greedy"]);

function TopicCard({ topic, index, onPractice }: {
  topic: TopicProgress; index: number; onPractice: (name: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const conf = CONF_CFG[topic.confidence];
  const unlocked = UNLOCKED.has(topic.name);

  // FIX #3: how many problems in PROBLEM_BANK match this topic
  const available = PROBLEM_BANK.filter(p => p.topic === topic.name);

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.04 }}
      className={`relative group rounded-lg border transition-all duration-200 ${
        unlocked
          ? "border-border-dim hover:border-accent-purple/30 hover:bg-bg-card/50 cursor-pointer"
          : "border-border-dim/30 opacity-40 cursor-not-allowed"
      }`}
      onClick={() => unlocked && setExpanded(!expanded)}
    >
      <div className="p-2.5">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
            topic.progress > 60 ? "bg-accent-green/10 text-accent-green"
            : topic.progress > 30 ? "bg-accent-purple/10 text-accent-purple"
            : "bg-bg-card text-text-muted"
          }`}>
            {unlocked ? (TOPIC_ICONS[topic.name] ?? <BookOpen size={13} />) : <Lock size={12} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-medium text-text-primary truncate">{topic.name}</span>
              <span className={`text-[10px] font-mono shrink-0 ${conf.color}`}>{topic.confidence}</span>
            </div>
            <div className="mt-1 w-full h-1 rounded-full bg-bg-card overflow-hidden">
              <motion.div className={`h-full rounded-full ${conf.bar}`}
                initial={{ width: 0 }} animate={{ width: `${topic.progress}%` }}
                transition={{ duration: 0.7, delay: index * 0.04 + 0.2 }} />
            </div>
          </div>
          <span className="text-[10px] font-mono text-text-muted shrink-0">{topic.progress}%</span>
        </div>

        <AnimatePresence>
          {expanded && unlocked && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden"
            >
              <div className="mt-2 pt-2 border-t border-border-dim/50 space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1 text-text-muted">
                    <CheckCircle2 size={10} className="text-accent-green" />
                    <span>{topic.solved}/{topic.total} solved</span>
                  </div>
                  {available.length > 0 && (
                    <span className="text-accent-cyan">{available.length} available</span>
                  )}
                </div>
                {/* FIX #3: Practice button now dispatches SET_PROBLEM */}
                {available.length > 0 ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); onPractice(topic.name); setExpanded(false); }}
                    className="w-full flex items-center justify-center gap-1.5 py-1 rounded-md bg-accent-purple/10 border border-accent-purple/30 text-accent-purple text-[10px] font-mono hover:bg-accent-purple/20 transition-colors"
                  >
                    <ArrowRight size={9} />Practice {topic.name}
                  </button>
                ) : (
                  <p className="text-[10px] text-text-muted text-center">More problems coming in Phase 2</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function LearningMap() {
  const { state, dispatch } = useStore();
  const [filter, setFilter] = useState<"all" | "weak" | "strong">("all");

  // FIX #3: Practice handler — find first matching problem in PROBLEM_BANK and load it
  const handlePractice = (topicName: string) => {
    const match = PROBLEM_BANK.find(p => p.topic === topicName);
    if (match) dispatch({ type: "SET_PROBLEM", payload: match });
  };

  const filtered = state.topicProgress.filter((t) =>
    filter === "all" ? true
    : filter === "weak" ? t.confidence === "Low"
    : t.confidence !== "Low"
  );

  const totalSolved  = state.topicProgress.reduce((a, t) => a + t.solved, 0);
  const totalProbs   = state.topicProgress.reduce((a, t) => a + t.total, 0);
  const overallPct   = Math.round((totalSolved / totalProbs) * 100);

  return (
    <motion.aside initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-panel border-r border-border-dim flex flex-col h-full overflow-hidden"
    >
      {/* Header */}
      <div className="p-3 border-b border-border-dim shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 rounded-full bg-gradient-to-b from-accent-purple to-accent-cyan" />
          <span className="font-display text-[11px] font-bold tracking-wider text-text-primary">LEARNING MAP</span>
        </div>
        {/* Radial progress */}
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-bg-card border border-border-dim">
          <div className="relative w-10 h-10 shrink-0">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#1E293B" strokeWidth="3" />
              <motion.circle cx="18" cy="18" r="14" fill="none" stroke="url(#pGrad)" strokeWidth="3"
                strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 14}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 14 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 14 * (1 - overallPct / 100) }}
                transition={{ duration: 1, delay: 0.4 }}
              />
              <defs>
                <linearGradient id="pGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7C3AED" /><stop offset="100%" stopColor="#22D3EE" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-text-primary">
              {overallPct}%
            </span>
          </div>
          <div>
            <div className="text-xs text-text-secondary font-medium">Overall</div>
            <div className="text-[10px] text-text-muted font-mono">{totalSolved}/{totalProbs} solved</div>
            <div className="text-[10px] text-accent-cyan font-mono mt-0.5">
              {state.topicProgress.filter(t => t.confidence === "High").length} mastered
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1 p-2 border-b border-border-dim shrink-0">
        {(["all", "weak", "strong"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-1 py-1 text-[10px] font-mono rounded-md transition-all capitalize ${
              filter === f ? "bg-accent-purple/20 text-accent-purple border border-accent-purple/30" : "text-text-muted hover:text-text-secondary"
            }`}
          >{f}</button>
        ))}
      </div>

      {/* Topic list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filtered.map((topic, i) => (
          <TopicCard key={topic.name} topic={topic} index={i} onPractice={handlePractice} />
        ))}
      </div>

      {/* AI Roadmap footer */}
      <div className="p-3 border-t border-border-dim shrink-0">
        <div className="text-[10px] text-text-muted mb-1.5 flex items-center gap-1">
          <TrendingUp size={10} /><span>AI Roadmap</span>
        </div>
        <div className="space-y-1">
          {["Complete Sliding Window", "Start DP basics", "Review Tree traversal"].map((task, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <div className="w-1 h-1 rounded-full bg-accent-purple mt-1.5 shrink-0" />
              <span className="text-[10px] text-text-muted leading-relaxed">{task}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.aside>
  );
}
