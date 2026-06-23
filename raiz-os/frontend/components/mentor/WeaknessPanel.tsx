"use client";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, TrendingUp, Target } from "lucide-react";
import { useStore } from "@/lib/store";

export default function WeaknessPanel() {
  const { state } = useStore();

  return (
    <div className="space-y-3">
      {/* Weaknesses */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <AlertTriangle size={11} className="text-accent-orange" />
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Detected Weaknesses</span>
        </div>
        <div className="space-y-1.5">
          <AnimatePresence>
            {state.weaknesses.map((w, i) => (
              <motion.div
                key={w}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-2 px-2.5 py-2 rounded-md bg-accent-orange/5 border border-accent-orange/20"
              >
                <div className="w-1 h-1 rounded-full bg-accent-orange mt-1.5 shrink-0" />
                <span className="text-[11px] text-text-secondary leading-relaxed">{w}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Suggestions */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp size={11} className="text-accent-cyan" />
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Suggestions</span>
        </div>
        <div className="space-y-1.5">
          <AnimatePresence>
            {state.suggestions.map((s, i) => (
              <motion.div
                key={s}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.08 + 0.2 }}
                className="flex items-start gap-2 px-2.5 py-2 rounded-md bg-accent-cyan/5 border border-accent-cyan/20"
              >
                <span className="text-accent-cyan text-xs shrink-0 mt-0.5">→</span>
                <span className="text-[11px] text-text-secondary leading-relaxed">{s}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Focus area */}
      <div className="px-2.5 py-2.5 rounded-lg bg-accent-purple/5 border border-accent-purple/20">
        <div className="flex items-center gap-1.5 mb-1">
          <Target size={10} className="text-accent-purple" />
          <span className="text-[10px] font-mono text-accent-purple">Focus Area</span>
        </div>
        <p className="text-[11px] text-text-secondary leading-relaxed">
          Priority: Master <span className="text-accent-cyan">HashMap patterns</span> before moving to DP.
          Your brute-force usage is 3x higher than average for Arrays.
        </p>
      </div>
    </div>
  );
}
