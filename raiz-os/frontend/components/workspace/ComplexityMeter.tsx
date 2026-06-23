"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, HardDrive, TrendingDown, Zap } from "lucide-react";
import { useStore } from "@/lib/store";

type ComplexityKey = "O(1)"|"O(log n)"|"O(n)"|"O(n log n)"|"O(n²)"|"O(n³)"|"O(2^n)"|"—"|string;

const COMPLEXITY_CFG: Record<string, { score: number; color: string; bar: string; label: string }> = {
  "O(1)":       { score: 100, color: "text-accent-green",  bar: "bg-accent-green",  label: "Optimal"    },
  "O(log n)":   { score: 90,  color: "text-accent-green",  bar: "bg-accent-green",  label: "Excellent"  },
  "O(n)":       { score: 75,  color: "text-accent-cyan",   bar: "bg-accent-cyan",   label: "Good"       },
  "O(n log n)": { score: 60,  color: "text-accent-cyan",   bar: "bg-accent-cyan",   label: "Acceptable" },
  "O(n²)":      { score: 35,  color: "text-accent-orange", bar: "bg-accent-orange", label: "Suboptimal" },
  "O(n³)":      { score: 15,  color: "text-accent-red",    bar: "bg-accent-red",    label: "Poor"       },
  "O(2^n)":     { score: 5,   color: "text-accent-red",    bar: "bg-accent-red",    label: "Critical"   },
  "—":          { score: 0,   color: "text-text-muted",    bar: "bg-text-muted",    label: "Not run"    },
};

function get(val: string) {
  return COMPLEXITY_CFG[val] ?? { score: 50, color: "text-accent-orange", bar: "bg-accent-orange", label: "Unknown" };
}

function Bar({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  const cfg = get(value);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
          {icon}
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <code className={`text-[11px] font-mono font-bold ${cfg.color}`}>{value}</code>
          <span className={`text-[10px] font-mono ${cfg.color} opacity-60`}>{cfg.label}</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-bg-card overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${cfg.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${cfg.score}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          key={value}
        />
      </div>
    </div>
  );
}

export default function ComplexityMeter() {
  const { state } = useStore();
  // ✅ Now reads both time AND space from store (both reactive)
  const { time, space } = state.complexityEstimate;
  const timeCfg = get(time);
  const showOptimizationTip = timeCfg.score < 60 && time !== "—";

  return (
    <div className="px-3 py-2.5 border-t border-border-dim bg-bg-card/20 shrink-0">
      <div className="flex items-center gap-2 mb-2.5">
        <TrendingDown size={11} className="text-text-muted" />
        <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
          Complexity
        </span>
        {state.isEvaluating && (
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-accent-purple"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 0.7, repeat: Infinity }}
          />
        )}
      </div>

      <div className="space-y-2">
        <Bar label="Time"  value={time}  icon={<Clock size={10} />}      />
        <Bar label="Space" value={space} icon={<HardDrive size={10} />}  />
      </div>

      <AnimatePresence>
        {showOptimizationTip && (
          <motion.div
            key="opt-tip"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 px-2.5 py-1.5 rounded-md bg-accent-orange/5 border border-accent-orange/20 flex items-start gap-1.5">
              <Zap size={10} className="text-accent-orange shrink-0 mt-0.5" />
              <p className="text-[10px] text-accent-orange font-mono leading-relaxed">
                Optimization available — consider reducing to O(n).
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

