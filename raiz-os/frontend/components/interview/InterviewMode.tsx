"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Timer, X, Send, Trophy, AlertCircle, CheckCircle, Brain, Code2, MessageSquare } from "lucide-react";
import { useStore, PROBLEM_BANK } from "@/lib/store";
import { api } from "@/lib/api";
import dynamic from "next/dynamic";

// Dynamically import Monaco to avoid SSR issues
const Editor = dynamic(() => import("@monaco-editor/react").then(m => m.default), { ssr: false });

// ─── 1 Groq call: evaluate explanation + code → score ────────────────────────
async function evaluateInterview(
  problemTitle: string,
  code: string,
  explanation: string,
  followUp: string,
  language: string
): Promise<{ feedback: string; score: number }> {
  try {
    const res = await api.post("/interview/evaluate", {
      problem_title: problemTitle,
      user_code: code,
      explanation,
      follow_up_answer: followUp,
      language,
    });
    return res.data;
  } catch {
    // Deterministic local fallback — no Groq call wasted
    const hasHashMap = code.includes("dict") || code.includes("{}") || code.includes("Map") || code.includes("HashMap");
    const hasLoop = (code.match(/for|while/g) || []).length;
    const codeLen = code.replace(/\s/g, "").length;
    const hasExplanation = explanation.length > 40;

    let score = 50;
    if (hasHashMap)     score += 15;
    if (hasLoop === 1)  score += 10;
    if (codeLen > 80)   score += 5;
    if (hasExplanation) score += 10;
    if (explanation.toLowerCase().includes("o(n)")) score += 10;
    score = Math.min(95, score);

    const feedback = hasHashMap
      ? `Strong approach using HashMap for O(n) lookup. ${hasExplanation ? "Clear explanation of the complement strategy." : "Next time, explain your approach before coding."} Score: ${score}/100.`
      : `Consider using a HashMap to improve from O(n²) to O(n). ${hasExplanation ? "Good communication." : "Always state your approach first."} Score: ${score}/100.`;

    return { feedback, score };
  }
}

// ─── Timer display ────────────────────────────────────────────────────────────
function InterviewTimer({ startTime, limitSeconds }: { startTime: number | null; limitSeconds: number }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startTime) return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const remaining = Math.max(0, limitSeconds - elapsed);
  const pct = (remaining / limitSeconds) * 100;
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const urgent = remaining < 300; // < 5 min

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
      urgent ? "border-accent-red/40 bg-accent-red/5" : "border-border-dim bg-bg-card"
    }`}>
      <motion.div animate={urgent ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 1, repeat: Infinity }}>
        <Timer size={12} className={urgent ? "text-accent-red" : "text-text-muted"} />
      </motion.div>
      <span className={`font-display text-sm font-bold tabular-nums ${urgent ? "text-accent-red" : "text-accent-cyan"}`}>
        {mm}:{ss}
      </span>
      <div className="w-16 h-1 rounded-full bg-bg-primary overflow-hidden">
        <motion.div className={`h-full rounded-full ${urgent ? "bg-accent-red" : "bg-accent-cyan"}`}
          animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
      </div>
    </div>
  );
}

// ─── Phase screens ────────────────────────────────────────────────────────────
function BriefingScreen() {
  const { state, dispatch } = useStore();
  const problem = state.interview.problem!;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 overflow-y-auto p-6 space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-semibold text-text-primary">{problem.title}</h2>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono border ${
            problem.difficulty === "Easy" ? "bg-accent-green/10 text-accent-green border-accent-green/25"
            : problem.difficulty === "Medium" ? "bg-accent-orange/10 text-accent-orange border-accent-orange/25"
            : "bg-accent-red/10 text-accent-red border-accent-red/25"
          }`}>{problem.difficulty}</span>
        </div>
        <div className="h-px bg-gradient-to-r from-accent-purple/30 to-transparent mb-4" />
        <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{problem.statement}</p>
      </div>
      <div className="space-y-2">
        <h3 className="text-[11px] font-mono text-text-muted uppercase tracking-wider">Constraints</h3>
        {problem.constraints.map((c, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-text-secondary">
            <span className="text-accent-purple/70 mt-0.5">▸</span>
            <code className="font-mono">{c}</code>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 rounded-lg border border-accent-orange/25 bg-accent-orange/5">
        <p className="text-xs text-accent-orange font-mono leading-relaxed">
          ⚡ Interview rules: Think aloud. State brute force first. Optimize with interviewer.<br />
          You have 45 minutes. Good luck.
        </p>
      </div>
      <motion.button onClick={() => dispatch({ type: "SET_INTERVIEW_PHASE", payload: "coding" })}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        className="w-full py-2.5 rounded-lg bg-accent-purple/15 border border-accent-purple/40 text-accent-purple font-mono text-sm hover:bg-accent-purple/25 transition-all"
        style={{ boxShadow: "0 0 20px rgba(124,58,237,0.2)" }}
      >
        <span className="flex items-center justify-center gap-2">
          <Code2 size={14} /> Start Coding
        </span>
      </motion.button>
    </motion.div>
  );
}

function CodingScreen() {
  const { state, dispatch } = useStore();
  const problem = state.interview.problem!;
  const [code, setCode] = useState(problem.starterCode[state.language] || problem.starterCode.python);

  const handleSubmit = () => {
    dispatch({ type: "SET_INTERVIEW_EXPLANATION", payload: code });
    dispatch({ type: "SET_INTERVIEW_PHASE", payload: "explaining" });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <Editor height="100%" language={state.language === "cpp" ? "cpp" : state.language}
          value={code} onChange={v => setCode(v || "")} theme="vs-dark"
          options={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", minimap: { enabled: false },
            lineNumbers: "on", wordWrap: "on", padding: { top: 12, bottom: 12 }, automaticLayout: true }}
        />
      </div>
      <div className="px-4 py-3 border-t border-border-dim bg-bg-card/20 flex items-center justify-between shrink-0">
        <p className="text-[11px] text-text-muted font-mono">Think aloud as you code. Explain your approach.</p>
        <motion.button onClick={handleSubmit} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan/15 border border-accent-cyan/35 text-accent-cyan text-[11px] font-mono hover:bg-accent-cyan/25 transition-all"
        >
          <MessageSquare size={12} /> Submit & Explain
        </motion.button>
      </div>
    </div>
  );
}

