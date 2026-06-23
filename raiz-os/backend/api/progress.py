"""
Progress API routes: session progress, topic mastery, interview score.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from analytics.session_store import get_session, update_session

router = APIRouter(prefix="/progress", tags=["progress"])


class ProgressResponse(BaseModel):
    session_id: str
    solved_problems: list[str]
    weak_topics: list[str]
    interview_score: int
    streak: int
    topic_progress: dict[str, int]
    brute_force_count: int
    optimal_solution_count: int


class TopicUpdateRequest(BaseModel):
    session_id: str
    topic: str
    delta: int  # progress increment


@router.get("/{session_id}", response_model=ProgressResponse)
async def get_progress(session_id: str):
    session = await get_session(session_id)
    return ProgressResponse(
        session_id=session_id,
        solved_problems=session.get("solved_problems", []),
        weak_topics=session.get("weak_topics", []),
        interview_score=session.get("interview_score", 50),
        streak=session.get("streak", 0),
        topic_progress=session.get("topic_progress", {}),
        brute_force_count=session.get("brute_force_count", 0),
        optimal_solution_count=session.get("optimal_solution_count", 0),
    )


@router.post("/topic")
async def update_topic_progress(req: TopicUpdateRequest):
    session = await get_session(req.session_id)
    tp = session.get("topic_progress", {})
    current = tp.get(req.topic, 0)
    tp[req.topic] = min(100, current + req.delta)
    await update_session(req.session_id, {"topic_progress": tp})
    return {"topic": req.topic, "progress": tp[req.topic]}
