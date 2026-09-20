from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# =====================================================================
# Computer Vision Preprocessing Models
# =====================================================================

class PreprocessRequest(BaseModel):
    image_base64: str = Field(..., description="Base64 encoded scan image of student answer paper")
    apply_thinning: bool = Field(default=True, description="Enable Zhang-Suen morphological stroke thinning")
    auto_deskew: bool = Field(default=True, description="Perform Hough line angle deskewing & bounding alignment")


class PreprocessResponse(BaseModel):
    processed_image_base64: str = Field(..., description="Cleaned, binarized and normalized base64 image")
    skew_angle_deg: float = Field(..., description="Detected rotation angle in degrees")
    dpi_detected: int = Field(default=300, description="Estimated scan DPI resolution")
    contrast_ratio: float = Field(..., description="Measured dynamic contrast ratio percentage")
    stroke_width_px: float = Field(default=2.4, description="Average stroke width in pixels")


# =====================================================================
# Examination & Rubric Models
# =====================================================================

class KeyConceptRubric(BaseModel):
    concept: str = Field(..., description="Core conceptual keyword or formula")
    weight_marks: float = Field(..., description="Marks attributed to this specific concept")
    synonyms: List[str] = Field(default=[], description="Permitted synonymous variations")
    description: Optional[str] = Field(default=None, description="Guidance notes for grading")


class QuestionRubric(BaseModel):
    question_number: int = Field(..., description="Sequential question number (e.g. 1, 2, 3)")
    question_text: str = Field(..., description="Full text of the question")
    max_marks: float = Field(..., description="Maximum marks allocatable")
    model_answer: str = Field(..., description="Official faculty benchmark model answer")
    key_concepts: List[KeyConceptRubric] = Field(default=[], description="Structured rubric concepts")
    leniency_threshold_pct: Optional[float] = Field(default=80.0, description="Similarity threshold for full mark consideration")


class StudentAnswerItem(BaseModel):
    question_number: int = Field(..., description="Question number corresponding to the answer")
    student_answer_text: str = Field(..., description="Extracted student response string")


# =====================================================================
# Multimodal OCR Models
# =====================================================================

class BoundingBox(BaseModel):
    x: float = Field(..., description="Top-left X coordinate percentage or pixel offset")
    y: float = Field(..., description="Top-left Y coordinate percentage or pixel offset")
    width: float = Field(..., description="Width of bounding box")
    height: float = Field(..., description="Height of bounding box")


class DetectedLine(BaseModel):
    line_number: int = Field(..., description="Sequential line index")
    text: str = Field(..., description="Transcribed line text")
    confidence: float = Field(..., description="OCR confidence score [0.0 - 1.0]")
    bounding_box: Optional[BoundingBox] = Field(default=None, description="Spatial coordinates")


class ParsedAnswerItem(BaseModel):
    question_number: int = Field(..., description="Detected question index")
    answer_text: str = Field(..., description="Synthesized answer text for this question")
    confidence: float = Field(..., description="Aggregated confidence score")
    line_count: int = Field(default=1, description="Number of text lines spanned")


class PageOcrResult(BaseModel):
    page_number: int = Field(..., description="Sequential page number (1-indexed)")
    text: str = Field(..., description="Extracted text from this page")
    confidence: float = Field(default=0.95, description="Page OCR confidence score [0.0 - 1.0]")
    word_count: int = Field(default=0, description="Total words extracted from this page")
    lines: List[DetectedLine] = Field(default=[], description="Detected lines on this page")
    detected_answers: List[ParsedAnswerItem] = Field(default=[], description="Answers segmented from this page")
    preprocessed: bool = Field(default=False, description="Whether preprocessing was applied to this page")
    skew_angle_deg: Optional[float] = Field(default=0.0, description="Detected rotation skew angle")
    status: str = Field(default="SUCCESS", description="Page status: SUCCESS, PARTIAL, or FAILED")
    error_message: Optional[str] = Field(default=None, description="Error details if page failed")


class OcrParseRequest(BaseModel):
    image_base64: Optional[str] = Field(default=None, description="Base64 encoded student manuscript scan (single page)")
    pages: Optional[List[str]] = Field(default=None, description="List of base64 images for multi-page documents")
    preprocess: bool = Field(default=True, description="Enable image preprocessing (deskew, contrast enhancement)")
    auto_deskew: bool = Field(default=True, description="Auto-deskew page rotation angle")
    apply_thinning: bool = Field(default=False, description="Apply morphological stroke thinning")
    questions: Optional[List[QuestionRubric]] = Field(default=None, description="Optional rubric for question alignment")
    document_name: Optional[str] = Field(default=None, description="Optional document name or identifier")


