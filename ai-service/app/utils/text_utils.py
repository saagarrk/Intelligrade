import re
import string
from typing import List, Set

STOP_WORDS: Set[str] = {
    "a", "an", "the", "and", "or", "in", "on", "at", "to", "for", "with",
    "by", "about", "against", "between", "into", "through", "during", "before",
    "after", "above", "below", "from", "up", "down", "is", "are", "was",
    "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "but", "if", "or", "because", "as", "until", "while", "of", "it", "this"
}

def tokenize(text: str) -> List[str]:
    """Tokenizes text into cleaned lower-case tokens excluding stopwords and punctuation."""
    if not text:
        return []
    # Remove punctuation
    translator = str.maketrans(string.punctuation, ' ' * len(string.punctuation))
    cleaned = text.translate(translator).lower()
    words = cleaned.split()
    return [w for w in words if len(w) > 2 and w not in STOP_WORDS]

def calculate_jaccard_similarity(tokens1: List[str], tokens2: List[str]) -> float:
    """Computes Jaccard word set intersection over union."""
    s1, s2 = set(tokens1), set(tokens2)
    if not s1 or not s2:
        return 0.0
    intersection = len(s1.intersection(s2))
    union = len(s1.union(s2))
    return float(intersection / union) if union > 0 else 0.0
