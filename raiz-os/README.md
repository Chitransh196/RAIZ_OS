# RAIZ OS — AI-Powered Coding Mentor Operating System

> Built with FastAPI · Next.js · LangGraph · Groq (llama-3.1-8b-instant) · FAISS · RAG

---

## What Is This?

RAIZ OS is an **adaptive AI coding mentor operating system** — not a chatbot.

It's a 3-panel workspace combining:
- **LeetCode-style problem workspace** (center)
- **AI Mentor Brain** with progressive hints, pattern detection, weakness analysis (right)
- **Learning Map** with topic mastery tracking (left)
- **Proactive guidance layer** at the bottom

**Resume-ready positioning:**
> Built an AI-powered adaptive coding mentor OS using FastAPI, Next.js, LangGraph, Groq LLMs, and RAG, featuring agentic workflows, progressive hinting, personalized weakness analytics, and visual algorithm explanations.

---

## Tech Stack

| Layer     | Tech                                              |
|-----------|---------------------------------------------------|
| Frontend  | Next.js 14 (App Router), Tailwind CSS, Framer Motion, Monaco Editor |
| Backend   | FastAPI, LangGraph, Groq API (llama-3.1-8b-instant) |
| AI/ML     | FAISS, sentence-transformers, RAG pipeline        |
| Memory    | JSON session store (Phase 1) → PostgreSQL (Phase 2) |

---

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Run backend
python main.py
# → API running at http://localhost:8000
# → Docs at http://localhost:8000/docs
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run frontend
npm run dev
# → App running at http://localhost:3000
```

### 3. Get Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Create account (free tier available)
3. Create API key
4. Add to `backend/.env` as `GROQ_API_KEY=...`

---

## Project Structure

```
raiz-os/
├── frontend/
│   ├── app/
│   │   ├── page.tsx          # Main workspace layout
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Futuristic dark theme
│   ├── components/
│   │   ├── topbar/           # TopBar with score, streak, focus mode
│   │   ├── learning-map/     # Left panel: topic progress
│   │   ├── workspace/        # Center: Monaco editor, problem, tests
│   │   ├── mentor/           # Right: hints, weaknesses, strategy
│   │   └── guidance/         # Bottom: proactive AI messages
│   └── lib/
│       ├── api.ts            # API client
│       └── store.ts          # Global state (useReducer)
│
└── backend/
    ├── main.py               # FastAPI entry point
    ├── api/                  # Route handlers
    ├── agents/               # LangGraph agents
    ├── llm/                  # Groq client + prompts
    ├── rag/                  # FAISS retriever + knowledge base
    └── analytics/            # Session memory + guidance engine
```

---

## Features — Phase 1

- [x] 3-panel workspace UI (not a chatbot)
- [x] Monaco code editor with language switching
- [x] Progressive 5-level hint system (Pattern → Pseudocode)
- [x] Pattern detection via Groq LLM
- [x] Complexity analysis (time + space)
- [x] Weakness tracking and suggestions
- [x] Proactive guidance layer with rotating messages
- [x] Session memory (JSON store)
- [x] RAG pipeline with DSA knowledge base
- [x] LangGraph mentor agent pipeline
- [x] Topic progress tracking
- [x] Interview readiness score
- [x] Algorithm visualizer (Two Sum demo)
- [x] Focus mode (hides side panels)

## Roadmap — Phase 2

- [ ] PostgreSQL session persistence
- [ ] Judge0 code execution (real test running)
- [ ] Agentic planner with adaptive roadmap
- [ ] More visualizations (BFS, DP table, recursion tree)
- [ ] Interview simulation mode (AI asks follow-up questions)
- [ ] More problems (50+ DSA problems seeded)

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/chat/hint` | Get progressive hint for problem |
| `POST` | `/chat/evaluate` | Evaluate code quality + complexity |
| `POST` | `/chat/run` | Run code against test cases (mock Phase 1) |
| `GET`  | `/progress/{session_id}` | Get session progress |
| `GET`  | `/analytics/guidance/{session_id}` | Get proactive guidance message |
| `GET`  | `/analytics/weaknesses/{session_id}` | Analyze weaknesses |
| `GET`  | `/health` | Health check |

---

## Design System

```
Background:  #050816
Panels:      #0B1120
Accent:      #7C3AED (purple)
Glow:        #22D3EE (cyan)
Success:     #10B981 (green)
Warning:     #F59E0B (orange)

Fonts:
  Display:   Orbitron (headers, logo)
  Mono:      JetBrains Mono (code, labels)
  Body:      Space Grotesk (prose)
```
