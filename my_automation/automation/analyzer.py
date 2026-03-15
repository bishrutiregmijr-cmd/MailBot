# automation/analyzer.py

import os
import pathlib
import PyPDF2
from google import genai
from google.genai import types

# ── CONFIG ───────────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

client_genai = genai.Client(api_key=GEMINI_API_KEY)


# ── PDF LOADER FROM DATABASE ─────────────────────────────────────────────────
def load_pdf_context_for_client(client=None) -> str:
    """
    Reads all PDFs uploaded for a specific client from the database.
    Falls back to knowledge_base/ folder if no client is given.
    """
    all_text = []

    if client is not None:
        # Load PDFs from database for this client
        try:
            from .models import ClientPDF
            pdfs = ClientPDF.objects.filter(client=client)
            for pdf_obj in pdfs:
                print(f"📄 Loading from DB: {pdf_obj.title}")
                try:
                    with open(pdf_obj.file.path, "rb") as f:
                        reader = PyPDF2.PdfReader(f)
                        text = "".join(page.extract_text() or "" for page in reader.pages)
                        all_text.append(f"=== {pdf_obj.title} ===\n{text}")
                except Exception as e:
                    print(f"❌ Could not read {pdf_obj.title}: {e}")
        except Exception as e:
            print(f"❌ Database error loading PDFs: {e}")
    else:
        # Fallback: load from knowledge_base/ folder
        PDF_FOLDER = pathlib.Path(__file__).parent / "knowledge_base"
        if PDF_FOLDER.exists():
            for pdf_file in sorted(PDF_FOLDER.glob("*.pdf")):
                print(f"📄 Loading from folder: {pdf_file.name}")
                try:
                    with open(pdf_file, "rb") as f:
                        reader = PyPDF2.PdfReader(f)
                        text = "".join(page.extract_text() or "" for page in reader.pages)
                        all_text.append(f"=== {pdf_file.name} ===\n{text}")
                except Exception as e:
                    print(f"❌ Could not read {pdf_file.name}: {e}")

    context = "\n\n".join(all_text)
    print(f"✅ Loaded {len(all_text)} PDF(s) into context.\n")
    return context


# ── GEMINI PROMPT ─────────────────────────────────────────────────────────────
PROMPT_TEMPLATE = """You are a professional email assistant for a company.
You answer customer questions ONLY using the company PDF documents provided below.

YOUR STRICT RULES:
1. If the question CAN be answered from the PDF content → write a polite, professional reply.
2. If the question CANNOT be answered from the PDF content → respond with exactly: FORWARD_TO_MANAGER
3. If the email is spam, promotional, auto-reply, out-of-office, or not a real question → respond with exactly: IGNORE
4. NEVER invent, guess, or assume information not explicitly in the PDFs.
5. NEVER discuss topics, pricing, policies, or features not mentioned in the PDFs.
6. Keep replies concise and professional (3-6 sentences is ideal).

══════════════ COMPANY PDF KNOWLEDGE BASE ══════════════
{pdf_context}
════════════════════════════════════════════════════════

Customer email:
Subject: {subject}
Message: {body}

Your response (either the reply text, FORWARD_TO_MANAGER, or IGNORE):"""


# ── DECISION RESULT ───────────────────────────────────────────────────────────
class EmailDecision:
    REPLY   = "reply"
    FORWARD = "forward"
    IGNORE  = "ignore"

    def __init__(self, action: str, reply_text: str = ""):
        self.action     = action
        self.reply_text = reply_text

    def __repr__(self):
        return f"EmailDecision(action={self.action!r})"


# ── MAIN ANALYSIS FUNCTION ────────────────────────────────────────────────────
def analyze_email(email: dict, client=None) -> EmailDecision:
    """
    Analyses an incoming email and returns an EmailDecision.

    Args:
        email  : dict with at least 'subject' and 'body' keys
        client : Client model instance (optional) — loads their PDFs from DB

    Returns:
        EmailDecision with .action = "reply" | "forward" | "ignore"
    """
    pdf_context = load_pdf_context_for_client(client=client)

    if not pdf_context.strip():
        print("   ⚠️  No PDF context — forwarding to manager by default.")
        return EmailDecision(EmailDecision.FORWARD)

    subject = email.get("subject", "")
    body    = email.get("body", "").strip()

    if not body:
        print("   🔕  Empty email body — ignoring.")
        return EmailDecision(EmailDecision.IGNORE)

    prompt = PROMPT_TEMPLATE.format(
        pdf_context = pdf_context[:28000],
        subject     = subject,
        body        = body[:3000],
    )

    try:
        response = client_genai.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.1,
                max_output_tokens=800,
            )
        )
        result = response.text.strip()

    except Exception as e:
        print(f"   ❌ Gemini error: {e} — forwarding to manager as fallback.")
        return EmailDecision(EmailDecision.FORWARD)

    result_upper = result.upper()

    if result_upper == "IGNORE" or result_upper.startswith("IGNORE"):
        print(f"   🚽 IGNORE — spam/irrelevant")
        return EmailDecision(EmailDecision.IGNORE)

    if result_upper == "FORWARD_TO_MANAGER" or "FORWARD_TO_MANAGER" in result_upper:
        print(f"   📩 FORWARD — question outside PDF scope")
        return EmailDecision(EmailDecision.FORWARD)

    print(f"   💬 REPLY — answered from PDF")
    return EmailDecision(EmailDecision.REPLY, reply_text=result)