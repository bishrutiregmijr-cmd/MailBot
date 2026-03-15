import json
import os

from django.http import JsonResponse, HttpResponseRedirect
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .gmail_auth import (
    get_gmail_service, get_auth_flow, save_token_from_code, get_credentials,
    get_gmail_service_for_client, save_token_for_client
)
from .gmail_trigger import gmail_trigger
from .analyzer import analyze_email, EmailDecision
from .send_reply import send_reply
from .forward_email import forward_to_manager

PROCESSED_FILE = os.path.join(os.path.dirname(__file__), "processed_ids.json")
RESULTS_FILE   = os.path.join(os.path.dirname(__file__), "email_results.json")


def load_processed() -> set:
    if os.path.exists(PROCESSED_FILE):
        with open(PROCESSED_FILE) as f:
            return set(json.load(f))
    return set()


def save_processed(processed: set):
    with open(PROCESSED_FILE, "w") as f:
        json.dump(list(processed), f)


def mark_as_read(service, msg_id: str):
    service.users().messages().modify(
        userId="me",
        id=msg_id,
        body={"removeLabelIds": ["UNREAD"]}
    ).execute()


# ── OAUTH: Step 1 — Redirect to Google login ─────────────────────────────────
@require_GET
def gmail_trigger_view(request):
    creds = get_credentials()
    if not creds:
        flow = get_auth_flow()
        auth_url, _ = flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
            prompt="consent",
        )
        return HttpResponseRedirect(auth_url)
    result = process_emails_for_all_clients()
    return JsonResponse(result)


# ── OAUTH: Step 2 — Google callback ──────────────────────────────────────────
@require_GET
def oauth_callback(request):
    code  = request.GET.get("code")
    error = request.GET.get("error")

    if error:
        return JsonResponse({"error": f"OAuth denied: {error}"}, status=400)
    if not code:
        return JsonResponse({"error": "No code received from Google"}, status=400)

    try:
        save_token_from_code(code)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

    result = process_emails_for_all_clients()
    return JsonResponse(result)


# ── PROCESS EMAILS FOR ONE CLIENT ────────────────────────────────────────────
def process_emails_for_client(client, gmail_account):
    print(f"\n🤖 Processing emails for {client.company_name} ({gmail_account.email})")

    try:
        service = get_gmail_service_for_client(gmail_account)
    except Exception as e:
        print(f"❌ Auth failed for {gmail_account.email}: {e}")
        return []

    processed_ids = load_processed()
    emails        = gmail_trigger(max_results=10)

    if not emails:
        print(f"📭 No new emails for {gmail_account.email}")
        return []

    results = []

    for email in emails:
        msg_id = email.get("id")
        if msg_id in processed_ids:
            continue

        subject = email.get("subject", "(No Subject)")
        sender  = email.get("from",    "unknown")

        print(f"📧 From: {sender} | Subject: {subject}")

        decision = analyze_email(email, client=client)

        if decision.action == EmailDecision.IGNORE:
            result = "ignored"
        elif decision.action == EmailDecision.FORWARD:
            forward_to_manager(service, email, reason="outside PDF scope")
            result = "forwarded"
        elif decision.action == EmailDecision.REPLY:
            send_reply(service, email, decision.reply_text)
            result = "replied"
        else:
            result = "unknown"

        try:
            from .models import ProcessedEmail
            ProcessedEmail.objects.get_or_create(
                message_id = msg_id,
                defaults   = {
                    "client":  client,
                    "gmail":   gmail_account,
                    "sender":  sender,
                    "subject": subject,
                    "action":  result,
                    "details": decision.reply_text if result == "replied" else "",
                }
            )
        except Exception as e:
            print(f"⚠️ DB save failed: {e}")

        mark_as_read(service, msg_id)
        processed_ids.add(msg_id)
        results.append({
            "id":      msg_id,
            "from":    sender,
            "subject": subject,
            "action":  result,
            "client":  client.email,
        })

    save_processed(processed_ids)
    return results


