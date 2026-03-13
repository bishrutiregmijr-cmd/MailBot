# # automation/gmail_reader.py

# from .gmail_auth import get_gmail_service

# def get_latest_messages(service, max_results=5):
#     """Fetch the latest emails from Gmail."""
#     results = service.users().messages().list(userId="me", maxResults=max_results).execute()
#     messages = results.get("messages", [])

#     email_list = []

#     for msg in messages:
#         msg_data = service.users().messages().get(userId="me", id=msg["id"], format="full").execute()
#         payload = msg_data.get("payload", {})
#         headers = payload.get("headers", [])

#         email_from = next((h['value'] for h in headers if h['name'] == 'From'), "")
#         email_subject = next((h['value'] for h in headers if h['name'] == 'Subject'), "")
#         email_id = msg_data.get("id")

#         # Get email body (plain text)
#         parts = payload.get("parts")
#         body = ""
#         if parts:
#             for part in parts:
#                 if part.get("mimeType") == "text/plain":
#                     body_bytes = part.get("body", {}).get("data", "")
#                     if body_bytes:
#                         import base64
#                         body = base64.urlsafe_b64decode(body_bytes).decode("utf-8")
#         else:
#             body_bytes = payload.get("body", {}).get("data", "")
#             if body_bytes:
#                 import base64
#                 body = base64.urlsafe_b64decode(body_bytes).decode("utf-8")

#         email_list.append({
#             "id": email_id,
#             "from": email_from,
#             "subject": email_subject,
#             "body": body,
#             "time": msg_data.get("internalDate", ""),
#             "has_attachments": bool(payload.get("parts"))
#         })

#     return email_list



# gmail_reader.py
# from .gmail_auth import get_gmail_service
# import base64

# def get_latest_messages(service, max_results=5):
#     results = service.users().messages().list(
#         userId="me", labelIds=["INBOX", "UNREAD"], maxResults=max_results
#     ).execute()

#     messages = results.get("messages", [])
#     email_list = []

#     for msg in messages:
#         msg_data = service.users().messages().get(
#             userId="me", id=msg["id"], format="full"
#         ).execute()

#         payload = msg_data.get("payload", {})
#         headers = payload.get("headers", [])

#         email_from = next((h['value'] for h in headers if h['name'] == 'From'), "")
#         email_subject = next((h['value'] for h in headers if h['name'] == 'Subject'), "")
#         email_id = msg_data.get("id")

#         # Decode email body
#         body = ""
#         parts = payload.get("parts", [])
#         has_attachments = False
#         if parts:
#             for part in parts:
#                 # Check for attachments
#                 filename = part.get("filename")
#                 if filename:
#                     has_attachments = True

#                 if part.get("mimeType") == "text/plain" and part.get("body", {}).get("data"):
#                     body_bytes = part["body"]["data"]
#                     body = base64.urlsafe_b64decode(body_bytes).decode("utf-8", errors="ignore")
#         else:
#             body_bytes = payload.get("body", {}).get("data")
#             if body_bytes:
#                 body = base64.urlsafe_b64decode(body_bytes).decode("utf-8", errors="ignore")

#         email_list.append({
#             "id": email_id,
#             "from": email_from,
#             "subject": email_subject,
#             "body": body,
#             "time": msg_data.get("internalDate", ""),
#             "has_attachments": has_attachments
#         })

#     return email_list









import base64

def get_latest_messages(service, max_results=5):
    results = service.users().messages().list(
        userId="me",
        labelIds=["INBOX", "UNREAD"],
        maxResults=max_results
    ).execute()

    messages = results.get("messages", [])
    email_list = []

    for msg in messages:
        msg_data = service.users().messages().get(
            userId="me",
            id=msg["id"],
            format="full"
        ).execute()

        payload = msg_data.get("payload", {})
        headers = payload.get("headers", [])

        def get_header(name):
            return next(
                (h["value"] for h in headers if h["name"].lower() == name.lower()),
                ""
            )

        email_from = get_header("From")
        email_subject = get_header("Subject")
        message_id = get_header("Message-ID")      # RFC Message-ID
        thread_id = msg_data.get("threadId")       # Gmail threadId

        # Decode body
        body = ""
        has_attachments = False
        parts = payload.get("parts", [])

        if parts:
            for part in parts:
                if part.get("filename"):
                    has_attachments = True

                if (
                    part.get("mimeType") == "text/plain"
                    and part.get("body", {}).get("data")
                ):
                    body = base64.urlsafe_b64decode(
                        part["body"]["data"]
                    ).decode("utf-8", errors="ignore")
        else:
            data = payload.get("body", {}).get("data")
            if data:
                body = base64.urlsafe_b64decode(
                    data
                ).decode("utf-8", errors="ignore")

        # 🚨 Skip broken emails safely
        if not thread_id or not message_id:
            continue

        email_list.append({
            "id": msg_data.get("id"),
            "thread_id": thread_id,
            "message_id": message_id,
            "from": email_from,
            "subject": email_subject,
            "body": body,
            "time": msg_data.get("internalDate", ""),
            "has_attachments": has_attachments,
        })

    return email_list
