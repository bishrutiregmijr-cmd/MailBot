# automation/views.py
# REPLACE your current views.py with this
#
# This is the main entry point — it ties together:
#   gmail_trigger  →  analyzer  →  send_reply / forward_email
#
# Call process_emails() from your Django view, management command, or scheduler.

import json
import os

from django.http import JsonResponse
from django.views.decorators.http import require_GET

from .gmail_auth      import get_gmail_service
from .gmail_trigger   import gmail_trigger
from .analyzer        import analyze_email, EmailDecision
from .send_reply      import send_reply
from .forward_email   import forward_to_manager

# ─── PROCESSED EMAIL TRACKING ─────────────────────────────────────────────────
# Prevents the agent from processing the same email twice
PROCESSED_FILE = os.path.join(os.path.dirname(__file__), "processed_ids.json")

def load_processed() -> set:
    if os.path.exists(PROCESSED_FILE):
        with open(PROCESSED_FILE) as f:
            return set(json.load(f))
    return set()

def save_processed(processed: set):
    with open(PROCESSED_FILE, "w") as f:
        json.dump(list(processed), f)


# ─── MARK EMAIL AS READ ───────────────────────────────────────────────────────
def mark_as_read(service, msg_id: str):
    service.users().messages().modify(
        userId="me",
        id=msg_id,
        body={"removeLabelIds": ["UNREAD"]}
    ).execute()


# ─── CORE PROCESSING LOOP ─────────────────────────────────────────────────────
def process_emails():
    """
    Main agent loop:
      1. Fetch unread emails via gmail_trigger
      2. For each email, ask analyzer to decide: reply / forward / ignore
      3. Execute the decision using send_reply or forward_to_manager
      4. Mark email as read and save its ID so it's never processed again
    """
    print("\n🤖 Processing emails...\n" + "=" * 45)

    service       = get_gmail_service()
    processed_ids = load_processed()
    emails        = gmail_trigger(max_results=10)

    if not emails:
        print("📭 No new emails.")
        return {"processed": 0, "results": []}

    results = []

    for email in emails:
        msg_id = email.get("id")

        # Skip if already handled
        if msg_id in processed_ids:
            continue

        subject = email.get("subject", "(No Subject)")
        sender  = email.get("from", "unknown")
        print(f"\n📧 From    : {sender}")
        print(f"   Subject : {subject}")

        # ── Ask Gemini what to do ─────────────────────────────────────────────
        decision = analyze_email(email)

        if decision.action == EmailDecision.IGNORE:
            # Spam or irrelevant — do nothing, just mark read
            result = "ignored"

        elif decision.action == EmailDecision.FORWARD:
            # Question outside PDF scope — forward to manager
            forward_to_manager(service, email, reason="outside PDF scope")
            result = "forwarded"

        elif decision.action == EmailDecision.REPLY:
            # Answer found in PDF — send reply in same thread
            send_reply(service, email, decision.reply_text)
            result = "replied"

        else:
            result = "unknown"

        # Mark read + track as processed
        mark_as_read(service, msg_id)
        processed_ids.add(msg_id)

        results.append({
            "id":      msg_id,
            "from":    sender,
            "subject": subject,
            "action":  result,
        })

    save_processed(processed_ids)
    print(f"\n✅ Done. Processed {len(results)} email(s).")
    return {"processed": len(results), "results": results}


# ─── DJANGO VIEW (optional — lets you trigger via HTTP or admin) ──────────────
@require_GET
def run_agent_view(request):
    """
    GET /automation/run/
    Triggers the email agent manually from browser or cron webhook.
    """
    result = process_emails()
    return JsonResponse(result)