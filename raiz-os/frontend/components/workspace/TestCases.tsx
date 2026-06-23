"use client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";

export default function TestCases() {
  const { state } = useStore();
  const [expanded, setExpanded] = useState<number | null>(0);

  const tests = state.currentProblem?.testCases || [];
  const results = state.testResults;

  const passCount = results ? results.filter((r) => r.passed).length : 0;

  return (
    <div className="border-t border-border-dim bg-bg-card/20">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-dim">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
            Test Cases
          </span>
          {results && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                passCount === tests.length
                  ? "bg-accent-green/10 text-accent-green"
                  : "bg-accent-red/10 text-accent-red"
              }`}
            >
              {passCount}/{tests.length} passed
            </motion.span>
          )}
        </div>
        {state.isRunning && (
          <div className="flex items-center gap-1 text-xs text-accent-cyan">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Clock size={11} />
            </motion.div>
            <span className="font-mono">Executing...</span>
          </div>
        )}
      </div>

      {/* Test list */}
      <div className="max-h-36 overflow-y-auto">
        {tests.map((tc, i) => {
          const result = results?.[i];
          const isPass = result?.passed;

          return (
            <div key={i} className="border-b border-border-dim/50 last:border-0">
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-bg-card/50 transition-colors duration-100"
              >
                {/* Status icon */}
                <AnimatePresence mode="wait">
                  {result ? (
                    <motion.div
                      key="result"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {isPass ? (
                        <CheckCircle size={13} className="text-accent-green shrink-0" />
                      ) : (
                        <XCircle size={13} className="text-accent-red shrink-0" />
                      )}
                    </motion.div>
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-border-dim shrink-0" />
                  )}
                </AnimatePresence>

                <span className="text-xs text-text-muted font-mono">Test {i + 1}</span>
                <span className="text-[10px] text-text-muted truncate flex-1 text-left">
                  {tc.input}
                </span>

                {expanded === i ? (
                  <ChevronDown size={11} className="text-text-muted shrink-0" />
                ) : (
                  <ChevronRight size={11} className="text-text-muted shrink-0" />
                )}
              </button>

              <AnimatePresence>
                {expanded === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-2 space-y-1">
                      <div className="flex gap-2 text-[10px] font-mono">
                        <span className="text-text-muted w-16 shrink-0">Input:</span>
                        <code className="text-text-secondary">{tc.input}</code>
                      </div>
                      <div className="flex gap-2 text-[10px] font-mono">
                        <span className="text-text-muted w-16 shrink-0">Expected:</span>
                        <code className="text-accent-green">{tc.expected}</code>
                      </div>
                      {result && (
                        <div className="flex gap-2 text-[10px] font-mono">
                          <span className="text-text-muted w-16 shrink-0">Got:</span>
                          <code className={isPass ? "text-accent-green" : "text-accent-red"}>
                            {result.output}
                          </code>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
