"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Lock, ChevronDown, Sparkles } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { getHint } from "@/lib/api";

const HINT_META = [
  { level: 1, label: "Pattern",    colorClass: "text-accent-cyan",   borderClass: "border-accent-cyan/30",   bgClass: "bg-accent-cyan/5"   },
  { level: 2, label: "Direction",  colorClass: "text-accent-purple", borderClass: "border-accent-purple/30", bgClass: "bg-accent-purple/5" },
  { level: 3, label: "Logic",      colorClass: "text-accent-orange", borderClass: "border-accent-orange/30", bgClass: "bg-accent-orange/5" },
  { level: 4, label: "Optimize",   colorClass: "text-accent-pink",   borderClass: "border-accent-pink/30",      bgClass: "bg-accent-pink/5"      },
  { level: 5, label: "Pseudocode", colorClass: "text-accent-green",  borderClass: "border-accent-green/30",  bgClass: "bg-accent-green/5"  },
];

// Fallback hints per problem per level
const FALLBACK: Record<string, Record<number, string>> = {
  "two-sum": {
    1: "This problem is solved with a HashMap (complement lookup). The key pattern is: store what you've seen.",
    2: "For each element, the answer you need is (target − current). Ask: have I seen that value before?",
    3: "Single pass: for each nums[i], check if (target − nums[i]) exists in your hashmap. If yes → done. If no → store nums[i] → i.",
    4: "Naive O(n²) uses nested loops. HashMap reduces this to O(n) time, O(n) space. The trade-off is worth it for large inputs.",
    5: `seen = {}\nfor i, val in enumerate(nums):\n    complement = target - val\n    if complement in seen:\n        return [seen[complement], i]\n    seen[val] = i`,
  },
  "longest-substring": {
    1: "This uses a Sliding Window pattern. Maintain a window of valid characters.",
    2: "Use two pointers (left, right). Expand right. When a repeat is found, shrink from left.",
    3: "Use a set or dict to track chars in window. If s[right] in set → remove s[left], move left. Always update max_len.",
    4: "O(n) time with sliding window. O(k) space where k is charset size. Brute force is O(n²) or O(n³).",
    5: `left = 0\nseen = set()\nmax_len = 0\nfor right in range(len(s)):\n    while s[right] in seen:\n        seen.remove(s[left])\n        left += 1\n    seen.add(s[right])\n    max_len = max(max_len, right - left + 1)\nreturn max_len`,
  },
};

const DEFAULT_FALLBACK: Record<number, string> = {
  1: "Identify the core data structure this problem needs.",
  2: "Break down the problem: what do you need to find? What do you already know?",
  3: "Think step-by-step: what happens on each iteration? What state do you track?",
  4: "Analyze your loops. Can you eliminate one with a smarter data structure?",
  5: "Pseudocode: initialize data structure → iterate → check condition → store/return result.",
};

