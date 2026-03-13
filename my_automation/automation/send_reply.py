# import base64
# from .gmail_auth import get_gmail_service

# def send_reply(original_email, reply_text):
#     """
#     Sends a reply to a Gmail message using Gmail API.
#     original_email: dict containing 'from' and 'id'
#     reply_text: string
#     """
#     service = get_gmail_service()

#     message = (
#         "Content-Type: text/plain; charset=UTF-8\n"
#         "MIME-Version: 1.0\n"
#         f"From: me\n"
#         f"To: {original_email['from']}\n"
#         f"Subject: Re: {original_email['subject']}\n"
#         f"In-Reply-To: {original_email['id']}\n"
#         f"References: {original_email['id']}\n\n"
#         f"{reply_text}"
#     )

#     raw = base64.urlsafe_b64encode(message.encode("utf-8")).decode("ascii")

#     service.users().messages().send(
#         userId="me",
#         body={"raw": raw}
#     ).execute()

#     return True



# Final Code
# import base64
# from .gmail_auth import get_gmail_service

# def send_reply(original_email, reply_text):
#     """
#     Sends a reply to a Gmail message using Gmail API.
#     Requires 'from' and 'id' in original_email.
#     """
#     service = get_gmail_service()

#     message = (
#         "Content-Type: text/plain; charset=UTF-8\n"
#         "MIME-Version: 1.0\n"
#         f"From: me\n"
#         f"To: {original_email['from']}\n"
#         f"Subject: Re: {original_email['subject']}\n"
#         f"In-Reply-To: {original_email['id']}\n"
#         f"References: {original_email['id']}\n\n"
#         f"{reply_text}"
#     )

#     raw = base64.urlsafe_b64encode(message.encode("utf-8")).decode("ascii")

#     service.users().messages().send(
#         userId="me",
#         body={"raw": raw}
#     ).execute()

#     return True


# automation/send_reply.py

# import base64
# from .gmail_auth import get_gmail_service

# def send_reply(original_email, reply_text):
#     """
#     Send a reply to the SENDER of the email.
#     """
#     service = get_gmail_service()

#     message = (
#         f"From: me\n"
#         f"To: {original_email['from']}\n"  # <-- send to sender
#         f"Subject: {original_email['subject']}\n"
#         f"In-Reply-To: {original_email.get('id')}\n"
#         f"References: {original_email.get('id')}\n\n"
#         f"{reply_text}"
#     )

#     raw_bytes = message.encode("utf-8")
#     raw = base64.urlsafe_b64encode(raw_bytes).decode("ascii")

#     service.users().messages().send(
#         userId="me",
#         body={"raw": raw}
#     ).execute()

#     return True



# import base64
# from .gmail_auth import get_gmail_service

# def send_reply(original_email, reply_text):
#     """
#     Send a reply to the original sender of the email.
#     """
#     service = get_gmail_service()

#     # Build the email
#     message = (
#         f"From: me\n"
#         f"To: {original_email['from']}\n"  # send to sender
#         f"Subject: Re: {original_email.get('subject', '')}\n"
#         f"In-Reply-To: {original_email.get('id')}\n"
#         f"References: {original_email.get('id')}\n\n"
#         f"{reply_text}"
#     )

#     raw_bytes = message.encode("utf-8")
#     raw = base64.urlsafe_b64encode(raw_bytes).decode("ascii")

#     service.users().messages().send(
#         userId="me",
#         body={"raw": raw}
#     ).execute()

#     return True



# import base64
# from .gmail_auth import get_gmail_service
# import re

# def send_reply(original_email, reply_text):
#     """
#     Send a reply to the sender of the email, using proper email headers.
#     """
#     service = get_gmail_service()

#     # Extract only email from "Name <email>" format
#     match = re.search(r"<(.+?)>", original_email["from"])
#     to_email = match.group(1) if match else original_email["from"]

#     message = (
#         f"From: me\n"
#         f"To: {to_email}\n"        # <-- send to sender's email
#         f"Subject: Re: {original_email['subject']}\n"
#         f"In-Reply-To: {original_email.get('id')}\n"
#         f"References: {original_email.get('id')}\n\n"
#         f"{reply_text}"
#     )

#     raw_bytes = message.encode("utf-8")
#     raw = base64.urlsafe_b64encode(raw_bytes).decode("ascii")

#     service.users().messages().send(
#         userId="me",
#         body={"raw": raw}
#     ).execute()

#     return True


# import base64
# from .gmail_auth import get_gmail_service
# import re

# LAST_REPLY_FILE = "last_replied_id.txt"

# def read_last_replied_id():
#     try:
#         with open(LAST_REPLY_FILE, "r") as f:
#             return f.read().strip()
#     except FileNotFoundError:
#         return None

# def write_last_replied_id(msg_id):
#     with open(LAST_REPLY_FILE, "w") as f:
#         f.write(msg_id)


# def send_reply(original_email, reply_text):
#     """
#     Send a reply to the sender of the email using proper headers.
#     Only reply if not already replied.
#     """
#     last_id = read_last_replied_id()
#     if last_id == original_email.get("id"):
#         return False  # already replied

#     service = get_gmail_service()

#     # Extract only the sender's email
#     match = re.search(r"<(.+?)>", original_email["from"])
#     to_email = match.group(1) if match else original_email["from"]

#     message = (
#         f"From: me\n"
#         f"To: {to_email}\n"
#         f"Subject: Re: {original_email['subject']}\n"
#         f"In-Reply-To: {original_email.get('id')}\n"
#         f"References: {original_email.get('id')}\n\n"
#         f"{reply_text}"
#     )

#     raw_bytes = message.encode("utf-8")
#     raw = base64.urlsafe_b64encode(raw_bytes).decode("ascii")

