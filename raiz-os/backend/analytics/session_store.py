"""
Session store: JSON file-based memory for Phase 1.
Phase 2: swap for PostgreSQL.

FIXED: Deadlock bug — update_session was calling get_session inside same asyncio.Lock.
       Extracted _read/_write internal helpers; public API uses single lock acquisition.
"""
import json
import asyncio
from datetime import datetime
from pathlib import Path

SESSIONS_DIR = Path(__file__).parent.parent / "data" / "sessions"
SESSIONS_DIR.mkdir(parents=True, exist_ok=True)

_lock = asyncio.Lock()


def _safe_id(session_id: str) -> str:
    return "".join(c for c in session_id if c.isalnum() or c in "_-")


def _session_path(session_id: str) -> Path:
    return SESSIONS_DIR / f"{_safe_id(session_id)}.json"


def _default_session(session_id: str) -> dict:
    return {
        "session_id": session_id,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "solved_problems": [],
        "attempted_problems": [],
        "weak_topics": [],
        "strong_topics": [],
        "interview_score": 50,
        "streak": 0,
        "last_active": datetime.utcnow().isoformat(),
        "topic_progress": {
            "Arrays": 0, "HashMap": 0, "Sliding Window": 0,
            "Two Pointers": 0, "Binary Search": 0, "Dynamic Programming": 0,
            "Trees": 0, "Graphs": 0, "Greedy": 0, "Backtracking": 0, "Stacks": 0,
        },
        "hint_history": {},
        "brute_force_count": 0,
        "optimal_solution_count": 0,
    }


# ── Internal helpers (NO locking — callers hold the lock) ────────────────────

def _read(session_id: str) -> dict:
    path = _session_path(session_id)
    if not path.exists():
        session = _default_session(session_id)
        path.write_text(json.dumps(session, indent=2))
        return session
    try:
        return json.loads(path.read_text())
    except (json.JSONDecodeError, OSError):
        session = _default_session(session_id)
        path.write_text(json.dumps(session, indent=2))
        return session


def _write(session_id: str, data: dict) -> dict:
    data["updated_at"] = datetime.utcnow().isoformat()
    _session_path(session_id).write_text(json.dumps(data, indent=2))
    return data


# ── Public API (all async, each acquires lock once) ──────────────────────────

async def get_session(session_id: str) -> dict:
    async with _lock:
        return _read(session_id)


async def update_session(session_id: str, updates: dict) -> dict:
    async with _lock:                   # single lock acquisition — no deadlock
        session = _read(session_id)
        session.update(updates)
        return _write(session_id, session)


async def record_hint_used(session_id: str, problem_id: str, hint_level: int):
    async with _lock:
        session = _read(session_id)
        history = session.get("hint_history", {})
        history[problem_id] = max(history.get(problem_id, 0), hint_level)
        session["hint_history"] = history
        _write(session_id, session)


async def record_brute_force(session_id: str):
    async with _lock:
        session = _read(session_id)
        session["brute_force_count"] = session.get("brute_force_count", 0) + 1
        _write(session_id, session)


async def record_optimal(session_id: str, topic: str):
    async with _lock:
        session = _read(session_id)
        session["optimal_solution_count"] = session.get("optimal_solution_count", 0) + 1
        session["interview_score"] = min(100, session.get("interview_score", 50) + 2)
        _write(session_id, session)
