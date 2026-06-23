"use client";
import { motion } from "framer-motion";
import { BookOpen, Code2, FlaskConical, Cpu, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useStore, PROBLEM_BANK } from "@/lib/store";
import CodeEditor from "./CodeEditor";
import ComplexityMeter from "./ComplexityMeter";
import TestCases from "./TestCases";
import Visualizer from "./Visualizer";

type Tab = "problem" | "code" | "tests" | "visualize";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "problem",   label: "Problem",   icon: <BookOpen size={12} /> },
  { id: "code",      label: "Editor",    icon: <Code2 size={12} />    },
  { id: "tests",     label: "Tests",     icon: <FlaskConical size={12} /> },
  { id: "visualize", label: "Visualize", icon: <Cpu size={12} />      },
];

function ProblemStatement() {
  const { state } = useStore();
  const p = state.currentProblem;
  if (!p) return null;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5">
      {/* Title row */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-base font-semibold text-text-primary leading-snug">{p.title}</h2>
          <span className={`shrink-0 text-[11px] px-2 py-0.5 rounded-full font-mono border ${
            p.difficulty === "Easy"
              ? "bg-accent-green/10 text-accent-green border-accent-green/25"
              : p.difficulty === "Medium"
              ? "bg-accent-orange/10 text-accent-orange border-accent-orange/25"
              : "bg-accent-red/10 text-accent-red border-accent-red/25"
          }`}>{p.difficulty}</span>
          <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-full bg-accent-purple/10 text-accent-purple border border-accent-purple/25 font-mono">
            {p.topic}
          </span>
        </div>
        {/* Thin gradient divider */}
        <div className="h-px bg-gradient-to-r from-accent-purple/30 via-accent-cyan/20 to-transparent" />
      </div>

      {/* Statement */}
      <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
        {p.statement}
      </div>

      {/* Examples */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-mono text-text-muted uppercase tracking-wider">Examples</h3>
        {p.examples.map((ex, i) => (
          <div key={i} className="p-3 rounded-lg bg-bg-card border border-border-dim font-mono text-xs space-y-1.5">
            <div className="flex gap-2">
              <span className="text-text-muted w-20 shrink-0">Input:</span>
              <code className="text-text-secondary">{ex.input}</code>
            </div>
            <div className="flex gap-2">
              <span className="text-text-muted w-20 shrink-0">Output:</span>
              <code className="text-accent-green">{ex.output}</code>
            </div>
            {ex.explanation && (
              <div className="flex gap-2">
                <span className="text-text-muted w-20 shrink-0">Explain:</span>
                <span className="text-text-muted">{ex.explanation}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Constraints */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-mono text-text-muted uppercase tracking-wider">Constraints</h3>
        <ul className="space-y-1.5">
          {p.constraints.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
              <span className="text-accent-purple/70 mt-0.5 shrink-0">▸</span>
              <code className="font-mono">{c}</code>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ProblemSelector() {
  const { state, dispatch } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-mono border border-border-dim bg-bg-card text-text-secondary hover:text-text-primary hover:border-accent-purple/30 transition-all duration-150"
      >
        <span className="max-w-[120px] truncate">{state.currentProblem?.title ?? "Select"}</span>
        <ChevronDown size={11} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full mt-1 left-0 z-50 glass-panel border border-border-dim rounded-lg overflow-hidden min-w-[220px]"
        >
          {PROBLEM_BANK.map((p) => (
            <button
              key={p.id}
              onClick={() => { dispatch({ type: "SET_PROBLEM", payload: p }); setOpen(false); }}
              className={`w-full px-3 py-2 text-left flex items-center justify-between gap-3 hover:bg-bg-card/60 transition-colors duration-100 ${
                p.id === state.currentProblem?.id ? "bg-accent-purple/10" : ""
              }`}
            >
              <span className="text-[11px] font-mono text-text-secondary truncate">{p.title}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                p.difficulty === "Easy"   ? "text-accent-green  bg-accent-green/10"  :
                p.difficulty === "Medium" ? "text-accent-orange bg-accent-orange/10" :
                                            "text-accent-red    bg-accent-red/10"
              }`}>{p.difficulty}</span>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default function ProblemPanel() {
  const { state, dispatch } = useStore();
  const activeTab = state.activeTab;
  const setTab = (t: Tab) => dispatch({ type: "SET_ACTIVE_TAB", payload: t });

  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="flex-1 flex flex-col glass-panel border-x border-border-dim overflow-hidden min-w-0"
    >
      {/* ── Tab bar + problem selector ── */}
      <div className="flex items-center border-b border-border-dim bg-bg-card/30 shrink-0 gap-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={`relative flex items-center gap-1.5 px-3.5 py-2.5 text-[11px] font-mono transition-all duration-150 border-r border-border-dim/50 shrink-0 ${
              activeTab === tab.id
                ? "text-accent-cyan bg-bg-primary"
                : "text-text-muted hover:text-text-secondary hover:bg-bg-card/50"
            }`}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-active-bar"
                className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-accent-purple to-accent-cyan"
              />
            )}
            {tab.id === "tests" && state.testResults && (
              <span className={`ml-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                state.testResults.every((r) => r.passed) ? "bg-accent-green" : "bg-accent-red"
              }`} />
            )}
          </button>
        ))}
        {/* Spacer + problem selector */}
        <div className="flex-1" />
        <div className="px-3">
          <ProblemSelector />
        </div>
      </div>

      {/* ── Content area ──
          CRITICAL FIX: Monaco Editor is ALWAYS mounted (never unmounted).
          Visibility controlled by CSS so editor state persists across tab switches.
      ── */}
      <div className="flex-1 overflow-hidden flex flex-col">

        {/* Problem statement — shown only on "problem" tab */}
        <div className={`flex-1 overflow-hidden flex flex-col ${activeTab === "problem" ? "" : "hidden"}`}>
          <ProblemStatement />
        </div>

        {/* Editor pane — shown on "code" and "tests" tabs */}
        <div className={`flex-1 overflow-hidden flex flex-col ${
          activeTab === "code" || activeTab === "tests" ? "" : "hidden"
        }`}>
          {/* Monaco always mounted */}
          <div className={`overflow-hidden ${activeTab === "tests" ? "flex-1" : "flex-1"}`}
               style={{ height: activeTab === "tests" ? "calc(100% - 160px)" : "100%" }}>
            <CodeEditor />
          </div>
          {/* Complexity bar — only on code tab */}
          {activeTab === "code" && <ComplexityMeter />}
          {/* Test cases panel — only on tests tab */}
          {activeTab === "tests" && <TestCases />}
        </div>

        {/* Visualize tab — FIX #8: no duplicate ProblemStatement, just Visualizer */}
        <div className={`flex-1 overflow-hidden flex flex-col ${activeTab === "visualize" ? "" : "hidden"}`}>
          <Visualizer />
        </div>
      </div>

      {/* ── Status bar ── */}
      <div className="flex items-center justify-between px-3 py-1 border-t border-border-dim bg-bg-card/20 shrink-0">
        <div className="flex items-center gap-3 text-[10px] font-mono text-text-muted">
          <span className="uppercase">{state.language}</span>
          <span className="text-border-dim">|</span>
          <span>{state.userCode.split("\n").length} lines</span>
          <span className="text-border-dim">|</span>
          <span className="text-accent-purple">
            Hint {state.hintLevel}/5
          </span>
          {state.isEvaluating && (
            <>
              <span className="text-border-dim">|</span>
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-accent-cyan"
              >
                Evaluating...
              </motion.span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-muted">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-accent-green"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span>AI Active</span>
        </div>
      </div>
    </motion.main>
  );
}
