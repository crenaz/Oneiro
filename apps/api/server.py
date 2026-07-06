# server.py
import uuid
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google.genai import types as genai_types

# Import the builder function from main.py
from main import build_oneiro_app

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("oneiro_server")

app = FastAPI(title="Oneiromantia API Server")

# Instantiate the runner globally so it is reused across requests
runner = build_oneiro_app()


class AnalyzeRequest(BaseModel):
    dream: str
    user_id: str = "default-user"


class AnalyzeResponse(BaseModel):
    session_id: str
    report: str
    symbols: dict | None = None
    patterns: dict | None = None
    art_seed: str | None = None


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_dream(request: AnalyzeRequest):
    if not request.dream.strip():
        raise HTTPException(status_code=400, detail="Dream text cannot be empty.")
    
    session_id = str(uuid.uuid4())
    user_id = request.user_id
    
    logger.info(f"Starting dream analysis for user={user_id}, session={session_id}")
    
    try:
        # 1. Create session
        await runner.session_service.create_session(
            app_name="oneiro",
            user_id=user_id,
            session_id=session_id,
        )
        
        # 2. Run the workflow runner
        final_report = ""
        async for event in runner.run_async(
            user_id=user_id,
            session_id=session_id,
            new_message=genai_types.Content(
                role="user",
                parts=[genai_types.Part(text=request.dream)],
            ),
        ):
            if event.output:
                final_report = event.output
        
        # 3. Retrieve session to get parsed state variables
        session = await runner.session_service.get_session(
            app_name="oneiro",
            user_id=user_id,
            session_id=session_id,
        )
        
        state = session.state if session else {}
        
        return AnalyzeResponse(
            session_id=session_id,
            report=final_report,
            symbols=state.get("symbols_output"),
            patterns=state.get("patterns_output"),
            art_seed=state.get("art_seed")
        )
        
    except Exception as e:
        logger.error(f"Error during dream analysis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/healthz")
async def health_check():
    return {"status": "ok"}