#     service.users().messages().send(
#         userId="me",
#         body={"raw": raw}
#     ).execute()

#     # Save this email ID as replied
#     write_last_replied_id(original_email.get("id"))
#     return True






# send_reply.py
# import base64
# from .gmail_auth import get_gmail_service
# import re

# def send_reply(original_email, reply_text):
#     """
#     Send a reply to the actual sender of the email.
#     Handles 'Name <email>' format correctly.
#     """
#     service = get_gmail_service()

#     # Extract only the sender's email from "Name <email>" format
#     from_field = original_email.get("from", "")
#     match = re.search(r"<(.+?)>", from_field)
#     to_email = match.group(1) if match else from_field.strip()

#     # Gmail requires 'me' in userId for sending from your account
#     message_text = (
#         f"From: me\n"
#         f"To: {to_email}\n"  # send to the actual sender
#         f"Subject: Re: {original_email.get('subject', '')}\n"
#         f"In-Reply-To: {original_email.get('id', '')}\n"
#         f"References: {original_email.get('id', '')}\n\n"
#         f"{reply_text}"
#     )

#     raw_bytes = message_text.encode("utf-8")
#     raw_base64 = base64.urlsafe_b64encode(raw_bytes).decode("ascii")

#     service.users().messages().send(
#         userId="me",
#         body={"raw": raw_base64}
#     ).execute()

#     return True







# send_reply.py
# import base64
# from .gmail_auth import get_gmail_service
# import re

# def send_reply(original_email, reply_text):
#     """
#     Send a reply to the actual sender of the email.
#     Handles 'Name <email>' format correctly.
#     """
#     service = get_gmail_service()

#     # Extract sender's email from "Name <email>"
#     from_field = original_email.get("from", "")
#     match = re.search(r"<(.+?)>", from_field)
#     to_email = match.group(1) if match else from_field.strip()

#     # Gmail requires 'me' in userId for sending from your account
#     message_text = (
#         f"From: me\n"
#         f"To: {to_email}\n"
#         f"Subject: Re: {original_email.get('subject', '')}\n"
#         f"In-Reply-To: {original_email.get('id', '')}\n"
#         f"References: {original_email.get('id', '')}\n\n"
#         f"{reply_text}"
#     )

#     raw_bytes = message_text.encode("utf-8")
#     raw_base64 = base64.urlsafe_b64encode(raw_bytes).decode("ascii")

#     service.users().messages().send(
#         userId="me",
#         body={"raw": raw_base64}
#     ).execute()

#     return True





# import base64
# import re
# from .gmail_auth import get_gmail_service

# def send_reply(original_email, reply_text):
#     """
#     Sends a proper reply to the sender so Gmail threads it correctly.
#     """
#     service = get_gmail_service()

#     # Extract only the sender's email from "Name <email>" format
#     from_field = original_email.get("from", "")
#     match = re.search(r"<(.+?)>", from_field)
#     to_email = match.group(1) if match else from_field.strip()

#     # Make sure subject has 'Re:' if not already
#     subject = original_email.get("subject", "")
#     if not subject.lower().startswith("re:"):
#         subject = f"Re: {subject}"

#     # Use original Message-ID for proper threading
#     message_id = original_email.get("id", "")

#     message_text = (
#         f"From: me\n"
#         f"To: {to_email}\n"
#         f"Subject: {subject}\n"
#         f"In-Reply-To: {message_id}\n"
#         f"References: {message_id}\n\n"
#         f"{reply_text}"
#     )

#     raw_bytes = message_text.encode("utf-8")
#     raw_base64 = base64.urlsafe_b64encode(raw_bytes).decode("ascii")

#     service.users().messages().send(
#         userId="me",
#         body={"raw": raw_base64}
#     ).execute()

#     return True







# import base64
# import re
# from .gmail_auth import get_gmail_service

# def send_reply(service, email, reply_text):
#     """
#     Sends a reply in the same Gmail thread.
#     """

#     from_field = email.get("from", "")
#     match = re.search(r"<(.+?)>", from_field)
#     to_email = match.group(1) if match else from_field.strip()

#     subject = email.get("subject", "")
#     if not subject.lower().startswith("re:"):
#         subject = f"Re: {subject}"

#     message_id = email.get("id")

#     message = (
#         f"From: me\n"
#         f"To: {to_email}\n"
#         f"Subject: {subject}\n"
#         f"In-Reply-To: {message_id}\n"
#         f"References: {message_id}\n\n"
#         f"{reply_text}"
#     )

#     raw = base64.urlsafe_b64encode(message.encode("utf-8")).decode("ascii")

#     service.users().messages().send(
#         userId="me",
#         body={"raw": raw}
#     ).execute()












import base64
import re
from email.mime.text import MIMEText

def send_reply(service, email, reply_text):
    """
    Sends a reply INSIDE the same Gmail thread (true reply, not new mail)
    """

    from_field = email.get("from", "")
    match = re.search(r"<(.+?)>", from_field)
    to_email = match.group(1) if match else from_field.strip()

    subject = email.get("subject", "")
    if not subject.lower().startswith("re:"):
        subject = f"Re: {subject}"

    message = MIMEText(reply_text)
    message["To"] = to_email
    message["Subject"] = subject

    # 🔑 CRITICAL HEADERS FOR THREADING
    if email.get("message_id"):
        message["In-Reply-To"] = email["message_id"]
        message["References"] = email["message_id"]

    raw_message = base64.urlsafe_b64encode(
        message.as_bytes()
    ).decode("utf-8")

    service.users().messages().send(
        userId="me",
        body={
            "raw": raw_message,
            "threadId": email["thread_id"]  # 🔥 MOST IMPORTANT
        }
    ).execute()
