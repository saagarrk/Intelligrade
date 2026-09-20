"""
Image utility re-exports pointing to centralized file_utils module.
"""
from .file_utils import (
    clean_base64_string,
    base64_to_cv2,
    cv2_to_base64,
    bytes_to_base64,
    validate_image_file,
    get_image_dimensions
)
