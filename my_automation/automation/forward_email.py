import base64
from email.mime.text import MIMEText

MANAGER_EMAIL = "manager@yourcompany.com"

def forward_to_manager(service, email):
    sender = email.get("from", "")
    subject = email.get("subject", "(No Subject)")
    body = email.get("body", "")
    forward_body = f"Customer email needs attention.\n\nFROM: {sender}\nSUBJECT: {subject}\n\n{body}\n\nPlease reply to: {sender}"
    msg = MIMEText(forward_body, "plain")
    msg["To"] = MANAGER_EMAIL
    msg["Subject"] = f"[Action Required] {subject}"
    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode("utf-8")
    service.users().messages().send(userId="me", body={"raw": raw}).execute()
    print(f"Forwarded to manager: {subject}")
