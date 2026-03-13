code = '''import base64
from email.mime.text import MIMEText

MANAGER_EMAIL = "manager@yourcompany.com"

def forward_to_manager(service, email):
    sender  = email.get("from", "")
    subject = email.get("subject", "(No Subject)")
    body    = email.get("body", "")
    forward_body = (
        f"Customer email needs attention (outside PDF scope).\\n\\n"
        f"FROM: {sender}\\nSUBJECT: {subject}\\n\\n{body}\\n\\n"
        f"Please reply directly to: {sender}"
    )
    msg = MIMEText(forward_body, "plain")
    msg["To"]      = MANAGER_EMAIL
    msg["Subject"] = f"[Action Required] {subject}"
    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode("utf-8")
    service.users().messages().send(userId="me", body={"raw": raw}).execute()
    print(f"Forwarded to manager: {subject}")
'''

with open(r'C:\Users\advwo\OneDrive\Desktop\Gmail_Project\my_automation\automation\forward_email.py', 'w') as f:
    f.write(code)
print("Done!")