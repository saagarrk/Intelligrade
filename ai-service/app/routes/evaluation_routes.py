import os
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Header, Depends, status
from typing import Optional
from ..models.evaluation_model import (
    PreprocessRequest, PreprocessResponse,
    OcrParseRequest, OcrParseResponse,
    EvaluationRequest, EvaluationResponse,
    FileUploadResponse
)
from ..services.preprocessing_service import PreprocessingService
from ..services.ocr_service import OcrService
from ..services.evaluation_service import EvaluationService
from ..utils.file_utils import (
    validate_image_file,
    save_temp_file,
    bytes_to_base64
)

router = APIRouter(tags=["AI Evaluation Services"])

def verify_internal_auth(
    x_internal_api_key: Optional[str] = Header(None, alias="X-Internal-API-Key"),
    authorization: Optional[str] = Header(None),
    x_originating_service: Optional[str] = Header(None, alias="X-Originating-Service")
):
    """
    Guarantees that communication to the Python AI service is strictly restricted
    to authenticated backend orchestrators (Spring Boot).
    Direct frontend calls without internal credentials are fundamentally blocked (HTTP 401).
    """
    secret = os.environ.get("AI_SERVICE_SECRET_KEY", "intelligrade-ai-internal-secret-token-2026")
    provided = x_internal_api_key
    if not provided and authorization:
        if authorization.startswith("Bearer "):
            provided = authorization[7:].strip()
        else:
            provided = authorization.strip()

    if secret and provided != secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Forbidden: Direct frontend access to Python AI service is prohibited. Requests must route via Spring Boot backend with X-Internal-API-Key."
        )
    return True

# User-requested root endpoints: GET /api/ai/health and POST /api/ai/evaluate
@router.get("/api/ai/health", tags=["Health"], summary="AI Service Health Check")
def api_ai_health():
    """
    Dedicated health check endpoint verifying Python AI service status.
    """
    return {
        "status": "HEALTHY",
        "service": "IntelliGrade Python AI Microservice",
        "version": "2.5.0",
        "engine": "FastAPI + OpenCV + Gemini AI",
        "auth_required": True,
        "endpoints": {
            "health": "/api/ai/health",
            "evaluate": "/api/ai/evaluate",
            "preprocess": "/api/v1/preprocess",
            "ocr": "/api/v1/ocr"
        }
    }

@router.post("/api/ai/evaluate", response_model=EvaluationResponse, summary="Secure AI Evaluation Endpoint")
def api_ai_evaluate(request: EvaluationRequest, authenticated: bool = Depends(verify_internal_auth)):
    """
    Main evaluation endpoint accepting student answers and benchmark rubrics,
    returning structured evaluation results with scores, concept breakdowns, and feedback.
    Protected: Only authorized Spring Boot requests carrying internal credentials can invoke.
    """
    try:
        return EvaluationService.evaluate_submission(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Evaluation pipeline error: {str(e)}"
        )

# Backward-compatible & microservice v1 endpoints
@router.post("/api/v1/preprocess", response_model=PreprocessResponse, summary="Computer Vision Preprocessing & Deskew")
def preprocess_scan(request: PreprocessRequest, authenticated: bool = Depends(verify_internal_auth)):
    """
    Applies OpenCV morphological deskewing, Otsu binarization, noise filtering,
    and optional Zhang-Suen skeletonization.
    """
    try:
        return PreprocessingService.preprocess_image(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Preprocessing error: {str(e)}"
        )

@router.post("/api/ai/ocr", response_model=OcrParseResponse, summary="Document OCR & Multi-page Transcription")
@router.post("/api/v1/ocr", response_model=OcrParseResponse, summary="Multimodal OCR & Answer Script Parser")
async def parse_handwriting(request: OcrParseRequest, authenticated: bool = Depends(verify_internal_auth)):
    """
    Multimodal OCR parsing of handwritten student manuscripts with bounding boxes,
    line recognition, multi-page support, and question segmentation.
    """
    try:
        return await OcrService.extract_and_parse(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"OCR transcription error: {str(e)}"
        )

@router.post("/api/v1/evaluate", response_model=EvaluationResponse, summary="Semantic NLP Evaluation & Mark Attribution")
def evaluate_answers(request: EvaluationRequest, authenticated: bool = Depends(verify_internal_auth)):
    """
    Evaluates student answer responses against faculty model answers and key concepts,
    attributing proportional marks and generating formative pedagogical feedback.
    """
    try:
        return EvaluationService.evaluate_submission(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Evaluation pipeline error: {str(e)}"
        )

@router.post("/api/v1/upload-scan", response_model=FileUploadResponse, summary="Multipart File Upload & Validation")
async def upload_scan_file(
    file: UploadFile = File(...),
    authenticated: bool = Depends(verify_internal_auth)
):
    """
    Accepts student answer sheet scan uploads (PNG, JPG, PDF), validates the byte stream,
    and returns file metadata with a temporary identifier.
    Protected: Requires internal authentication clearance.
    Does not expose internal host file system paths.
    """
    try:
        content = await file.read()
        metadata = validate_image_file(content, file.filename)
        temp_path = save_temp_file(content, prefix="submission_", suffix=os.path.splitext(file.filename or "scan.png")[1])
        file_id = os.path.basename(temp_path).replace(".png", "").replace(".jpg", "")

        return FileUploadResponse(
            file_id=file_id,
            filename=file.filename or "unknown.png",
            size_bytes=metadata["size_bytes"],
            content_type=file.content_type or "image/png",
            stored_path="[RESTRICTED_INTERNAL_STORAGE]",
            url=f"/api/v1/files/{file_id}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File upload rejection: {str(e)}"
        )