export default function HintPanel() {
  const { state, dispatch } = useStore();
  const [expanded, setExpanded] = useState<number | null>(null);

  const fetchHint = async () => {
    if (!state.currentProblem) return;
    const nextLevel = state.hintLevel + 1;
    if (nextLevel > 5) return;

    dispatch({ type: "SET_GETTING_HINT", payload: true });

    try {
      const res = await getHint({
        problem_id: state.currentProblem.id,
        // ✅ Fixed: now passes title + statement
        problem_title: state.currentProblem.title,
        problem_statement: state.currentProblem.statement,
        user_code: state.userCode,
        hint_level: nextLevel,
        topic: state.currentProblem.topic,
        session_id: state.sessionId,
      });
      dispatch({
        type: "SET_HINT",
        payload: {
          hint: res.hint,
          level: nextLevel,
          pattern: res.pattern_detected,
          weaknesses: res.weaknesses,
          suggestions: res.suggestions,
          time: res.complexity_estimate,
          space: "O(n)",
        },
      });
      setExpanded(nextLevel);
    } catch {
      const fb =
        FALLBACK[state.currentProblem.id]?.[nextLevel] ??
        DEFAULT_FALLBACK[nextLevel] ??
        "Think carefully about the problem structure.";
      dispatch({
        type: "SET_HINT",
        payload: {
          hint: fb,
          level: nextLevel,
          pattern: state.patternDetected,
          weaknesses: state.weaknesses,
          suggestions: state.suggestions,
          time: state.complexityEstimate.time,
          space: state.complexityEstimate.space,
        },
      });
      setExpanded(nextLevel);
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Unlock button */}
      {state.hintLevel < 5 && (
        <motion.button
          onClick={fetchHint}
          disabled={state.isGettingHint}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-mono transition-all duration-200 ${
            state.isGettingHint
              ? "border-accent-purple/20 bg-accent-purple/5 text-accent-purple/50 cursor-wait"
              : "border-accent-purple/50 bg-accent-purple/10 text-accent-purple hover:bg-accent-purple/20 hover:border-accent-purple/70"
          }`}
          style={{ boxShadow: state.isGettingHint ? undefined : "0 0 16px rgba(124,58,237,0.2)" }}
        >
          {state.isGettingHint ? (
            <>
              <motion.div
                className="w-3 h-3 border border-accent-purple/40 border-t-accent-purple rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
              />
              <span>
                AI thinking
                <span className="thinking-dots">
                  <span>.</span><span>.</span><span>.</span>
                </span>
              </span>
            </>
          ) : (
            <>
              <Zap size={12} />
              Unlock Level {state.hintLevel + 1}
              <span className="opacity-60 text-[11px]">
                — {HINT_META[state.hintLevel]?.label}
              </span>
            </>
          )}
        </motion.button>
      )}

      {/* Hint level cards */}
      <div className="space-y-1.5">
        {HINT_META.map((h) => {
          const isUnlocked = h.level <= state.hintLevel;
          const isOpen = expanded === h.level;
          const hintText =
            h.level === state.hintLevel
              ? state.currentHint
              : FALLBACK[state.currentProblem?.id ?? ""]?.[h.level] ??
                DEFAULT_FALLBACK[h.level] ??
                "";

          return (
            <div key={h.level}>
              <button
                onClick={() => isUnlocked && setExpanded(isOpen ? null : h.level)}
                disabled={!isUnlocked}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs transition-all duration-150 ${
                  isUnlocked
                    ? `${h.borderClass} ${h.bgClass} hover:opacity-95 cursor-pointer`
                    : "border-border-dim/30 opacity-25 cursor-not-allowed"
                }`}
              >
                {/* Level badge */}
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold font-mono border ${
                  isUnlocked ? `${h.borderClass} ${h.colorClass}` : "border-border-dim text-text-muted"
                }`}>
                  {isUnlocked ? h.level : <Lock size={8} />}
                </div>
                <span className={`font-mono flex-1 text-left text-[11px] ${isUnlocked ? h.colorClass : "text-text-muted"}`}>
                  {h.label}
                </span>
                {isUnlocked && (
                  <ChevronDown size={10} className={`transition-transform duration-150 ${h.colorClass} ${isOpen ? "rotate-180" : ""}`} />
                )}
              </button>

              <AnimatePresence>
                {isUnlocked && isOpen && (
                  <motion.div
                    key={`hint-${h.level}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <div className={`mx-1 p-3 rounded-b-lg border-x border-b ${h.borderClass} ${h.bgClass}`}>
                      <p className={`text-[11px] leading-relaxed font-mono whitespace-pre-wrap ${h.colorClass}`}>
                        {hintText}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* All unlocked state */}
      {state.hintLevel >= 5 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-2 space-y-1"
        >
          <div className="flex justify-center">
            <Sparkles size={14} className="text-accent-green" />
          </div>
          <p className="text-[10px] text-text-muted font-mono">All hints revealed. Now implement it!</p>
          <button
            onClick={() => dispatch({ type: "RESET_HINT_LEVEL" })}
            className="text-[10px] text-accent-purple hover:underline font-mono"
          >
            Reset hints
          </button>
        </motion.div>
      )}
    </div>
  );
}