# ── PROCESS ALL ACTIVE CLIENTS ────────────────────────────────────────────────
def process_emails_for_all_clients():
    from .models import Client, GmailAccount

    all_results = []
    clients = Client.objects.filter(is_approved=True, bot_active=True)

    if not clients.exists():
        print("⚠️ No active clients found — using default token")
        return process_emails_default()

    for client in clients:
        try:
            gmail_account = client.gmail_account
            if not gmail_account.is_authorized:
                print(f"⚠️ {client.email} Gmail not authorized — skipping")
                continue
            results = process_emails_for_client(client, gmail_account)
            all_results.extend(results)
        except GmailAccount.DoesNotExist:
            print(f"⚠️ No Gmail account for {client.email} — skipping")

    with open(RESULTS_FILE, "w") as f:
        json.dump(all_results, f)

    return {"processed": len(all_results), "results": all_results}


# ── FALLBACK: DEFAULT SINGLE TOKEN ───────────────────────────────────────────
def process_emails_default():
    try:
        service = get_gmail_service()
    except Exception as e:
        return {"error": str(e), "processed": 0, "results": []}

    processed_ids = load_processed()
    emails        = gmail_trigger(max_results=10)

    if not emails:
        return {"processed": 0, "results": []}

    results = []

    for email in emails:
        msg_id = email.get("id")
        if msg_id in processed_ids:
            continue

        subject  = email.get("subject", "(No Subject)")
        sender   = email.get("from",    "unknown")
        decision = analyze_email(email)

        if decision.action == EmailDecision.IGNORE:
            result = "ignored"
        elif decision.action == EmailDecision.FORWARD:
            forward_to_manager(service, email, reason="outside PDF scope")
            result = "forwarded"
        elif decision.action == EmailDecision.REPLY:
            send_reply(service, email, decision.reply_text)
            result = "replied"
        else:
            result = "unknown"

        mark_as_read(service, msg_id)
        processed_ids.add(msg_id)
        results.append({
            "id":      msg_id,
            "from":    sender,
            "subject": subject,
            "action":  result,
        })

    save_processed(processed_ids)

    with open(RESULTS_FILE, "w") as f:
        json.dump(results, f)

    return {"processed": len(results), "results": results}


# ── ORIGINAL API ENDPOINTS ────────────────────────────────────────────────────
@require_GET
def get_logs(request):
    if os.path.exists(RESULTS_FILE):
        with open(RESULTS_FILE) as f:
            results = json.load(f)
    else:
        try:
            from .models import ProcessedEmail
            emails  = ProcessedEmail.objects.all()[:50]
            results = [{
                "from":    e.sender,
                "subject": e.subject,
                "action":  e.action,
                "client":  e.client.email if e.client else "",
            } for e in emails]
        except Exception:
            results = []
    return JsonResponse(results, safe=False)


@require_GET
def run_agent(request):
    result = process_emails_for_all_clients()
    return JsonResponse(result)