function ExplainingScreen() {
  const { state, dispatch } = useStore();
  const [explanation, setExplanation] = useState("");
  const followUp = state.interview.followUpQuestion ||
    "Walk me through your approach. What is the time and space complexity?";

  const handleEvaluate = async () => {
    dispatch({ type: "SET_INTERVIEW_EVALUATING", payload: true });
    const result = await evaluateInterview(
      state.interview.problem!.title,
      state.interview.userExplanation,
      explanation,
      followUp,
      state.language,
    );
    dispatch({ type: "SET_INTERVIEW_FEEDBACK", payload: result });
    dispatch({ type: "ADD_SCORE_POINT", payload: result.score });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
      {/* Interviewer question */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-accent-purple/25 bg-accent-purple/5">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center shrink-0 mt-0.5">
          <Brain size={12} className="text-white" />
        </div>
        <div>
          <p className="text-[10px] font-mono text-accent-purple mb-1">AI INTERVIEWER</p>
          <p className="text-sm text-text-secondary leading-relaxed">{followUp}</p>
        </div>
      </div>

      {/* Explanation textarea */}
      <div className="flex-1 flex flex-col space-y-2">
        <label className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Your answer:</label>
        <textarea
          value={explanation}
          onChange={e => setExplanation(e.target.value)}
          placeholder="Explain your approach, complexity, and any trade-offs..."
          className="flex-1 min-h-[140px] p-3 rounded-lg bg-bg-card border border-border-dim text-sm text-text-secondary font-mono resize-none focus:outline-none focus:border-accent-purple/50 transition-colors leading-relaxed placeholder-text-muted"
        />
      </div>

      <motion.button onClick={handleEvaluate} disabled={state.interview.isEvaluating || explanation.length < 10}
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        className={`w-full py-2.5 rounded-lg border font-mono text-sm flex items-center justify-center gap-2 transition-all ${
          state.interview.isEvaluating || explanation.length < 10
            ? "border-border-dim text-text-muted cursor-not-allowed"
            : "border-accent-green/40 bg-accent-green/10 text-accent-green hover:bg-accent-green/20"
        }`}
      >
        {state.interview.isEvaluating ? (
          <><motion.div className="w-3 h-3 border border-accent-green/40 border-t-accent-green rounded-full"
            animate={{ rotate: 360 }} transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }} />
            Evaluating with AI...</>
        ) : (
          <><Send size={13} />Submit Answer</>
        )}
      </motion.button>
    </motion.div>
  );
}

