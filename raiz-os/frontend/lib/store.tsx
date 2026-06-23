"use client";
import { createContext, useContext, useReducer, ReactNode } from "react";

export interface Problem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic: string;
  statement: string;
  constraints: string[];
  examples: Array<{ input: string; output: string; explanation?: string }>;
  testCases: Array<{ input: string; expected: string }>;
  starterCode: Record<string, string>;
}

export interface TopicProgress {
  name: string;
  progress: number;
  confidence: "Low" | "Medium" | "High";
  solved: number;
  total: number;
}

export interface AppState {
  sessionId: string;
  currentProblem: Problem | null;
  userCode: string;
  language: string;
  hintLevel: number;
  currentHint: string;
  patternDetected: string;
  weaknesses: string[];
  suggestions: string[];
  complexityEstimate: { time: string; space: string };
  interviewScore: number;
  streak: number;
  topicProgress: TopicProgress[];
  focusMode: boolean;
  isEvaluating: boolean;
  isGettingHint: boolean;
  testResults: Array<{ passed: boolean; output: string; expected: string }> | null;
  guidanceMessage: string;
  guidanceType: "warning" | "tip" | "encouragement" | "challenge";
  isRunning: boolean;
  activeTab: "problem" | "code" | "tests" | "visualize";
  // Phase 2
  interview: InterviewSession;
  analytics: AnalyticsState;
}

// ─── Problem Bank ─────────────────────────────────────────────────────────────

export const PROBLEM_BANK: Problem[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Arrays",
    statement: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.`,
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹",
      "-10⁹ ≤ target ≤ 10⁹",
      "Only one valid answer exists",
    ],
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] = 2 + 7 = 9" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    ],
    testCases: [
      { input: "[2,7,11,15], 9", expected: "[0,1]" },
      { input: "[3,2,4], 6", expected: "[1,2]" },
      { input: "[3,3], 6", expected: "[0,1]" },
    ],
    starterCode: {
      python: `def twoSum(nums: list[int], target: int) -> list[int]:\n    # Your solution here\n    pass`,
      javascript: `function twoSum(nums, target) {\n    // Your solution here\n};`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your solution here\n        return new int[]{};\n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your solution here\n        return {};\n    }\n};`,
    },
  },
  {
    id: "longest-substring",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    topic: "Sliding Window",
    statement: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    constraints: [
      "0 ≤ s.length ≤ 5 × 10⁴",
      "s consists of English letters, digits, symbols and spaces",
    ],
    examples: [
      { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: "1", explanation: 'The answer is "b", with the length of 1.' },
    ],
    testCases: [
      { input: '"abcabcbb"', expected: "3" },
      { input: '"bbbbb"', expected: "1" },
      { input: '"pwwkew"', expected: "3" },
    ],
    starterCode: {
      python: `def lengthOfLongestSubstring(s: str) -> int:\n    # Your solution here\n    pass`,
      javascript: `function lengthOfLongestSubstring(s) {\n    // Your solution here\n};`,
      java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Your solution here\n        return 0;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Your solution here\n        return 0;\n    }\n};`,
    },
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    topic: "Stacks",
    statement: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.`,
    constraints: [
      "1 ≤ s.length ≤ 10⁴",
      "s consists of parentheses only '()[]{}'",
    ],
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    testCases: [
      { input: '"()"', expected: "true" },
      { input: '"()[]{}"', expected: "true" },
      { input: '"(]"', expected: "false" },
    ],
    starterCode: {
      python: `def isValid(s: str) -> bool:\n    # Your solution here\n    pass`,
      javascript: `function isValid(s) {\n    // Your solution here\n};`,
      java: `class Solution {\n    public boolean isValid(String s) {\n        // Your solution here\n        return false;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    bool isValid(string s) {\n        // Your solution here\n        return false;\n    }\n};`,
    },
  },
  {
    id: "max-subarray",
    title: "Maximum Subarray",
    difficulty: "Medium",
    topic: "Dynamic Programming",
    statement: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.\n\nThis is the classic **Kadane's Algorithm** problem.`,
    constraints: [
      "1 ≤ nums.length ≤ 10⁵",
      "-10⁴ ≤ nums[i] ≤ 10⁴",
    ],
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6." },
      { input: "nums = [1]", output: "1" },
    ],
    testCases: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", expected: "6" },
      { input: "[1]", expected: "1" },
      { input: "[5,4,-1,7,8]", expected: "23" },
    ],
    starterCode: {
      python: `def maxSubArray(nums: list[int]) -> int:\n    # Your solution here\n    pass`,
      javascript: `function maxSubArray(nums) {\n    // Your solution here\n};`,
      java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        // Your solution here\n        return 0;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Your solution here\n        return 0;\n    }\n};`,
    },
  },
  {
    id: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    topic: "Dynamic Programming",
    statement: `You are climbing a staircase. It takes \`n\` steps to reach the top.\n\nEach time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
    constraints: ["1 ≤ n ≤ 45"],
    examples: [
      { input: "n = 2", output: "2", explanation: "1+1 or 2" },
      { input: "n = 3", output: "3", explanation: "1+1+1, 1+2, or 2+1" },
    ],
    testCases: [
      { input: "2", expected: "2" },
      { input: "3", expected: "3" },
      { input: "10", expected: "89" },
    ],
    starterCode: {
      python: `def climbStairs(n: int) -> int:\n    # Your solution here\n    pass`,
      javascript: `function climbStairs(n) {\n    // Your solution here\n};`,
      java: `class Solution {\n    public int climbStairs(int n) {\n        // Your solution here\n        return 0;\n    }\n}`,
      cpp: `class Solution {\npublic:\n    int climbStairs(int n) {\n        // Your solution here\n        return 0;\n    }\n};`,
    },
  },
];