class OcrParseResponse(BaseModel):
    raw_transcription: str = Field(..., description="Complete verbatim transcription across all pages")
    extracted_text: Optional[str] = Field(default=None, description="Full extracted text alias")
    detected_answers: List[ParsedAnswerItem] = Field(default=[], description="Segmented question responses")
    detected_lines: List[DetectedLine] = Field(default=[], description="Line-by-line bounding coordinates")
    pages: List[PageOcrResult] = Field(default=[], description="Page-wise OCR results")
    total_pages: int = Field(default=1, description="Total number of document pages")
    successful_pages: int = Field(default=1, description="Number of successfully parsed pages")
    total_words_detected: int = Field(..., description="Total word count")
    avg_confidence: float = Field(..., description="Mean OCR confidence score")
    status: str = Field(default="SUCCESS", description="Overall OCR execution status: SUCCESS, PARTIAL, or FAILED")
    error_message: Optional[str] = Field(default=None, description="Overall error message if processing failed")


# Backward compatible aliases
DocumentOcrRequest = OcrParseRequest
DocumentOcrResponse = OcrParseResponse


# =====================================================================
# Semantic Evaluation & Grading Pipeline Models
# =====================================================================

class ConceptMatchResult(BaseModel):
    concept: str = Field(..., description="Rubric concept analyzed")
    awarded_marks: float = Field(..., description="Marks awarded for this concept")
    max_marks: float = Field(..., description="Maximum possible marks for this concept")
    matched_phrases: List[str] = Field(default=[], description="Detected student phrases satisfying concept")
    is_satisfied: bool = Field(..., description="Whether criteria met threshold")


class QuestionEvaluationResult(BaseModel):
    question_number: int = Field(..., description="Target question number")
    question_text: Optional[str] = Field(default=None, description="Original question prompt")
    student_answer_text: str = Field(..., description="Analyzed student response")
    model_answer_text: str = Field(..., description="Benchmark faculty answer")
    max_marks: float = Field(..., description="Maximum marks")
    suggested_marks: float = Field(..., description="AI suggested marks based on evaluation rubric")
    awarded_marks: float = Field(..., description="Awarded marks alias for downstream compatibility")
    semantic_similarity_score: float = Field(..., description="NLP semantic similarity percentage [0 - 100]")
    concept_matches: List[ConceptMatchResult] = Field(default=[], description="Key concept breakdowns")
    feedback: str = Field(..., description="Pedagogical feedback on student work")
    strengths: List[str] = Field(default=[], description="Identified strengths")
    improvements: List[str] = Field(default=[], description="Identified deficiencies or missing concepts")
    confidence: float = Field(default=0.95, description="AI confidence score [0.0 - 1.0]")
    confidence_score: float = Field(default=0.95, description="Confidence score alias")
    is_suggestion: bool = Field(default=True, description="Indicates result is an AI suggestion pending faculty review")


class EvaluationRequest(BaseModel):
    questions: List[QuestionRubric] = Field(..., description="Array of questions with benchmark rubrics")
    student_answers: List[StudentAnswerItem] = Field(..., description="Array of candidate transcribed answers")
    student_name: Optional[str] = Field(default="Candidate", description="Name of student being graded")
    exam_id: Optional[str] = Field(default="exam-01", description="Associated examination identifier")


class EvaluationResponse(BaseModel):
    student_name: str = Field(..., description="Candidate name")
    suggested_total_marks: float = Field(..., description="Total AI suggested marks across all questions")
    total_score: float = Field(..., description="Total score alias for downstream compatibility")
    max_score: float = Field(..., description="Total possible marks")
    percentage: float = Field(..., description="Overall percentage [0 - 100]")
    grade: str = Field(..., description="Suggested letter grade designation (e.g. A+, A, B)")
    confidence: float = Field(default=0.95, description="Aggregate AI confidence score [0.0 - 1.0]")
    is_suggestion: bool = Field(default=True, description="Flag explicitly designating evaluation as an AI suggestion")
    status: str = Field(default="PENDING_TEACHER_REVIEW", description="Workflow status: PENDING_TEACHER_REVIEW")
    disclaimer: str = Field(
        default="This evaluation is generated by AI as a recommendation. Final marks must be reviewed and finalized by the instructor.",
        description="Faculty advisory notice"
    )
    question_evaluations: List[QuestionEvaluationResult] = Field(..., description="Per-question evaluations")
    overall_summary: str = Field(..., description="Pedagogical evaluation narrative")
    key_strengths: List[str] = Field(default=[], description="Highlighted student strengths")
    priority_improvements: List[str] = Field(default=[], description="High-priority learning recommendations")
    blooms_taxonomy_level: str = Field(..., description="Cognitive complexity classification")


# =====================================================================
# File & Storage Models
# =====================================================================

class FileUploadResponse(BaseModel):
    file_id: str
    filename: str
    size_bytes: int
    content_type: str
    stored_path: str
    url: str
