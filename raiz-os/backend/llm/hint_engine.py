"""
Hint engine: generates progressive hints using Groq + prompts.
"""
import json
from .groq_client import chat_completion
from .prompts import HINT_SYSTEM


async def generate_hint(
    problem_title: str,
    problem_statement: str,
    user_code: str,
    hint_level: int,
    topic: str,
) -> dict:
    """Generate a progressive hint for the given problem and code."""

    user_message = f"""Problem: {problem_title}
Topic: {topic}
Hint Level Requested: {hint_level}

Problem Statement:
{problem_statement}

User's Current Code:
```
{user_code}
```

Generate hint level {hint_level} for this specific code and problem."""

    raw = await chat_completion(
        system_prompt=HINT_SYSTEM,
        user_message=user_message,
        temperature=0.2,
        max_tokens=512,
    )

    # Parse JSON response
    try:
        # Strip markdown if present
        clean = raw.strip()
        if clean.startswith("```"):
            clean = "\n".join(clean.split("\n")[1:-1])
        return json.loads(clean)
    except json.JSONDecodeError:
        # Fallback structure
        return {
            "hint": raw.strip(),
            "pattern_detected": topic,
            "complexity_estimate": "O(n²)",
            "weaknesses": ["Unable to analyze code automatically"],
            "suggestions": ["Review the problem constraints carefully"],
        }
