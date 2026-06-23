"""
Weakness tracker: analyzes session data to identify weak patterns.
"""
from .session_store import get_session, update_session


WEAKNESS_THRESHOLDS = {
    "brute_force": 3,       # brute force used 3+ times
    "hint_heavy": 4,         # hint level 4+ used frequently
    "low_topic": 20,         # topic progress below 20%
}


async def analyze_weaknesses(session_id: str) -> dict:
    session = await get_session(session_id)

    weaknesses = []
    suggestions = []

    # Brute force tendency
    if session.get("brute_force_count", 0) >= WEAKNESS_THRESHOLDS["brute_force"]:
        weaknesses.append("Brute force overuse — nested loops as default")
        suggestions.append("Practice HashMap lookups before coding")

    # Hint dependency
    hint_history = session.get("hint_history", {})
    heavy_hint_count = sum(1 for v in hint_history.values() if v >= 4)
    if heavy_hint_count >= 2:
        weaknesses.append("High hint dependency on logic-level hints")
        suggestions.append("Try 10-min solo attempt before requesting hints")

    # Weak topics from progress
    topic_progress = session.get("topic_progress", {})
    weak_topics = [t for t, p in topic_progress.items() if p < WEAKNESS_THRESHOLDS["low_topic"]]
    if weak_topics:
        weaknesses.append(f"Low mastery: {', '.join(weak_topics[:3])}")
        suggestions.append(f"Focus on {weak_topics[0]} — complete 3 easy problems")

    # Defaults if none found
    if not weaknesses:
        weaknesses = ["No critical weaknesses detected yet"]
        suggestions = ["Keep solving — patterns will emerge with more data"]

    # Persist
    await update_session(session_id, {
        "weak_topics": weak_topics,
    })

    return {
        "weaknesses": weaknesses[:4],
        "suggestions": suggestions[:4],
        "weak_topics": weak_topics,
    }
