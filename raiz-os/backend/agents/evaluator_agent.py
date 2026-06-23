"""
Evaluator Agent: evaluates code quality, complexity, and brute-force detection.
"""
import json
from llm.groq_client import chat_completion
from llm.prompts import EVALUATOR_SYSTEM


async def evaluate_code(
    problem_title: str,
    user_code: str,
    language: str,
) -> dict:
    """Evaluate user code and return structured feedback."""
    if not user_code.strip() or len(user_code) < 10:
        return {
            "time_complexity": "N/A",
            "space_complexity": "N/A",
            "quality_score": 0,
            "feedback": "No code to evaluate.",
            "is_brute_force": False,
            "optimization_hint": "",
        }

    raw = await chat_completion(
        system_prompt=EVALUATOR_SYSTEM,
        user_message=f"Language: {language}\nProblem: {problem_title}\n\nCode:\n```{language}\n{user_code}\n```",
        temperature=0.1,
        max_tokens=512,
    )

    try:
        clean = raw.strip()
        if clean.startswith("```"):
            clean = "\n".join(clean.split("\n")[1:-1])
        return json.loads(clean)
    except json.JSONDecodeError:
        return {
            "time_complexity": "Unable to determine",
            "space_complexity": "Unable to determine",
            "quality_score": 50,
            "feedback": raw[:200] if raw else "Evaluation failed.",
            "is_brute_force": False,
            "optimization_hint": "",
        }