const defaultTopics: TopicProgress[] = [
  { name: "Arrays",             progress: 42, confidence: "Medium", solved: 8,  total: 19 },
  { name: "HashMap",            progress: 35, confidence: "Medium", solved: 5,  total: 14 },
  { name: "Sliding Window",     progress: 20, confidence: "Low",    solved: 2,  total: 10 },
  { name: "Two Pointers",       progress: 60, confidence: "High",   solved: 6,  total: 10 },
  { name: "Binary Search",      progress: 30, confidence: "Low",    solved: 3,  total: 10 },
  { name: "Dynamic Programming",progress: 10, confidence: "Low",    solved: 2,  total: 20 },
  { name: "Trees",              progress: 25, confidence: "Low",    solved: 3,  total: 12 },
  { name: "Graphs",             progress: 5,  confidence: "Low",    solved: 1,  total: 15 },
  { name: "Greedy",             progress: 45, confidence: "Medium", solved: 4,  total: 9  },
  { name: "Backtracking",       progress: 15, confidence: "Low",    solved: 1,  total: 8  },
  { name: "Stacks",             progress: 50, confidence: "Medium", solved: 4,  total: 8  },
];

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const firstProblem = PROBLEM_BANK[0];

const initialState: AppState = {
  sessionId: generateSessionId(),
  currentProblem: firstProblem,
  userCode: firstProblem.starterCode.python,
  language: "python",
  hintLevel: 0,
  currentHint: "",
  patternDetected: "HashMap Lookup",
  weaknesses: ["Nested loops (brute force tendency)", "Missing edge cases"],
  suggestions: ["Consider HashMap for O(n) solution", "Think about complement: target - nums[i]"],
  complexityEstimate: { time: "O(n²)", space: "O(1)" },
  interviewScore: 67,
  streak: 3,
  topicProgress: defaultTopics,
  focusMode: false,
  isEvaluating: false,
  isGettingHint: false,
  testResults: null,
  guidanceMessage: "You've solved 3 Array problems today. Try using HashMap to avoid nested loops.",
  guidanceType: "tip",
  isRunning: false,
  activeTab: "problem",
  // Phase 2 initial state
  interview: {
    phase: "idle",
    problem: null,
    startTime: null,
    timeLimit: 45 * 60,
    userCode: "",
    userExplanation: "",
    followUpQuestion: "",
    aiFeedback: "",
    score: null,
    scoreHistory: [45, 52, 58, 67],
    isEvaluating: false,
  },
  analytics: {
    totalTimeMs: 0,
    problemsAttempted: ["two-sum"],
    hintUsageByLevel: { 1: 3, 2: 2, 3: 1, 4: 0, 5: 0 },
    bruteForceCount: 3,
    optimalCount: 5,
    scoreHistory: [
      { date: "Mon", score: 45 },
      { date: "Tue", score: 52 },
      { date: "Wed", score: 58 },
      { date: "Thu", score: 62 },
      { date: "Fri", score: 67 },
    ],
  },
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "SET_CODE"; payload: string }
  | { type: "SET_LANGUAGE"; payload: string }
  | { type: "SET_ACTIVE_TAB"; payload: AppState["activeTab"] }
  | { type: "SET_HINT"; payload: { hint: string; level: number; pattern: string; weaknesses: string[]; suggestions: string[]; time: string; space: string } }
  | { type: "INCREMENT_HINT_LEVEL" }
  | { type: "SET_EVALUATING"; payload: boolean }
  | { type: "SET_GETTING_HINT"; payload: boolean }
  | { type: "SET_RUNNING"; payload: boolean }
  | { type: "SET_TEST_RESULTS"; payload: Array<{ passed: boolean; output: string; expected: string }> }
  | { type: "SET_GUIDANCE"; payload: { message: string; type: AppState["guidanceType"] } }
  | { type: "TOGGLE_FOCUS_MODE" }
  | { type: "SET_PROBLEM"; payload: Problem }
  | { type: "RESET_HINT_LEVEL" }
  | { type: "SET_INTERVIEW_SCORE"; payload: number }
  | { type: "SET_COMPLEXITY"; payload: { time: string; space: string } }
  // Phase 2 actions
  | { type: "START_INTERVIEW"; payload: Problem }
  | { type: "SET_INTERVIEW_PHASE"; payload: InterviewPhase }
  | { type: "SET_INTERVIEW_EXPLANATION"; payload: string }
  | { type: "SET_INTERVIEW_FOLLOW_UP"; payload: string }
  | { type: "SET_INTERVIEW_FEEDBACK"; payload: { feedback: string; score: number } }
  | { type: "SET_INTERVIEW_EVALUATING"; payload: boolean }
  | { type: "END_INTERVIEW" }
  | { type: "RECORD_HINT_USAGE"; payload: number }
  | { type: "RECORD_BRUTE_FORCE" }
  | { type: "RECORD_OPTIMAL" }
  | { type: "ADD_SCORE_POINT"; payload: number };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_CODE": return { ...state, userCode: action.payload };
    case "SET_ACTIVE_TAB": return { ...state, activeTab: action.payload };
    case "SET_LANGUAGE":
      return {
        ...state,
        language: action.payload,
        userCode: state.currentProblem?.starterCode[action.payload] || state.userCode,
      };
    case "SET_HINT":
      return {
        ...state,
        currentHint: action.payload.hint,
        hintLevel: action.payload.level,
        patternDetected: action.payload.pattern || state.patternDetected,
        weaknesses: action.payload.weaknesses.length ? action.payload.weaknesses : state.weaknesses,
        suggestions: action.payload.suggestions.length ? action.payload.suggestions : state.suggestions,
        complexityEstimate: {
          time: action.payload.time || state.complexityEstimate.time,
          space: action.payload.space || state.complexityEstimate.space,
        },
        isGettingHint: false,
      };
    case "SET_COMPLEXITY":
      return { ...state, complexityEstimate: action.payload };
    case "INCREMENT_HINT_LEVEL":
      return { ...state, hintLevel: Math.min(state.hintLevel + 1, 5) };
    case "SET_EVALUATING": return { ...state, isEvaluating: action.payload };
    case "SET_GETTING_HINT": return { ...state, isGettingHint: action.payload };
    case "SET_RUNNING": return { ...state, isRunning: action.payload };
    case "SET_TEST_RESULTS": return { ...state, testResults: action.payload, isRunning: false };
    case "SET_GUIDANCE": return { ...state, guidanceMessage: action.payload.message, guidanceType: action.payload.type };
    case "TOGGLE_FOCUS_MODE": return { ...state, focusMode: !state.focusMode };
    case "SET_INTERVIEW_SCORE": return { ...state, interviewScore: action.payload };
    case "SET_PROBLEM":
      return {
        ...state,
        currentProblem: action.payload,
        userCode: action.payload.starterCode[state.language] || action.payload.starterCode.python,
        hintLevel: 0,
        currentHint: "",
        testResults: null,
        activeTab: "problem",
        complexityEstimate: { time: "—", space: "—" },
      };
    case "RESET_HINT_LEVEL": return { ...state, hintLevel: 0, currentHint: "" };
    case "START_INTERVIEW":
      return {
        ...state,
        interview: {
          ...state.interview,
          phase: "briefing",
          problem: action.payload,
          startTime: null,
          userCode: action.payload.starterCode[state.language] || action.payload.starterCode.python,
          userExplanation: "",
          followUpQuestion: "",
          aiFeedback: "",
          score: null,
          isEvaluating: false,
        },
      };
    case "SET_INTERVIEW_PHASE":
      return {
        ...state,
        interview: {
          ...state.interview,
          phase: action.payload,
          startTime: action.payload === "coding" && !state.interview.startTime ? Date.now() : state.interview.startTime,
        },
      };
    case "SET_INTERVIEW_EXPLANATION":
      return { ...state, interview: { ...state.interview, userExplanation: action.payload } };
    case "SET_INTERVIEW_FOLLOW_UP":
      return { ...state, interview: { ...state.interview, followUpQuestion: action.payload } };
    case "SET_INTERVIEW_FEEDBACK":
      return {
        ...state,
        interviewScore: action.payload.score,
        interview: { ...state.interview, aiFeedback: action.payload.feedback, score: action.payload.score, phase: "feedback", isEvaluating: false },
      };
    case "SET_INTERVIEW_EVALUATING":
      return { ...state, interview: { ...state.interview, isEvaluating: action.payload } };
    case "END_INTERVIEW":
      return {
        ...state,
        interview: { ...state.interview, phase: "idle" },
      };
    case "RECORD_HINT_USAGE": {
      const usage = { ...state.analytics.hintUsageByLevel };
      usage[action.payload] = (usage[action.payload] || 0) + 1;
      return { ...state, analytics: { ...state.analytics, hintUsageByLevel: usage } };
    }
    case "RECORD_BRUTE_FORCE":
      return { ...state, analytics: { ...state.analytics, bruteForceCount: state.analytics.bruteForceCount + 1 } };
    case "RECORD_OPTIMAL":
      return { ...state, analytics: { ...state.analytics, optimalCount: state.analytics.optimalCount + 1 } };
    case "ADD_SCORE_POINT": {
      const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      const day = days[new Date().getDay()];
      const history = [...state.analytics.scoreHistory, { date: day, score: action.payload }].slice(-7);
      return { ...state, analytics: { ...state.analytics, scoreHistory: history } };
    }
    default: return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const StoreContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

// ─── Phase 2 Types ────────────────────────────────────────────────────────────

export type InterviewPhase = "idle" | "briefing" | "coding" | "explaining" | "feedback";

export interface InterviewSession {
  phase: InterviewPhase;
  problem: Problem | null;
  startTime: number | null;       // epoch ms
  timeLimit: number;              // seconds
  userCode: string;
  userExplanation: string;
  followUpQuestion: string;
  aiFeedback: string;
  score: number | null;
  scoreHistory: number[];
  isEvaluating: boolean;
}

export interface ScorePoint { date: string; score: number; }

export interface AnalyticsState {
  totalTimeMs: number;
  problemsAttempted: string[];
  hintUsageByLevel: Record<number, number>; // level → count
  bruteForceCount: number;
  optimalCount: number;
  scoreHistory: ScorePoint[];
}
