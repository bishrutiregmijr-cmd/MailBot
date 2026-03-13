from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
KNOWLEDGE_FILE = BASE_DIR / "source.txt"

def load_knowledge_text() -> str:
    if not KNOWLEDGE_FILE.exists():
        return ""

    return KNOWLEDGE_FILE.read_text(
        encoding="utf-8",
        errors="ignore"
    ).strip()
