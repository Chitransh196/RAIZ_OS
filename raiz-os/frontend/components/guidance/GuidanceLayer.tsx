"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, X, ChevronRight, Sparkles, AlertTriangle, Trophy, Lightbulb, Brain } from "lucide-react";
import { useStore } from "@/lib/store";

const MESSAGES = [
  { msg: "You've used nested loops 3 times today. Try HashMap to reduce complexity to O(n).", type: "warning"       as const },
  { msg: "Great pattern recognition! HashMap + complement is the optimal approach here.",    type: "encouragement" as const },
  { msg: "Challenge: Can you solve this without extra space? Think in-place Two Pointers.",  type: "challenge"     as const },
  { msg: "Tip: State your approach verbally before coding. Interviewers value communication.", type: "tip"         as const },
  { msg: "You're approaching the brute-force trap. Step back and identify the bottleneck.",  type: "warning"       as const },
  { msg: "Sliding Window appears in 28% of FAANG interviews. You haven't practiced it yet.", type: "warning"       as const },
  { msg: "3-day streak! Consistency is what separates candidates who pass from those who don't.", type: "encouragement" as const },
];

const TYPE_CFG = {
  warning:       { Icon: AlertTriangle, color: "text-accent-orange", dot: "bg-accent-orange", border: "border-accent-orange/30", bg: "bg-accent-orange/5",  glow: "rgba(245,158,11,0.12)"  },
  tip:           { Icon: Lightbulb,     color: "text-accent-cyan",   dot: "bg-accent-cyan",   border: "border-accent-cyan/30",   bg: "bg-accent-cyan/5",    glow: "rgba(34,211,238,0.08)"  },
  encouragement: { Icon: Trophy,        color: "text-accent-green",  dot: "bg-accent-green",  border: "border-accent-green/30",  bg: "bg-accent-green/5",   glow: "rgba(16,185,129,0.08)"  },
  challenge:     { Icon: Sparkles,      color: "text-accent-purple", dot: "bg-accent-purple", border: "border-accent-purple/30", bg: "bg-accent-purple/5",  glow: "rgba(124,58,237,0.12)"  },
};

export default function GuidanceLayer() {
  const { state } = useStore();
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ✅ Fixed stale closure: use callback ref pattern
  const advance = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setIdx((prev) => (prev + 1) % MESSAGES.length);
      setVisible(true);
    }, 350);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(advance, 14000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [advance]);

  const dismiss = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    advance();
    timerRef.current = setInterval(advance, 14000);
  };

  // Use store message if it changed from default
  const storeHasCustom = state.guidanceMessage !== "You've solved 3 Array problems today. Try using HashMap to avoid nested loops.";
  const activeMsg  = storeHasCustom ? state.guidanceMessage : MESSAGES[idx].msg;
  const activeType = storeHasCustom ? state.guidanceType    : MESSAGES[idx].type;

  const cfg = TYPE_CFG[activeType];
  const { Icon } = cfg;

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className={`relative h-11 shrink-0 flex items-center px-4 gap-3 border-t ${cfg.border} overflow-hidden`}
      style={{
        background: `linear-gradient(135deg, ${cfg.glow} 0%, rgba(11,17,32,0.97) 50%, rgba(11,17,32,0.97) 100%)`,
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Ambient glow strip */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ background: `linear-gradient(90deg, ${cfg.glow}, transparent 40%)` }}
      />

      {/* AI badge */}
      <div className="flex items-center gap-1.5 shrink-0">
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-5 h-5 rounded-md bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center"
        >
          <Brain size={10} className="text-white" />
        </motion.div>
        <span className="text-[10px] font-display font-bold tracking-widest text-text-muted hidden sm:block">
          AI
        </span>
      </div>

      {/* Separator */}
      <div className="w-px h-5 bg-border-dim shrink-0" />

      {/* Message */}
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={`${idx}-${storeHasCustom}`}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2 flex-1 min-w-0"
          >
            <Icon size={12} className={`${cfg.color} shrink-0`} />
            <span className="text-[11px] text-text-secondary truncate leading-relaxed">
              {activeMsg}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right actions */}
      <div className="flex items-center gap-3 shrink-0">
        <button className={`hidden sm:flex items-center gap-1 text-[10px] font-mono ${cfg.color} hover:underline`}>
          Learn <ChevronRight size={9} />
        </button>

        {/* Dot progress */}
        <div className="hidden sm:flex items-center gap-1">
          {MESSAGES.map((_, i) => (
            <motion.div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === idx ? `w-3 ${cfg.dot}` : "w-1 bg-border-dim"
              }`}
            />
          ))}
        </div>

        <button
          onClick={dismiss}
          className="text-text-muted hover:text-text-secondary transition-colors p-0.5"
          aria-label="Next message"
        >
          <X size={11} />
        </button>
      </div>
    </motion.div>
  );
}
