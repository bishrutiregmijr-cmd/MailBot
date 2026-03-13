import os
import base64
import time
from bs4 import BeautifulSoup
from .gmail_auth import get_gmail_service

LAST_ID_FILE = os.path.join(os.path.dirname(__file__), "last_email_id.txt")

def read_last_id():
    if os.path.exists(LAST_ID_FILE):
        with open(LAST_ID_FILE, "r") as f:
            return f.read().strip()
    return None

def write_last_id(msg_id):
    with open(LAST_ID_FILE, "w") as f:
        f.write(msg_id)

def decode_data(data):
    try:
        return base64.urlsafe_b64decode(data).decode("utf-8", errors="ignore")
    except Exception:
        return ""

def extract_body_recursive(parts):
    for part in parts:
        mime_type = part.get("mimeType")
        data = part.get("body", {}).get("data")
        subparts = part.get("parts", [])

        if mime_type == "text/plain" and data:
            return decode_data(data)

        if mime_type == "text/html" and data:
            html = decode_data(data)
            return BeautifulSoup(html, "html.parser").get_text()

        if subparts:
            result = extract_body_recursive(subparts)
            if result:
                return result
    return ""

def extract_body(message):
    payload = message.get("payload", {})
    body_data = payload.get("body", {}).get("data")

    if body_data:
        return decode_data(body_data)

    parts = payload.get("parts", [])
    if parts:
        return extract_body_recursive(parts)

    return ""

def has_attachments(message):
    parts = message.get("payload", {}).get("parts", [])
    for part in parts:
        if part.get("filename") and part.get("body", {}).get("attachmentId"):
            return True
    return False

def gmail_trigger(max_results=10):
    service = get_gmail_service()
    last_id = read_last_id()
    now_ms = int(time.time() * 1000)
    cutoff_ms = now_ms - (24 * 60 * 60 * 1000)

    results = service.users().messages().list(
        userId="me",
        labelIds=["INBOX", "UNREAD"],
        maxResults=max_results
    ).execute()

    messages = results.get("messages", [])
    emails = []

    for msg in messages:
        detail = service.users().messages().get(
            userId="me",
            id=msg["id"],
            format="full"
        ).execute()

        if detail.get("internalDate") and int(detail["internalDate"]) < cutoff_ms:
            continue  # skip old emails

        headers = detail["payload"]["headers"]
        data = {h["name"]: h["value"] for h in headers}
        time_str = next((h["value"] for h in headers if h["name"].lower() == "date"), "(No date found)")

        emails.append({
            "id": msg["id"],
            "from": data.get("From"),
            "subject": data.get("Subject"),
            "time": time_str,
            "body": extract_body(detail),
            "has_attachments": has_attachments(detail)
        })

    if messages:
        write_last_id(messages[0]["id"])

    return emails




