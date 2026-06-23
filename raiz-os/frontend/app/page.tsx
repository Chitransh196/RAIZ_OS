"use client";
import { motion, AnimatePresence } from "framer-motion";
import { StoreProvider, useStore } from "@/lib/store";
import TopBar from "@/components/topbar/TopBar";
import LearningMap from "@/components/learning-map/LearningMap";
import ProblemPanel from "@/components/workspace/ProblemPanel";
import MentorBrain from "@/components/mentor/MentorBrain";
import GuidanceLayer from "@/components/guidance/GuidanceLayer";
import InterviewMode from "@/components/interview/InterviewMode";

function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none select-none" aria-hidden>
      <div className="absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(124,58,237,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.025) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-accent-purple/5 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-accent-cyan/4 blur-3xl" />
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.04) 0%, transparent 70%)" }}
      />
    </div>
  );
}

function WorkspaceLayout() {
  const { state } = useStore();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg-primary relative">
      <Background />
      <TopBar />

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Left — Learning Map */}
        <AnimatePresence initial={false}>
          {!state.focusMode && (
            <motion.div key="map"
              initial={{ width: 0, opacity: 0 }} animate={{ width: 224, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden shrink-0 h-full" style={{ minWidth: 0 }}
            >
              <div className="w-56 h-full"><LearningMap /></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center — Problem workspace */}
        <ProblemPanel />

        {/* Right — Mentor Brain */}
        <AnimatePresence initial={false}>
          {!state.focusMode && (
            <motion.div key="brain"
              initial={{ width: 0, opacity: 0 }} animate={{ width: 240, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden shrink-0 h-full" style={{ minWidth: 0 }}
            >
              <div className="w-60 h-full"><MentorBrain /></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <GuidanceLayer />

      {/* Phase 2: Interview mode modal overlay — mounted here so it's above everything */}
      <InterviewMode />
    </div>
  );
}

export default function Home() {
  return (
    <StoreProvider>
      <WorkspaceLayout />
    </StoreProvider>
  );
}
