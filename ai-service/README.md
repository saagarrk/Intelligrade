# IntelliGrade AI Python Microservice

High-performance AI microservice built with **Python 3.11** and **FastAPI**, responsible for computer vision preprocessing, OCR handwriting digitization, semantic rubric evaluation, and pedagogical feedback generation.

---

## 🏛️ System Architecture

```text
IntelliGrade/
│
├── backend/          ← Java + Spring Boot (Core Enterprise API & Auth)
│
├── frontend/         ← React + Vite (Modern Academic Dashboard)
│
└── ai-service/       ← Python + FastAPI (Computer Vision & Semantic AI)

ai-service/
│
├── app/
│   ├── main.py                     # FastAPI application entry point, middleware & routing
│   │
│   ├── routes/
│   │   └── evaluation_routes.py    # REST endpoints (/preprocess, /ocr, /evaluate, /upload-scan)
│   │
│   ├── services/
│   │   ├── ocr_service.py          # Multimodal handwriting extraction & bounding box alignment
│   │   ├── preprocessing_service.py# OpenCV Otsu thresholding, deskewing & Zhang-Suen thinning
│   │   ├── evaluation_service.py   # NLP semantic similarity, concept matching & mark attribution
│   │   └── feedback_service.py     # Bloom's taxonomy & pedagogical formative feedback
│   │
│   ├── models/
│   │   └── evaluation_model.py     # Pydantic schemas for requests, responses & rubrics
│   │
│   └── utils/
│       └── file_utils.py           # File validation, base64 encoding/decoding & image transformations
│
├── requirements.txt                # Python package dependencies
├── Dockerfile                      # Production container image specification
└── README.md                       # Microservice documentation & operational guide
```

---

## 🚀 Core Features

- **OpenCV Document Preprocessing** (`preprocessing_service.py`):
  - Grayscale conversion and bilateral noise reduction.
  - Otsu's adaptive binarization for handwritten manuscripts.
  - Minimum area bounding box and Hough Transform angle deskewing.
  - Zhang-Suen morphological skeletonization for stroke thinning.
- **Multimodal OCR Service** (`ocr_service.py`):
  - Gemini Vision / Multimodal OCR engine with deterministic fallbacks.
  - Question segmentation and sequential answer mapping.
  - Spatial bounding box coordinates (`x`, `y`, `width`, `height`).
- **Semantic Evaluation Engine** (`evaluation_service.py`):
  - Semantic keyword and concept phrase coverage analysis.
  - Key concept rubric matching with synonym support.
  - Bounded mark allocation `[0, maxMarks]` without deflation.
- **Pedagogical Feedback Service** (`feedback_service.py`):
  - Strengths and targeted misconceptions identification.
  - Bloom's Taxonomy cognitive classification (Remembering to Evaluating).
  - Standardized letter grade determination (`A+` to `F`).
- **File Utilities** (`file_utils.py`):
  - Base64 encoding and decoding for browser and canvas transmission.
  - Byte-stream validation and MIME-type restrictions.
  - Safe temporary file staging and cleanup.

---

## 🛠️ API Specification

| Method | Path | Summary | Description |
|---|---|---|---|
| `GET` | `/api/ai/health` | Health Check | Microservice status, version, and available endpoints |
| `POST` | `/api/ai/evaluate` | AI Evaluation | Accepts answer-paper/evaluation payload and returns structured results |
| `POST` | `/api/ai/ocr` | Document OCR | Multi-page text extraction with page-wise results & deskew |
| `GET` | `/health` | Root Health Check | Operational status and vision engine availability |
| `POST` | `/api/v1/preprocess` | Image Preprocessing | Deskews, binarizes, and thins answer sheet scans |
| `POST` | `/api/v1/ocr` | Multimodal OCR | Extracts student handwriting with line metadata |
| `POST` | `/api/v1/evaluate` | Rubric Evaluation | Grades student answers against benchmark rubrics |
| `POST` | `/api/v1/upload-scan` | Scan File Upload | Validates and stages multipart scan uploads |

---

## 💻 Local Development Setup

```bash
# 1. Navigate to directory
cd ai-service

# 2. Initialize virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start local development server with auto-reload
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive OpenAPI documentation is accessible at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
