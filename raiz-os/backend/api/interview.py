"""
Interview evaluation route — single Groq call, local fallback if unavailable.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from llm.groq_client import chat_completion
import json

router = APIRouter(prefix="/interview", tags=["interview"])


class EvalRequest(BaseModel):
    problem_title: str
    user_code: str
    explanation: str
    follow_up_answer: str
    language: str


class EvalResponse(BaseModel):
    feedback: str
    score: int


EVAL_PROMPT = """You are a senior FAANG interviewer evaluating a coding interview submission.

Evaluate the candidate fairly. Respond ONLY in this JSON format:
{
  "score": <integer 0-100>,
  "feedback": "<2-3 sentence specific feedback mentioning code quality, explanation, complexity>"
}

Score rubric:
- Correct optimal solution + clear explanation: 85-100
- Correct solution but suboptimal or unclear explanation: 65-84
- Partial solution or brute force: 45-64
- Incorrect or no meaningful progress: 0-44"""


def _local_score(code: str, explanation: str) -> dict:
    """Deterministic fallback — zero API calls."""
    score = 45
    code_l = code.lower()
    exp_l  = explanation.lower()
    if any(x in code_l for x in ["dict", "{}", "map", "hashmap", "defaultdict"]): score += 15
    if code.count("for") + code.count("while") == 1: score += 8
    if len(code.replace(" ", "")) > 80: score += 5
    if len(explanation) > 50: score += 8
    if any(x in exp_l for x in ["o(n)", "linear", "hashmap", "complement"]): score += 10
    if any(x in exp_l for x in ["edge case", "empty", "duplicate"]): score += 4
    score = min(95, score)
    quality = "strong" if score >= 75 else "acceptable" if score >= 60 else "needs improvement"
    return {
        "score": score,
        "feedback": (
            f"Code quality is {quality}. "
            + ("HashMap usage shows good pattern recognition. " if "dict" in code_l or "{}" in code_l else "Consider a HashMap for O(n) instead of O(n²). ")
            + ("Explanation covers complexity well." if "o(n)" in exp_l else "Always state time/space complexity explicitly in interviews.")
        )
    }


@router.post("/evaluate", response_model=EvalResponse)
async def evaluate_interview(req: EvalRequest):
    user_msg = f"""Problem: {req.problem_title}
Language: {req.language}

Code submitted:
```
{req.user_code[:1500]}
```

Candidate's explanation:
{req.explanation[:600]}

Follow-up answer:
{req.follow_up_answer[:300]}"""

    try:
        raw = await chat_completion(
            system_prompt=EVAL_PROMPT,
            user_message=user_msg,
            temperature=0.2,
            max_tokens=300,
        )
        clean = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
        data = json.loads(clean)
        return EvalResponse(
            score=max(0, min(100, int(data.get("score", 60)))),
            feedback=str(data.get("feedback", ""))
        )
    except Exception:
        result = _local_score(req.user_code, req.explanation)
        return EvalResponse(**result)