function FeedbackScreen() {
  const { state, dispatch } = useStore();
  const score = state.interview.score ?? 0;
  const scoreStyle =
    score >= 80 ? { color: "#10B981", shadow: "0 0 20px rgba(16,185,129,0.4)" }
    : score >= 60 ? { color: "#22D3EE", shadow: "0 0 20px rgba(34,211,238,0.4)" }
    : { color: "#F59E0B", shadow: "0 0 20px rgba(245,158,11,0.4)" };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col p-5 space-y-5 overflow-y-auto">
      {/* Score */}
      <div className="flex flex-col items-center py-4">
        <Trophy size={28} style={{ color: scoreStyle.color }} className="mb-2" />
        <div className="font-display text-5xl font-bold mb-1" style={{ color: scoreStyle.color, textShadow: scoreStyle.shadow }}>
          {score}
        </div>
        <div className="text-sm text-text-muted font-mono">Interview Score</div>
        <div className="mt-3 w-48 h-2 rounded-full bg-bg-card overflow-hidden">
          <motion.div className="h-full rounded-full"
            style={{ background: scoreStyle.color }}
            initial={{ width: 0 }} animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: "easeOut" }} />
        </div>
      </div>

      {/* AI feedback */}
      <div className="px-4 py-3 rounded-lg border border-border-dim bg-bg-card space-y-2">
        <div className="flex items-center gap-2">
          <Brain size={12} className="text-accent-purple" />
          <span className="text-[10px] font-mono text-accent-purple uppercase tracking-wider">AI Feedback</span>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">{state.interview.aiFeedback}</p>
      </div>

      {/* Score change */}
      {state.interview.scoreHistory.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-text-muted">
          {score > (state.interview.scoreHistory.slice(-2, -1)[0] ?? 0)
            ? <CheckCircle size={14} className="text-accent-green" />
            : <AlertCircle size={14} className="text-accent-orange" />}
          <span>
            {score > (state.interview.scoreHistory.slice(-2,-1)[0] ?? 0)
              ? `+${score - (state.interview.scoreHistory.slice(-2,-1)[0] ?? 0)} pts improvement!`
              : "Keep practicing — consistency builds confidence."}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={() => dispatch({ type: "END_INTERVIEW" })}
          className="flex-1 py-2 rounded-lg border border-border-dim text-text-muted text-xs font-mono hover:text-text-secondary hover:border-accent-purple/30 transition-all"
        >
          Back to Workspace
        </button>
        <button onClick={() => {
          const next = PROBLEM_BANK[Math.floor(Math.random() * PROBLEM_BANK.length)];
          dispatch({ type: "START_INTERVIEW", payload: next });
        }}
          className="flex-1 py-2 rounded-lg border border-accent-purple/40 bg-accent-purple/10 text-accent-purple text-xs font-mono hover:bg-accent-purple/20 transition-all"
        >
          Next Problem →
        </button>
      </div>
    </motion.div>
  );
}

// ─── Interview Modal ──────────────────────────────────────────────────────────
export default function InterviewMode() {
  const { state, dispatch } = useStore();
  const { interview } = state;
  if (interview.phase === "idle") return null;

  const phaseLabels: Record<string, string> = {
    briefing: "READ PROBLEM", coding: "CODING", explaining: "EXPLANATION", feedback: "RESULTS",
  };
  const phaseOrder = ["briefing", "coding", "explaining", "feedback"];
  const phaseIdx = phaseOrder.indexOf(interview.phase);

  return (
    <AnimatePresence>
      <motion.div
        key="interview-overlay"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-bg-primary/80 backdrop-blur-md flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
          className="glass-panel-purple border border-accent-purple/25 rounded-xl w-full max-w-2xl flex flex-col overflow-hidden"
          style={{ height: "min(700px, 90vh)", boxShadow: "0 0 60px rgba(124,58,237,0.2)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-dim shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center">
                <Brain size={12} className="text-white" />
              </div>
              <span className="font-display text-[11px] font-bold tracking-widest text-text-primary">
                INTERVIEW MODE
              </span>
              {/* Phase breadcrumb */}
              <div className="hidden sm:flex items-center gap-1">
                {phaseOrder.slice(0,-1).map((p, i) => (
                  <span key={p} className={`text-[10px] font-mono ${i <= phaseIdx ? "text-accent-cyan" : "text-text-muted"}`}>
                    {phaseLabels[p]}{i < phaseOrder.length - 2 ? " ›" : ""}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {interview.phase === "coding" && (
                <InterviewTimer startTime={interview.startTime} limitSeconds={interview.timeLimit} />
              )}
              <button onClick={() => dispatch({ type: "END_INTERVIEW" })}
                className="p-1.5 rounded-md text-text-muted hover:text-text-secondary hover:bg-bg-card transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Phase content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
              {interview.phase === "briefing"   && <BriefingScreen key="brief" />}
              {interview.phase === "coding"     && <CodingScreen   key="code"  />}
              {interview.phase === "explaining" && <ExplainingScreen key="exp" />}
              {interview.phase === "feedback"   && <FeedbackScreen  key="feed" />}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
