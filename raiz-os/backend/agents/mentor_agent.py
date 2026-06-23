"""
Mentor Agent: LangGraph-based agentic mentor workflow.

Graph:
  analyze_code → detect_pattern → generate_hint → assess_weakness → output
"""
import json
from typing import TypedDict, Optional
from langgraph.graph import StateGraph, END
from llm.groq_client import chat_completion
from llm.prompts import EVALUATOR_SYSTEM  # HINT_SYSTEM used in hint_engine, MENTOR_SYSTEM removed
from llm.hint_engine import generate_hint
from llm.pattern_detector import detect_pattern


# ─── State ────────────────────────────────────────────────────────────────────

class MentorState(TypedDict):
    problem_id: str
    problem_title: str
    problem_statement: str
    user_code: str
    hint_level: int
    topic: str
    session_id: str
    # Outputs
    hint: str
    pattern_detected: str
    complexity_estimate: str
    weaknesses: list[str]
    suggestions: list[str]
    is_brute_force: bool
    error: Optional[str]


# ─── Nodes ────────────────────────────────────────────────────────────────────

async def analyze_code_node(state: MentorState) -> MentorState:
    """Analyze code quality and complexity."""
    if not state["user_code"].strip():
        return {**state, "complexity_estimate": "Not written", "is_brute_force": False}

    raw = await chat_completion(
        system_prompt=EVALUATOR_SYSTEM,
        user_message=f"Problem: {state['problem_title']}\n\nCode:\n```\n{state['user_code']}\n```",
        temperature=0.1,
        max_tokens=400,
    )

    try:
        clean = raw.strip()
        if clean.startswith("```"):
            clean = "\n".join(clean.split("\n")[1:-1])
        data = json.loads(clean)
        return {
            **state,
            "complexity_estimate": data.get("time_complexity", "O(n²)"),
            "is_brute_force": data.get("is_brute_force", False),
        }
    except Exception:
        return {**state, "complexity_estimate": "O(n²)", "is_brute_force": False}


async def detect_pattern_node(state: MentorState) -> MentorState:
    """Detect pattern in user's code."""
    result = await detect_pattern(state["user_code"], state["topic"])
    return {
        **state,
        "pattern_detected": result.get("current_pattern", state["topic"]),
    }


async def generate_hint_node(state: MentorState) -> MentorState:
    """Generate progressive hint."""
    result = await generate_hint(
        problem_title=state["problem_title"],
        problem_statement=state["problem_statement"],
        user_code=state["user_code"],
        hint_level=state["hint_level"],
        topic=state["topic"],
    )
    return {
        **state,
        "hint": result.get("hint", ""),
        "pattern_detected": result.get("pattern_detected", state["pattern_detected"]),
        "complexity_estimate": result.get("complexity_estimate", state["complexity_estimate"]),
        "weaknesses": result.get("weaknesses", []),
        "suggestions": result.get("suggestions", []),
    }


# ─── Graph ────────────────────────────────────────────────────────────────────

def build_mentor_graph() -> StateGraph:
    graph = StateGraph(MentorState)

    graph.add_node("analyze_code", analyze_code_node)
    graph.add_node("detect_pattern", detect_pattern_node)
    graph.add_node("generate_hint", generate_hint_node)

    graph.set_entry_point("analyze_code")
    graph.add_edge("analyze_code", "detect_pattern")
    graph.add_edge("detect_pattern", "generate_hint")
    graph.add_edge("generate_hint", END)

    return graph.compile()


# Singleton compiled graph
_mentor_graph = None


def get_mentor_graph():
    global _mentor_graph
    if _mentor_graph is None:
        _mentor_graph = build_mentor_graph()
    return _mentor_graph


async def run_mentor_agent(
    problem_id: str,
    problem_title: str,
    problem_statement: str,
    user_code: str,
    hint_level: int,
    topic: str,
    session_id: str,
) -> MentorState:
    """Run the full mentor agent pipeline."""
    graph = get_mentor_graph()

    initial: MentorState = {
        "problem_id": problem_id,
        "problem_title": problem_title,
        "problem_statement": problem_statement,
        "user_code": user_code,
        "hint_level": hint_level,
        "topic": topic,
        "session_id": session_id,
        "hint": "",
        "pattern_detected": topic,
        "complexity_estimate": "O(n²)",
        "weaknesses": [],
        "suggestions": [],
        "is_brute_force": False,
        "error": None,
    }

    result = await graph.ainvoke(initial)
    return result
