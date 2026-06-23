import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HintRequest {
  problem_id: string;
  problem_title: string;       // ✅ added
  problem_statement: string;   // ✅ added
  user_code: string;
  hint_level: number;
  topic: string;
  session_id: string;
}

export interface HintResponse {
  hint: string;
  hint_level: number;
  pattern_detected: string;
  complexity_estimate: string;
  weaknesses: string[];
  suggestions: string[];
}

export interface EvalRequest {
  problem_id: string;
  problem_title: string;
  user_code: string;
  language: string;
  session_id: string;
}

export interface EvalResponse {
  time_complexity: string;
  space_complexity: string;
  quality_score: number;
  feedback: string;
  is_brute_force: boolean;
  optimization_hint: string;
}

export interface ProgressResponse {
  session_id: string;
  solved_problems: string[];
  weak_topics: string[];
  interview_score: number;
  streak: number;
  topic_progress: Record<string, number>;
}

export interface GuidanceResponse {
  message: string;
  type: "warning" | "tip" | "encouragement" | "challenge";
  priority: number;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function getHint(req: HintRequest): Promise<HintResponse> {
  const { data } = await api.post<HintResponse>("/chat/hint", req);
  return data;
}

export async function evaluateCode(req: EvalRequest): Promise<EvalResponse> {
  const { data } = await api.post<EvalResponse>("/chat/evaluate", req);
  return data;
}

export async function getProgress(sessionId: string): Promise<ProgressResponse> {
  const { data } = await api.get<ProgressResponse>(`/progress/${sessionId}`);
  return data;
}

export async function getGuidance(sessionId: string): Promise<GuidanceResponse> {
  const { data } = await api.get<GuidanceResponse>(`/analytics/guidance/${sessionId}`);
  return data;
}

export async function runCode(
  code: string,
  language: string,
  testCases: Array<{ input: string; expected: string }>
): Promise<{ results: Array<{ passed: boolean; output: string; expected: string }> }> {
  const { data } = await api.post("/chat/run", { code, language, test_cases: testCases });
  return data;
}
