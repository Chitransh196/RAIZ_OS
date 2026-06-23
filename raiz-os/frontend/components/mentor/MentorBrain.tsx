"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Brain, Zap, AlertTriangle, Target, ChevronDown, Activity, BarChart2 } from "lucide-react";
import { useStore } from "@/lib/store";
import HintPanel from "./HintPanel";
import WeaknessPanel from "./WeaknessPanel";
import StrategyPanel from "./StrategyPanel";
import ProgressDashboard from "@/components/analytics/ProgressDashboard";

type Section = "hints" | "analysis" | "strategy" | "analytics";

const SECTIONS = [
  { id: "hints"    as Section, label: "Hints",    icon: <Zap size={12} />,           accent: "purple" },
  { id: "analysis" as Section, label: "Analysis", icon: <AlertTriangle size={12} />, accent: "orange" },
  { id: "strategy"  as Section, label: "Strategy",  icon: <Target size={12} />,        accent: "cyan"   },
  { id: "analytics" as Section, label: "Progress",  icon: <BarChart2 size={12} />,     accent: "green"  },
] as const;

// Static maps for Tailwind — dynamic classnames are not safe with JIT
const ACCENT_COLORS = {
  purple: { text: "text-accent-purple", border: "border-accent-purple/30", bg: "bg-accent-purple/10" },
  orange: { text: "text-accent-orange", border: "border-accent-orange/30", bg: "bg-accent-orange/10" },
  cyan:   { text: "text-accent-cyan",   border: "border-accent-cyan/30",   bg: "bg-accent-cyan/10"   },
  green:  { text: "text-accent-green",  border: "border-accent-green/30",  bg: "bg-accent-green/10"  },
};

function SectionHeader({
  section,
  expanded,
  onToggle,
}: {
  section: typeof SECTIONS[number];
  expanded: boolean;
  onToggle: () => void;
}) {
  const colors = ACCENT_COLORS[section.accent];
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between px-3 py-2.5 border-b border-border-dim/60 transition-all duration-150 ${
        expanded ? colors.bg : "hover:bg-bg-card/40"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={colors.text}>{section.icon}</span>
        <span className="text-xs font-mono text-text-secondary uppercase tracking-wider">
          {section.label}
        </span>
      </div>
      <ChevronDown
        size={12}
        className={`text-text-muted transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
      />
    </button>
  );
}

// Complexity label helper — purely static map
function complexityLabel(val: string) {
  if (val === "O(1)" || val === "O(log n)") return { label: "Optimal", color: "text-accent-green" };
  if (val === "O(n)" || val === "O(n log n)") return { label: "Good", color: "text-accent-cyan" };
  if (val === "O(n²)" || val === "O(n³)") return { label: "Suboptimal", color: "text-accent-orange" };
  if (val === "O(2^n)") return { label: "Critical", color: "text-accent-red" };
  return { label: "Analyzing", color: "text-text-muted" };
}

export default function MentorBrain() {
  // ✅ Single useStore() call at top level — no hook violations
  const { state } = useStore();
  const [expanded, setExpanded] = useState<Record<Section, boolean>>({
    hints: true,
    analysis: true,
    strategy: false,
    analytics: false,
  });

  const toggle = (s: Section) => setExpanded((prev) => ({ ...prev, [s]: !prev[s] }));

  const timeInfo = complexityLabel(state.complexityEstimate.time);
  const isSuboptimal =
    state.complexityEstimate.time === "O(n²)" ||
    state.complexityEstimate.time === "O(n³)" ||
    state.complexityEstimate.time === "O(2^n)";

  return (
    <motion.aside
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="glass-panel border-l border-border-dim flex flex-col h-full overflow-hidden"
      style={{ width: 240 }}
    >
      {/* ── Header ── */}
      <div className="p-3 border-b border-border-dim shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative shrink-0">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center">
              <Brain size={13} className="text-white" />
            </div>
            <motion.div
              className="absolute -inset-0.5 rounded-md bg-gradient-to-br from-accent-purple/40 to-accent-cyan/40 blur-sm -z-10"
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div className="min-w-0">
            <div className="font-display text-[11px] font-bold tracking-widest text-text-primary">
              MENTOR BRAIN
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-accent-green shrink-0"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-[10px] font-mono text-text-muted truncate">
                {state.isGettingHint ? "Generating hint..." : "Observing your code"}
              </span>
            </div>
          </div>
        </div>

        {/* Complexity summary card */}
        <div className={`mt-2.5 flex items-center gap-2 px-2.5 py-2 rounded-lg border transition-colors duration-300 ${
          isSuboptimal ? "bg-accent-orange/5 border-accent-orange/25" : "bg-bg-card border-border-dim"
        }`}>
          <Activity size={11} className={timeInfo.color} />
          <span className="text-[10px] font-mono text-text-muted">Complexity:</span>
          <span className={`font-mono text-sm font-bold ml-auto ${timeInfo.color}`}>
            {state.complexityEstimate.time}
          </span>
          <span className={`text-[10px] font-mono ${timeInfo.color} opacity-70`}>
            {timeInfo.label}
          </span>
        </div>
      </div>

      {/* ── Scrollable sections ── */}
      <div className="flex-1 overflow-y-auto divide-y divide-border-dim/50">
        {SECTIONS.map((section) => (
          <div key={section.id}>
            <SectionHeader
              section={section}
              expanded={expanded[section.id]}
              onToggle={() => toggle(section.id)}
            />
            <AnimatePresence initial={false}>
              {expanded[section.id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-3">
                    {section.id === "hints"    && <HintPanel />}
                    {section.id === "analysis" && <WeaknessPanel />}
                    {section.id === "strategy"  && <StrategyPanel />}
                    {section.id === "analytics" && <ProgressDashboard />}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <div className="p-2.5 border-t border-border-dim bg-bg-card/20 shrink-0">
        <div className="text-[10px] font-mono text-text-muted text-center truncate">
          <span className="text-border-dim">session://</span>
          <span className="text-accent-purple/70">{state.sessionId.slice(5, 21)}</span>
        </div>
      </div>
    </motion.aside>
  );
}
