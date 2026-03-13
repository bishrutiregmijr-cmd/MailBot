# automation/analyzer.py
# REPLACE your current analyzer.py with this
#
# What this does:
#   1. Loads all PDFs from knowledge_base/ folder as the ONLY knowledge source
#   2. Uses Gemini to decide: REPLY / FORWARD_TO_MANAGER / IGNORE
#   3. Returns structured decision so views.py can act on it

import os
import pathlib
import PyPDF2
import google.generativeai as genai

# ─── CONFIG ───────────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "your-gemini-api-key-here")
PDF_FOLDER     = pathlib.Path(__file__).parent / "knowledge_base"  # automation/knowledge_base/

genai.configure(api_key=GEMINI_API_KEY) 
gemini_model = genai.GenerativeModel("gemini-1.5-flash")

# ─── PDF LOADER (cached so we don't re-read on every email) ──────────────────
_pdf_context_cache = None

def load_pdf_context() -> str:
    """
    Reads all PDFs from the knowledge_base/ folder.
    Result is cached in memory after first load.
    """
    global _pdf_context_cache
    if _pdf_context_cache is not None:
        return _pdf_context_cache

    if not PDF_FOLDER.exists():
        print(f"⚠️  knowledge_base/ folder not found at {PDF_FOLDER}. Creating it...")
        PDF_FOLDER.mkdir(parents=True)
        _pdf_context_cache = ""
        return ""

    all_text = []
    for pdf_file in sorted(PDF_FOLDER.glob("*.pdf")):
        print(f"📄 Loading: {pdf_file.name}")
        try:
            with open(pdf_file, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                text = "".join(page.extract_text() or "" for page in reader.pages)
                all_text.append(f"=== {pdf_file.name} ===\n{text}")
        except Exception as e:
            print(f"❌ Could not read {pdf_file.name}: {e}")

    _pdf_context_cache = "\n\n".join(all_text)
    print(f"✅ Loaded {len(all_text)} PDF(s) into context.\n")
    return _pdf_context_cache


def reload_pdf_context():
    """Call this if you add new PDFs and want the agent to pick them up."""
    global _pdf_context_cache
    _pdf_context_cache = None
    return load_pdf_context()


# ─── GEMINI PROMPT ────────────────────────────────────────────────────────────
PROMPT_TEMPLATE = """You are a professional email assistant for a company.
You answer customer questions ONLY using the company PDF documents provided below.

YOUR STRICT RULES:
1. If the question CAN be answered from the PDF content → write a polite, professional reply.
2. If the question CANNOT be answered from the PDF content → respond with exactly: FORWARD_TO_MANAGER
3. If the email is spam, promotional, auto-reply, out-of-office, or not a real question → respond with exactly: IGNORE
4. NEVER invent, guess, or assume information not explicitly in the PDFs.
5. NEVER discuss topics, pricing, policies, or features not mentioned in the PDFs.
6. Keep replies concise and professional (3-6 sentences is ideal).

━━━━━━ COMPANY PDF KNOWLEDGE BASE ━━━━━━
{pdf_context}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Customer email:
Subject: {subject}
Message: {body}

Your response (either the reply text, FORWARD_TO_MANAGER, or IGNORE):"""


# ─── DECISION RESULT ──────────────────────────────────────────────────────────
class EmailDecision:
    REPLY   = "reply"
    FORWARD = "forward"
    IGNORE  = "ignore"

    def __init__(self, action: str, reply_text: str = ""):
        self.action     = action      # "reply" | "forward" | "ignore"
        self.reply_text = reply_text  # only set when action == "reply"

    def __repr__(self):
        return f"EmailDecision(action={self.action!r})"


# ─── MAIN ANALYSIS FUNCTION ───────────────────────────────────────────────────
def analyze_email(email: dict) -> EmailDecision:
    """
    Analyses an incoming email and returns an EmailDecision.

    Args:
        email : dict with at least 'subject' and 'body' keys
                (the format returned by gmail_trigger)

    Returns:
        EmailDecision with .action = "reply" | "forward" | "ignore"
        If action is "reply", .reply_text contains the message to send.
    """
    pdf_context = load_pdf_context()

    if not pdf_context.strip():
        print("   ⚠️  No PDF context — forwarding to manager by default.")
        return EmailDecision(EmailDecision.FORWARD)

    subject = email.get("subject", "")
    body    = email.get("body", "").strip()

    if not body:
        print("   ⏭️  Empty email body — ignoring.")
        return EmailDecision(EmailDecision.IGNORE)

    prompt = PROMPT_TEMPLATE.format(
        pdf_context = pdf_context[:28000],  # stay within Gemini context safely
        subject     = subject,
        body        = body[:3000],          # cap very long emails
    )

    try:
        response = gemini_model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature     = 0.1,   # low = more focused, less hallucination
                max_output_tokens = 800,
            )
        )
        result = response.text.strip()

    except Exception as e:
        print(f"   ❌ Gemini error: {e} — forwarding to manager as fallback.")
        return EmailDecision(EmailDecision.FORWARD)

    # ── Interpret Gemini's response ───────────────────────────────────────────
    result_upper = result.upper()

    if result_upper == "IGNORE" or result_upper.startswith("IGNORE"):
        print(f"   🚫 IGNORE — spam/irrelevant")
        return EmailDecision(EmailDecision.IGNORE)

    if result_upper == "FORWARD_TO_MANAGER" or "FORWARD_TO_MANAGER" in result_upper:
        print(f"   📨 FORWARD — question outside PDF scope")
        return EmailDecision(EmailDecision.FORWARD)

    # Anything else is a real reply
    print(f"   💬 REPLY — answered from PDF")
    return EmailDecision(EmailDecision.REPLY, reply_text=result)