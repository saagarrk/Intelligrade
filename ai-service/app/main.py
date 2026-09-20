import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.evaluation_routes import router as evaluation_router

app = FastAPI(
    title="IntelliGrade AI Service",
    version="2.5.0",
    description="Python FastAPI Microservice for Computer Vision Preprocessing, OCR Parsing, and Semantic Rubric Evaluation"
)

# CORS Middleware configuration
# Restricts access to trusted domains (AI Studio, local backend orchestrator, and Cloud Run origins)
cors_origins_env = os.environ.get("CORS_ORIGIN", "")
allowed_origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]

if not allowed_origins:
    allowed_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.run\.app|https://.*\.google\.com|https://.*\.ai\.studio",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Include AI Evaluation Route Handlers
app.include_router(evaluation_router)

@app.get("/api/ai/health", tags=["Health"], summary="AI Microservice Health")
@app.get("/health", tags=["Health"], summary="Standard Health Check")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "IntelliGrade Python AI Microservice",
        "version": "2.5.0",
        "gemini_vision_enabled": bool(os.environ.get("GEMINI_API_KEY")),
        "endpoints": {
            "health": "/api/ai/health",
            "evaluate": "/api/ai/evaluate",
            "preprocess": "/api/v1/preprocess",
            "ocr": "/api/v1/ocr"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
