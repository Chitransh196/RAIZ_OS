"""
Guidance engine: generates proactive mentor messages based on session behavior.
"""
import json
from llm.groq_client import chat_completion
from llm.prompts import GUIDANCE_SYSTEM
from .session_store import get_session


STATIC_GUIDANCE = [
    {"message": "You used nested loops again. Try HashMap for O(n) lookup.", "type": "warning", "priority": 5},
    {"message": "Great streak! Consistency beats intensity in DSA prep.", "type": "encouragement", "priority": 3},
    {"message": "Tip: state your approach in plain English before coding.", "type": "tip", "priority": 2},
    {"message": "Challenge: solve next problem without hints. Trust the pattern.", "type": "challenge", "priority": 4},
    {"message": "You haven't touched Sliding Window yet. It appears in 30% of interviews.", "type": "warning", "priority": 4},
]


async def generate_guidance(session_id: str) -> dict:
    """Generate a proactive guidance message for the session."""
    session = await get_session(session_id)

    context = f"""Session stats:
- Brute force count: {session.get('brute_force_count', 0)}
- Solved problems: {len(session.get('solved_problems', []))}
- Weak topics: {session.get('weak_topics', [])}
- Interview score: {session.get('interview_score', 50)}
- Streak: {session.get('streak', 0)} days"""

    try:
        raw = await chat_completion(
            system_prompt=GUIDANCE_SYSTEM,
            user_message=context,
            temperature=0.7,
            max_tokens=200,
        )
        clean = raw.strip()
        if clean.startswith("```"):
            clean = "\n".join(clean.split("\n")[1:-1])
        data = json.loads(clean)
        return {
            "message": data.get("message", STATIC_GUIDANCE[0]["message"]),
            "type": data.get("type", "tip"),
            "priority": data.get("priority", 3),
        }
    except Exception:
        # Rotate static messages based on brute force count
        idx = session.get("brute_force_count", 0) % len(STATIC_GUIDANCE)
        return STATIC_GUIDANCE[idx]
