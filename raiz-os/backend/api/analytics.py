"""
Analytics API routes: progress tracking, guidance messages, session data.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from analytics.session_store import get_session, update_session
from analytics.weakness_tracker import analyze_weaknesses
from analytics.guidance_engine import generate_guidance

router = APIRouter(prefix="/analytics", tags=["analytics"])


class GuidanceResponse(BaseModel):
    message: str
    type: str
    priority: int


class WeaknessResponse(BaseModel):
    weaknesses: list[str]
    suggestions: list[str]
    weak_topics: list[str]


@router.get("/guidance/{session_id}", response_model=GuidanceResponse)
async def get_guidance(session_id: str):
    return await generate_guidance(session_id)


@router.get("/weaknesses/{session_id}", response_model=WeaknessResponse)
async def get_weaknesses(session_id: str):
    return await analyze_weaknesses(session_id)


@router.get("/session/{session_id}")
async def get_session_data(session_id: str):
    return await get_session(session_id)