@require_GET
def get_stats(request):
    try:
        from .models import ProcessedEmail, Client
        return JsonResponse({
            "replied":   ProcessedEmail.objects.filter(action="replied").count(),
            "forwarded": ProcessedEmail.objects.filter(action="forwarded").count(),
            "ignored":   ProcessedEmail.objects.filter(action="ignored").count(),
            "clients":   Client.objects.filter(bot_active=True).count(),
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ═════════════════════════════════════════════════════════════════════════════
# NEW API VIEWS
# ═════════════════════════════════════════════════════════════════════════════

# ── List & Create Clients ─────────────────────────────────────────────────────
@csrf_exempt
@require_http_methods(["GET", "POST"])
def clients_view(request):
    from .models import Client
    if request.method == "GET":
        clients = Client.objects.all()
        data = [{
            "id":           c.id,
            "full_name":    c.full_name,
            "company_name": c.company_name,
            "email":        c.email,
            "is_approved":  c.is_approved,
            "bot_active":   c.bot_active,
            "created_at":   c.created_at.isoformat(),
            "pdf_count":    c.pdfs.count(),
        } for c in clients]
        return JsonResponse(data, safe=False)

    if request.method == "POST":
        try:
            body   = json.loads(request.body)
            email  = body.get("email", "").strip()
            if not email:
                return JsonResponse({"error": "Email is required"}, status=400)

            # Check if already exists
            from .models import Client
            existing = Client.objects.filter(email=email).first()
            if existing:
                return JsonResponse({"error": "An account with this email already exists."}, status=400)

            client = Client.objects.create(
                full_name    = body.get("full_name", ""),
                company_name = body.get("company_name", ""),
                email        = email,
            )
            return JsonResponse({
                "id":           client.id,
                "email":        client.email,
                "full_name":    client.full_name,
                "company_name": client.company_name,
                "is_approved":  client.is_approved,
                "bot_active":   client.bot_active,
            }, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)


# ── Approve / Toggle Client ───────────────────────────────────────────────────
@csrf_exempt
@require_http_methods(["POST"])
def approve_client(request, client_id):
    from .models import Client
    try:
        client = Client.objects.get(id=client_id)
        data   = json.loads(request.body) if request.body else {}
        if "is_approved" in data:
            client.is_approved = data["is_approved"]
        if "bot_active" in data:
            client.bot_active = data["bot_active"]
        client.save()
        return JsonResponse({
            "id":          client.id,
            "is_approved": client.is_approved,
            "bot_active":  client.bot_active,
        })
    except Client.DoesNotExist:
        return JsonResponse({"error": "Client not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


# ── Upload & List PDFs ────────────────────────────────────────────────────────
@csrf_exempt
@require_http_methods(["GET", "POST"])
def client_pdfs(request, client_id):
    from .models import Client, ClientPDF
    try:
        client = Client.objects.get(id=client_id)
    except Client.DoesNotExist:
        return JsonResponse({"error": "Client not found"}, status=404)

    if request.method == "GET":
        pdfs = client.pdfs.all()
        data = [{
            "id":          p.id,
            "title":       p.title,
            "file_url":    request.build_absolute_uri(p.file.url),
            "uploaded_at": p.uploaded_at.isoformat(),
        } for p in pdfs]
        return JsonResponse(data, safe=False)

    if request.method == "POST":
        file  = request.FILES.get("file")
        title = request.POST.get("title", "")
        if not file:
            return JsonResponse({"error": "No file provided"}, status=400)
        if not title:
            title = file.name.replace(".pdf", "")
        pdf = ClientPDF.objects.create(client=client, title=title, file=file)
        return JsonResponse({
            "id":          pdf.id,
            "title":       pdf.title,
            "file_url":    request.build_absolute_uri(pdf.file.url),
            "uploaded_at": pdf.uploaded_at.isoformat(),
        }, status=201)


# ── Delete PDF ────────────────────────────────────────────────────────────────
@csrf_exempt
@require_http_methods(["DELETE"])
def delete_pdf(request, client_id, pdf_id):
    from .models import ClientPDF
    try:
        pdf = ClientPDF.objects.get(id=pdf_id, client_id=client_id)
        pdf.file.delete(save=False)
        pdf.delete()
        return JsonResponse({"deleted": True})
    except ClientPDF.DoesNotExist:
        return JsonResponse({"error": "PDF not found"}, status=404)


# ── Client Email History ──────────────────────────────────────────────────────
@require_GET
def client_emails(request, client_id):
    from .models import Client
    try:
        client = Client.objects.get(id=client_id)
        emails = client.processed_emails.all()[:50]
        data   = [{
            "id":           e.id,
            "sender":       e.sender,
            "subject":      e.subject,
            "action":       e.action,
            "details":      e.details,
            "processed_at": e.processed_at.isoformat(),
        } for e in emails]
        return JsonResponse(data, safe=False)
    except Client.DoesNotExist:
        return JsonResponse({"error": "Client not found"}, status=404)


# ── Knowledge Base Preview ────────────────────────────────────────────────────
@require_GET
def client_knowledge_base(request, client_id):
    from .models import Client
    from .knowledge_base.knowledge_loader import load_knowledge_for_client
    try:
        client = Client.objects.get(id=client_id)
        text   = load_knowledge_for_client(client)
        return JsonResponse({
            "client_id":   client_id,
            "pdf_count":   client.pdfs.count(),
            "text_length": len(text),
            "preview":     text[:500] if text else "No PDFs uploaded yet.",
        })
    except Client.DoesNotExist:
        return JsonResponse({"error": "Client not found"}, status=404)