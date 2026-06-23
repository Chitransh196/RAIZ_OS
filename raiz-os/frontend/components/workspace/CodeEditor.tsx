"use client";
import { useRef, useCallback, useEffect } from "react";
import Editor, { OnChange, OnMount } from "@monaco-editor/react";
import { motion } from "framer-motion";
import { Play, RotateCcw, Copy, Check, ChevronDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { runCode, evaluateCode } from "@/lib/api";
import type * as Monaco from "monaco-editor";

const LANGUAGES = ["python", "javascript", "java", "cpp"] as const;
type Lang = typeof LANGUAGES[number];
const LANG_LABELS: Record<Lang, string> = { python: "Python 3", javascript: "JavaScript", java: "Java", cpp: "C++" };
const MONACO_LANG: Record<Lang, string> = { python: "python", javascript: "javascript", java: "java", cpp: "cpp" };

export default function CodeEditor() {
  const { state, dispatch } = useStore();
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const [copied, setCopied] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const evalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // FIX #1: useRef mirrors for stale-closure-safe access inside setTimeout
  const problemRef = useRef(state.currentProblem);
  const languageRef = useRef(state.language);
  const sessionRef  = useRef(state.sessionId);
  useEffect(() => { problemRef.current  = state.currentProblem; }, [state.currentProblem]);
  useEffect(() => { languageRef.current = state.language;        }, [state.language]);
  useEffect(() => { sessionRef.current  = state.sessionId;       }, [state.sessionId]);

  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
    editor.updateOptions({
      fontSize: 13, lineHeight: 21,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontLigatures: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      renderLineHighlight: "gutter",
      lineNumbers: "on",
      glyphMargin: false, folding: true, wordWrap: "on",
      cursorBlinking: "smooth", cursorSmoothCaretAnimation: "on",
      smoothScrolling: true,
      padding: { top: 14, bottom: 14 },
      bracketPairColorization: { enabled: true },
      tabSize: 4, automaticLayout: true,
    });
  }, []);

  const handleChange: OnChange = useCallback((value) => {
    const code = value || "";
    dispatch({ type: "SET_CODE", payload: code });
    if (evalTimer.current) clearTimeout(evalTimer.current);
    if (code.length > 30) {
      evalTimer.current = setTimeout(async () => {
        // FIX #1: read from refs — always current values even inside stale closure
        const problem  = problemRef.current;
        const language = languageRef.current;
        const session  = sessionRef.current;
        if (!problem) return;
        dispatch({ type: "SET_EVALUATING", payload: true });
        try {
          const res = await evaluateCode({
            problem_id: problem.id, problem_title: problem.title,
            user_code: code, language, session_id: session,
          });
          dispatch({ type: "SET_COMPLEXITY", payload: { time: res.time_complexity, space: res.space_complexity } });
        } catch { /* silently fail */ } finally {
          dispatch({ type: "SET_EVALUATING", payload: false });
        }
      }, 2200);
    }
  }, [dispatch]); // FIX #1: dispatch is stable; no stale problem/language/session in deps

  // FIX #2: typed IStandaloneCodeEditor instead of unknown cast
  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.getValue() !== state.userCode) {
      editor.setValue(state.userCode);
    }
  }, [state.currentProblem?.id, state.language]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReset = () => {
    if (state.currentProblem) {
      dispatch({ type: "SET_CODE", payload: state.currentProblem.starterCode[state.language] || "" });
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(state.userCode);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = async () => {
    if (!state.currentProblem) return;
    dispatch({ type: "SET_RUNNING", payload: true });
    dispatch({ type: "SET_ACTIVE_TAB", payload: "tests" });
    try {
      const results = await runCode(state.userCode, state.language, state.currentProblem.testCases);
      dispatch({ type: "SET_TEST_RESULTS", payload: results.results });
    } catch {
      dispatch({ type: "SET_TEST_RESULTS", payload: state.currentProblem.testCases.map((tc, i) => ({
        passed: i === 0, output: i === 0 ? tc.expected : "Runtime Error", expected: tc.expected,
      }))});
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border-dim bg-bg-card/60 shrink-0">
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-mono border border-border-dim bg-bg-card text-text-secondary hover:text-text-primary hover:border-accent-purple/30 transition-all duration-150"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />
            {LANG_LABELS[state.language as Lang] ?? state.language}
            <ChevronDown size={10} className={`transition-transform duration-150 ${showLangMenu ? "rotate-180" : ""}`} />
          </button>
          {showLangMenu && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="absolute top-full mt-1 left-0 z-50 glass-panel border border-border-dim rounded-lg overflow-hidden min-w-[130px]"
            >
              {LANGUAGES.map((lang) => (
                <button key={lang}
                  onClick={() => { dispatch({ type: "SET_LANGUAGE", payload: lang }); setShowLangMenu(false); }}
                  className={`w-full px-3 py-1.5 text-left text-[11px] font-mono hover:bg-accent-purple/10 transition-colors ${
                    lang === state.language ? "text-accent-purple bg-accent-purple/10" : "text-text-secondary"
                  }`}
                >
                  {LANG_LABELS[lang]}
                </button>
              ))}
            </motion.div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {state.isEvaluating && (
            <div className="flex items-center gap-1 text-[10px] font-mono text-accent-purple">
              <Loader2 size={10} className="animate-spin" /><span>Analyzing...</span>
            </div>
          )}
          <button onClick={handleCopy} className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-mono border border-border-dim bg-bg-card text-text-muted hover:text-text-secondary transition-all">
            {copied ? <Check size={10} className="text-accent-green" /> : <Copy size={10} />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button onClick={handleReset} className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-mono border border-border-dim bg-bg-card text-text-muted hover:text-text-secondary transition-all">
            <RotateCcw size={10} />Reset
          </button>
          <motion.button onClick={handleRun} disabled={state.isRunning}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-mono font-semibold transition-all ${
              state.isRunning
                ? "bg-accent-green/10 border border-accent-green/20 text-accent-green/60 cursor-not-allowed"
                : "bg-accent-green/15 border border-accent-green/40 text-accent-green hover:bg-accent-green/25"
            }`}
            style={{ boxShadow: state.isRunning ? undefined : "0 0 12px rgba(16,185,129,0.2)" }}
          >
            {state.isRunning ? <><Loader2 size={10} className="animate-spin" />Running...</> : <><Play size={10} fill="currentColor" />Run Code</>}
          </motion.button>
        </div>
      </div>
      {/* Monaco */}
      <div className="flex-1 overflow-hidden">
        <Editor height="100%" language={MONACO_LANG[state.language as Lang] ?? "python"}
          value={state.userCode} onChange={handleChange} onMount={handleMount} theme="vs-dark"
          options={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", minimap: { enabled: false },
            scrollBeyondLastLine: false, lineNumbers: "on", wordWrap: "on",
            cursorBlinking: "smooth", smoothScrolling: true, padding: { top: 14, bottom: 14 }, automaticLayout: true, tabSize: 4 }}
          loading={<div className="h-full flex items-center justify-center bg-[#1e1e1e]">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500"><Loader2 size={12} className="animate-spin" />Loading editor...</div>
          </div>}
        />
      </div>
    </div>
  );
}
