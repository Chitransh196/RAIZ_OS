"""
Chat API routes: hint generation, code evaluation, code execution (mock).
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agents.mentor_agent import run_mentor_agent
from agents.evaluator_agent import evaluate_code
from analytics.session_store import (
    record_hint_used, record_brute_force, record_optimal
)
from rag.retriever import retrieve_context

router = APIRouter(prefix="/chat", tags=["chat"])


# ─── Request / Response Models ─────────────────────────────────────────────────

class HintRequest(BaseModel):
    problem_id: str
    user_code: str
    hint_level: int
    topic: str
    session_id: str
    problem_title: str = "Coding Problem"
    problem_statement: str = ""


class HintResponse(BaseModel):
    hint: str
    hint_level: int
    pattern_detected: str
    complexity_estimate: str
    weaknesses: list[str]
    suggestions: list[str]


class EvalRequest(BaseModel):
    problem_id: str
    user_code: str
    language: str
    session_id: str
    problem_title: str = "Coding Problem"


class EvalResponse(BaseModel):
    time_complexity: str
    space_complexity: str
    quality_score: int
    feedback: str
    is_brute_force: bool
    optimization_hint: str


class RunRequest(BaseModel):
    code: str
    language: str
    test_cases: list[dict]


class RunResponse(BaseModel):
    results: list[dict]


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.post("/hint", response_model=HintResponse)
async def get_hint(req: HintRequest):
    if req.hint_level < 1 or req.hint_level > 5:
        raise HTTPException(status_code=400, detail="hint_level must be 1-5")

    # Optionally augment with RAG context
    rag_ctx = retrieve_context(f"{req.topic} {req.problem_title}")
    statement = req.problem_statement
    if rag_ctx:
        statement = f"{statement}\n\n[DSA Context]\n{rag_ctx}"

    result = await run_mentor_agent(
        problem_id=req.problem_id,
        problem_title=req.problem_title,
        problem_statement=statement,
        user_code=req.user_code,
        hint_level=req.hint_level,
        topic=req.topic,
        session_id=req.session_id,
    )

    # Record hint usage
    await record_hint_used(req.session_id, req.problem_id, req.hint_level)

    return HintResponse(
        hint=result["hint"],
        hint_level=req.hint_level,
        pattern_detected=result["pattern_detected"],
        complexity_estimate=result["complexity_estimate"],
        weaknesses=result["weaknesses"],
        suggestions=result["suggestions"],
    )


@router.post("/evaluate", response_model=EvalResponse)
async def eval_code(req: EvalRequest):
    result = await evaluate_code(
        problem_title=req.problem_title,
        user_code=req.user_code,
        language=req.language,
    )

    # Track brute force
    if result.get("is_brute_force"):
        await record_brute_force(req.session_id)
    elif result.get("quality_score", 0) >= 70:
        await record_optimal(req.session_id, "General")

    return EvalResponse(**result)


@router.post("/run", response_model=RunResponse)
async def run_code(req: RunRequest):
    """
    Phase 1: Mock code execution.
    Phase 2: Replace with Judge0 or sandboxed subprocess.
    """
    # Mock: return first test as pass, rest as pending
    results = []
    for i, tc in enumerate(req.test_cases):
        results.append({
            "passed": i == 0,  # Mock: only first passes
            "output": tc.get("expected", "") if i == 0 else "Execution pending",
            "expected": tc.get("expected", ""),
        })
    return RunResponse(results=results)
