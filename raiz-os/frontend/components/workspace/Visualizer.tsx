"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useRef } from "react";
import { Play, Pause, RotateCcw, SkipForward, SkipBack, ChevronDown } from "lucide-react";
import { useStore } from "@/lib/store";

// ─── Algorithm definitions (all data at module level — zero re-creation) ──────

interface VizStep { label: string; highlight: number[]; secondary?: number[]; extra?: Record<string, unknown> }

const ALGORITHMS = {
  "HashMap: Two Sum": {
    topic: "Arrays",
    description: "Find two indices that sum to target using one-pass HashMap.",
    complexity: { time: "O(n)", space: "O(n)" },
    input: [2, 7, 11, 15],
    target: 9,
    steps: [
      { label: "Start: seen={}, i=0, val=2, complement=9-2=7", highlight: [0], secondary: [], extra: { seen: {} } },
      { label: "7 not in seen → store seen[2]=0, advance", highlight: [0], secondary: [], extra: { seen: { 2: 0 } } },
      { label: "i=1, val=7, complement=9-7=2", highlight: [1], secondary: [], extra: { seen: { 2: 0 } } },
      { label: "2 IS in seen[0] → return [0, 1] ✓", highlight: [0, 1], secondary: [], extra: { seen: { 2: 0 }, found: true } },
    ] as VizStep[],
  },
  "Sliding Window": {
    topic: "Sliding Window",
    description: "Find the longest substring without repeating characters.",
    complexity: { time: "O(n)", space: "O(k)" },
    input: "abcabcbb".split(""),
    target: null,
    steps: [
      { label: 'left=0, right=0, window="a", seen={a:0}', highlight: [0], secondary: [0] },
      { label: 'right=1, window="ab", seen={a:0,b:1}', highlight: [0,1], secondary: [0,1] },
      { label: 'right=2, window="abc", max_len=3', highlight: [0,1,2], secondary: [0,1,2] },
      { label: 'right=3, "a" in seen → shrink: left=1', highlight: [1,2,3], secondary: [1,2,3], extra: { shrink: true } },
      { label: 'right=4, "b" in seen → shrink: left=2', highlight: [2,3,4], secondary: [2,3,4], extra: { shrink: true } },
      { label: 'right=5, "c" in seen → shrink: left=3', highlight: [3,4,5], secondary: [3,4,5], extra: { shrink: true } },
      { label: 'right=6, window="bcb"  max_len still 3', highlight: [3,4,5,6], secondary: [3,4,5] },
      { label: 'Done: max_len = 3 ("abc") ✓', highlight: [0,1,2], secondary: [0,1,2], extra: { done: true } },
    ] as VizStep[],
  },
  "Binary Search": {
    topic: "Binary Search",
    description: "Search a sorted array in O(log n) by halving the search space.",
    complexity: { time: "O(log n)", space: "O(1)" },
    input: [1, 3, 5, 7, 9, 11, 13, 15],
    target: 7,
    steps: [
      { label: "lo=0, hi=7, mid=3, arr[3]=7 == target ✓", highlight: [3], secondary: [0, 7], extra: { found: true } },
    ] as VizStep[]  },
  "BFS Traversal": {
    topic: "Graphs",
    description: "Breadth-first search processes nodes level by level using a queue.",
    complexity: { time: "O(V+E)", space: "O(V)" },
    input: null,
    target: null,
    // Graph: 0→[1,2], 1→[3,4], 2→[5]
    nodes: [
      { id: 0, x: 160, y: 30,  label: "0" },
      { id: 1, x: 80,  y: 90,  label: "1" },
      { id: 2, x: 240, y: 90,  label: "2" },
      { id: 3, x: 40,  y: 150, label: "3" },
      { id: 4, x: 120, y: 150, label: "4" },
      { id: 5, x: 240, y: 150, label: "5" },
    ],
    edges: [[0,1],[0,2],[1,3],[1,4],[2,5]],
    steps: [
      { label: "Start: queue=[0], visited={0}", highlight: [0], secondary: [] },
      { label: "Process 0 → enqueue neighbors 1,2. queue=[1,2]", highlight: [1,2], secondary: [0] },
      { label: "Process 1 → enqueue neighbors 3,4. queue=[2,3,4]", highlight: [3,4], secondary: [0,1] },
      { label: "Process 2 → enqueue neighbor 5. queue=[3,4,5]", highlight: [5], secondary: [0,1,2] },
      { label: "Process 3 → no new neighbors. queue=[4,5]", highlight: [3], secondary: [0,1,2,3] },
      { label: "Process 4,5 → done. BFS order: 0,1,2,3,4,5 ✓", highlight: [0,1,2,3,4,5], secondary: [], extra: { done: true } },
    ] as VizStep[],
  },
  "Two Pointers": {
    topic: "Two Pointers",
    description: "Use left/right pointers on sorted array to find pairs summing to target.",
    complexity: { time: "O(n)", space: "O(1)" },
    input: [1, 3, 5, 8, 11, 15],
    target: 16,
    steps: [
      { label: "left=0(1), right=5(15), sum=16==target ✓", highlight: [0, 5], secondary: [], extra: { found: true } },
    ] as VizStep[]  },
} as const;

