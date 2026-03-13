from pathlib import Path
import fitz  # PyMuPDF

BASE_DIR = Path(__file__).resolve().parent
PDF_FILE = BASE_DIR / "source.pdf"
TXT_FILE = BASE_DIR / "source.txt"

def pdf_to_text():
    if not PDF_FILE.exists():
        print("❌ source.pdf NOT FOUND")
        return

    text = ""

    with fitz.open(PDF_FILE) as doc:
        for page in doc:
            text += page.get_text()

    if not text.strip():
        print("PDF found but NO TEXT extracted (likely scanned PDF)")
        return

    TXT_FILE.write_text(text, encoding="utf-8", errors="ignore")
    print(f"Extracted {len(text)} characters into source.txt")

if __name__ == "__main__":
    pdf_to_text()


