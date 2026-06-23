"""
Pattern detector: identifies DSA patterns from code using Groq.
"""
import json
from .groq_client import chat_completion

PATTERN_SYSTEM = """You are a DSA pattern recognition expert.

Analyze the provided code and identify which algorithm pattern it uses (or should use).

Common patterns: Two Pointers, Sliding Window, HashMap/Set, Binary Search, BFS, DFS, 
Dynamic Programming, Greedy, Backtracking, Divide & Conquer, Monotonic Stack, Heap/Priority Queue.

Respond in JSON only:
{
  "current_pattern": "pattern name in user's code or 'Brute Force'",
  "optimal_pattern": "recommended pattern name",
  "is_optimal": true/false,
  "explanation": "one sentence why"
}"""


async def detect_pattern(user_code: str, problem_topic: str) -> dict:
    """Detect pattern in user's code."""
    if not user_code.strip() or len(user_code) < 30:
        return {
            "current_pattern": "Not started",
            "optimal_pattern": problem_topic,
            "is_optimal": False,
            "explanation": "Start coding to get pattern analysis.",
        }

    raw = await chat_completion(
        system_prompt=PATTERN_SYSTEM,
        user_message=f"Topic: {problem_topic}\n\nCode:\n```\n{user_code}\n```",
        temperature=0.1,
        max_tokens=256,
    )

    try:
        clean = raw.strip()
        if clean.startswith("```"):
            clean = "\n".join(clean.split("\n")[1:-1])
        return json.loads(clean)
    except json.JSONDecodeError:
        return {
            "current_pattern": "Brute Force",
            "optimal_pattern": problem_topic,
            "is_optimal": False,
            "explanation": "Pattern detection failed. Review your approach.",
        }