type AlgoKey = keyof typeof ALGORITHMS;
const ALGO_KEYS = Object.keys(ALGORITHMS) as AlgoKey[];

// ─── Sub-renderers ────────────────────────────────────────────────────────────

function ArrayViz({ arr, step, algo }: { arr: (number|string)[]; step: VizStep; algo: AlgoKey }) {
  const isDone = !!(step.extra as Record<string,unknown>)?.done;
  const isFound = !!(step.extra as Record<string,unknown>)?.found;
  return (
    <div className="flex flex-wrap gap-1.5 justify-center my-3">
      {arr.map((v, i) => {
        const active   = step.highlight.includes(i);
        const visited  = step.secondary?.includes(i);
        return (
          <motion.div key={i}
            animate={{ scale: active ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
            className={`relative w-10 h-10 rounded-md border flex items-center justify-center font-mono text-sm font-bold transition-all duration-300 ${
              active && (isDone || isFound) ? "border-accent-green bg-accent-green/20 text-accent-green"
              : active ? "border-accent-cyan bg-accent-cyan/10 text-accent-cyan"
              : visited ? "border-accent-purple/40 bg-accent-purple/5 text-accent-purple"
              : "border-border-dim bg-bg-card text-text-secondary"
            }`}
          >
            {v}
            <span className="absolute -bottom-4 left-0 right-0 text-center text-[9px] text-text-muted">{i}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

function BFSViz({ step }: { step: VizStep }) {
  const algo = ALGORITHMS["BFS Traversal"];
  const isDone = !!(step.extra as Record<string,unknown>)?.done;
  return (
    <div className="relative mx-auto" style={{ width: 320, height: 190 }}>
      <svg className="absolute inset-0 w-full h-full">
        {algo.edges.map(([a,b], i) => {
          const na = algo.nodes[a], nb = algo.nodes[b];
          return <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke="#1E293B" strokeWidth="2" />;
        })}
      </svg>
      {algo.nodes.map((node) => {
        const active   = step.highlight.includes(node.id);
        const visited  = step.secondary?.includes(node.id);
        return (
          <motion.div key={node.id}
            className={`absolute w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
              active && isDone ? "border-accent-green bg-accent-green/20 text-accent-green"
              : active ? "border-accent-cyan bg-accent-cyan/15 text-accent-cyan"
              : visited ? "border-accent-purple/50 bg-accent-purple/10 text-accent-purple"
              : "border-border-dim bg-bg-card text-text-muted"
            }`}
            style={{ left: node.x - 16, top: node.y - 16 }}
            animate={{ scale: active ? 1.15 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {node.label}
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Main Visualizer ──────────────────────────────────────────────────────────

export default function Visualizer() {
  const { state } = useStore();
  const [algoKey, setAlgoKey] = useState<AlgoKey>("HashMap: Two Sum");
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1200);
  const [showPicker, setShowPicker] = useState(false);
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const algo  = ALGORITHMS[algoKey];
  const steps = algo.steps as VizStep[];
  const current = steps[Math.min(stepIdx, steps.length - 1)];
  const isDone = stepIdx >= steps.length - 1;

  const stop = useCallback(() => {
    if (playRef.current) { clearInterval(playRef.current); playRef.current = null; }
    setPlaying(false);
  }, []);

  const play = useCallback(() => {
    if (isDone) { setStepIdx(0); }
    setPlaying(true);
    playRef.current = setInterval(() => {
      setStepIdx(prev => {
        if (prev >= steps.length - 1) { stop(); return prev; }
        return prev + 1;
      });
    }, speed);
  }, [isDone, steps.length, speed, stop]);

  const reset = useCallback(() => { stop(); setStepIdx(0); }, [stop]);

  const switchAlgo = (key: AlgoKey) => { stop(); setAlgoKey(key); setStepIdx(0); setShowPicker(false); };

  // Auto-switch algo to match current problem topic
  const topic = state.currentProblem?.topic;
  const matchingAlgo = ALGO_KEYS.find(k => ALGORITHMS[k].topic === topic);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-dim bg-bg-card/30 shrink-0">
        <div className="flex items-center gap-2">
          {/* Algorithm picker */}
          <div className="relative">
            <button onClick={() => setShowPicker(!showPicker)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-mono border border-border-dim bg-bg-card text-text-secondary hover:border-accent-purple/30 hover:text-text-primary transition-all"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent-purple" />
              {algoKey}
              <ChevronDown size={10} className={`transition-transform ${showPicker ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {showPicker && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full mt-1 left-0 z-50 glass-panel border border-border-dim rounded-lg overflow-hidden min-w-[200px]"
                >
                  {ALGO_KEYS.map(k => (
                    <button key={k} onClick={() => switchAlgo(k)}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between gap-3 text-[11px] font-mono hover:bg-bg-card transition-colors ${
                        k === algoKey ? "text-accent-purple bg-accent-purple/10" : "text-text-secondary"
                      }`}
                    >
                      <span>{k}</span>
                      {k === matchingAlgo && <span className="text-[9px] text-accent-cyan border border-accent-cyan/30 px-1 rounded">current</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Complexity badges */}
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-accent-green/25 bg-accent-green/5 text-accent-green">
            {algo.complexity.time}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-accent-cyan/25 bg-accent-cyan/5 text-accent-cyan">
            {algo.complexity.space}
          </span>
        </div>
        {/* Speed */}
        <select value={speed} onChange={e => setSpeed(Number(e.target.value))}
          className="text-[10px] font-mono bg-bg-card border border-border-dim text-text-muted rounded px-1.5 py-1 focus:outline-none"
        >
          <option value={2000}>0.5×</option>
          <option value={1200}>1×</option>
          <option value={700}>2×</option>
          <option value={300}>4×</option>
        </select>
      </div>

      {/* Visualization area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Description */}
        <p className="text-[11px] text-text-muted leading-relaxed">{String(algo.description)}</p>

        {/* Visual */}
        <div className="min-h-[140px] flex items-center justify-center">
          {algoKey === "BFS Traversal" ? (
            <BFSViz step={current} />
          ) : (
            <ArrayViz
              arr={(algo.input as (number|string)[]) ?? []}
              step={current}
              algo={algoKey}
            />
          )}
        </div>

        {/* HashMap state (Two Sum only) */}
        {algoKey === "HashMap: Two Sum" && (current.extra as Record<string,unknown>)?.seen && (
          <div className="px-3 py-2 rounded-lg bg-bg-card border border-border-dim">
            <span className="text-[10px] font-mono text-text-muted">HashMap: </span>
            {Object.entries((current.extra as Record<string,unknown>).seen as Record<string,number>).length === 0
              ? <span className="text-[11px] font-mono text-text-muted">empty</span>
              : Object.entries((current.extra as Record<string,unknown>).seen as Record<string,number>).map(([k,v]) => (
                <motion.span key={k} initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="inline-block mx-0.5 px-1.5 py-0.5 rounded bg-accent-purple/10 border border-accent-purple/30 text-accent-purple text-[10px] font-mono"
                >
                  {k}→{String(v)}
                </motion.span>
              ))
            }
          </div>
        )}

        {/* Step label */}
        <AnimatePresence mode="wait">
          <motion.div key={stepIdx}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`px-3 py-2 rounded-lg border text-[11px] font-mono leading-relaxed ${
              (current.extra as Record<string,unknown>)?.done || (current.extra as Record<string,unknown>)?.found
                ? "border-accent-green/30 bg-accent-green/5 text-accent-green"
                : (current.extra as Record<string,unknown>)?.shrink
                ? "border-accent-orange/30 bg-accent-orange/5 text-accent-orange"
                : "border-accent-cyan/30 bg-accent-cyan/5 text-accent-cyan"
            }`}
          >
            {current.label}
          </motion.div>
        </AnimatePresence>

        {/* Step progress bar */}
        <div className="h-1 rounded-full bg-bg-card overflow-hidden">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-accent-purple to-accent-cyan"
            animate={{ width: `${((stepIdx + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-border-dim bg-bg-card/20 shrink-0">
        <div className="flex items-center gap-1">
          <button onClick={reset} className="p-1.5 rounded-md hover:bg-bg-card text-text-muted hover:text-text-secondary transition-colors">
            <RotateCcw size={13} />
          </button>
          <button onClick={() => setStepIdx(s => Math.max(0, s - 1))} disabled={stepIdx === 0}
            className="p-1.5 rounded-md hover:bg-bg-card text-text-muted hover:text-text-secondary transition-colors disabled:opacity-30"
          >
            <SkipBack size={13} />
          </button>
          <motion.button onClick={playing ? stop : play} whileTap={{ scale: 0.9 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent-purple/15 border border-accent-purple/35 text-accent-purple text-[11px] font-mono hover:bg-accent-purple/25 transition-all"
            style={{ boxShadow: "0 0 10px rgba(124,58,237,0.2)" }}
          >
            {playing ? <Pause size={11} /> : <Play size={11} fill="currentColor" />}
            {playing ? "Pause" : isDone ? "Replay" : "Play"}
          </motion.button>
          <button onClick={() => setStepIdx(s => Math.min(steps.length - 1, s + 1))} disabled={isDone}
            className="p-1.5 rounded-md hover:bg-bg-card text-text-muted hover:text-text-secondary transition-colors disabled:opacity-30"
          >
            <SkipForward size={13} />
          </button>
        </div>
        <span className="text-[10px] font-mono text-text-muted">
          Step {stepIdx + 1} / {steps.length}
        </span>
      </div>
    </div>
  );
}
