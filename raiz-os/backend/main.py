"""
RAIZ OS — FastAPI Backend
"""
import os
import sys

# Force venv Python path — fixes "No module named dotenv" on Windows
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Patch: if running via bare `uvicorn` with wrong Python, re-exec with correct one
if sys.version_info < (3, 10):
    import subprocess
    subprocess.run([sys.executable, "-m", "uvicorn", "main:app", "--reload"])
    sys.exit()

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from dotenv import load_dotenv
    load_dotenv()
except ModuleNotFoundError:
    pass  # continue without .env if dotenv missing

from api.chat import router as chat_router
from api.analytics import router as analytics_router
from api.progress import router as progress_router
from api.interview import router as interview_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[RAIZ OS] Ready.")
    yield
    print("[RAIZ OS] Shutdown.")


app = FastAPI(title="RAIZ OS API", version="1.0.0", lifespan=lifespan)

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(analytics_router)
app.include_router(progress_router)
app.include_router(interview_router)


@app.get("/health")
async def health():
    return {"status": "ok", "groq_configured": bool(os.getenv("GROQ_API_KEY"))}


@app.get("/")
async def root():
    return {"message": "RAIZ OS API", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)