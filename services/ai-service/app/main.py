from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import posture, body_composition, recommendations
from app.core.config import settings

app = FastAPI(
    title="FitForge AI Service",
    description="AI-powered fitness analysis: posture, body composition & recommendations",
    version="1.0.0",
    docs_url="/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(posture.router,          prefix="/ai/posture",         tags=["Posture Analysis"])
app.include_router(body_composition.router, prefix="/ai/body-composition", tags=["Body Composition"])
app.include_router(recommendations.router,  prefix="/ai/recommendations",  tags=["AI Recommendations"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "fitforge-ai"}
