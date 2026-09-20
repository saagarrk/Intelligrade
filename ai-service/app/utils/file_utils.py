import os
import io
import base64
import tempfile
import mimetypes
from typing import Optional, Tuple, Dict, Any
import numpy as np
from PIL import Image

# Permitted upload MIME extensions for academic scans
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".tiff", ".bmp", ".pdf"}
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB

def clean_base64_string(b64_string: str) -> str:
    """Strips data URL prefixes (e.g. data:image/png;base64,) and whitespace."""
    if not b64_string:
        return ""
    if "," in b64_string:
        return b64_string.split(",", 1)[1].strip()
    return b64_string.strip()

def base64_to_cv2(b64_string: str) -> np.ndarray:
    """Decodes a base64 image string into an OpenCV BGR numpy array."""
    cleaned = clean_base64_string(b64_string)
    image_bytes = base64.b64decode(cleaned)
    image = Image.open(io.BytesIO(image_bytes))
    image = image.convert("RGB")
    np_img = np.array(image)
    # Convert RGB to BGR for OpenCV compatibility
    return np_img[:, :, ::-1].copy()

def cv2_to_base64(cv2_img: np.ndarray, format: str = "PNG") -> str:
    """Encodes an OpenCV BGR or Grayscale image to a base64 data URI string."""
    if len(cv2_img.shape) == 3:
        rgb_img = cv2_img[:, :, ::-1]
    else:
        rgb_img = cv2_img
    pil_img = Image.fromarray(rgb_img)
    buffer = io.BytesIO()
    pil_img.save(buffer, format=format)
    encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/{format.lower()};base64,{encoded}"

def bytes_to_base64(data: bytes, mime_type: str = "image/png") -> str:
    """Encodes raw binary data to a data URI string."""
    encoded = base64.b64encode(data).decode("utf-8")
    return f"data:{mime_type};base64,{encoded}"

def save_temp_file(content: bytes, prefix: str = "scan_", suffix: str = ".png") -> str:
    """Saves arbitrary binary bytes to a secure temporary file on disk and returns its path."""
    with tempfile.NamedTemporaryFile(prefix=prefix, suffix=suffix, delete=False) as tmp:
        tmp.write(content)
        tmp.flush()
        return tmp.name

def read_file_bytes(file_path: str) -> bytes:
    """Reads all bytes from a file path."""
    with open(file_path, "rb") as f:
        return f.read()

def delete_file_safely(file_path: str) -> bool:
    """Deletes a file from disk safely, ignoring FileNotFound."""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except Exception:
        pass
    return False

def validate_image_file(file_bytes: bytes, filename: Optional[str] = None) -> Dict[str, Any]:
    """
    Validates that a file's content is a valid, readable image and within size limits.
    Returns metadata including width, height, format, and size.
    """
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise ValueError(f"File size exceeds maximum threshold of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB")
    
    if filename:
        ext = os.path.splitext(filename)[1].lower()
        if ext and ext not in ALLOWED_EXTENSIONS:
            raise ValueError(f"Unsupported file format '{ext}'. Permitted: {', '.join(ALLOWED_EXTENSIONS)}")

    try:
        with Image.open(io.BytesIO(file_bytes)) as img:
            width, height = img.size
            img_format = img.format or "UNKNOWN"
            return {
                "valid": True,
                "width": width,
                "height": height,
                "format": img_format,
                "size_bytes": len(file_bytes)
            }
    except Exception as e:
        raise ValueError(f"Failed to decode image content: {str(e)}")

def get_image_dimensions(img_bytes: bytes) -> Tuple[int, int]:
    """Retrieves (width, height) without loading the full image into RAM."""
    with Image.open(io.BytesIO(img_bytes)) as img:
        return img.size
