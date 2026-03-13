import base64
from io import BytesIO
from pypdf import PdfReader

def extract_attachment_text(service, message_id, max_chars=3000):
    """
    Reads PDF attachments from a Gmail message and extracts text.
    Returns combined text (limited).
    """
    message = service.users().messages().get(
        userId="me",
        id=message_id,
        format="full"
    ).execute()

    parts = message.get("payload", {}).get("parts", [])
    extracted_text = ""

    for part in parts:
        filename = part.get("filename", "")
        body = part.get("body", {})
        attachment_id = body.get("attachmentId")

        # Only PDFs
        if filename.lower().endswith(".pdf") and attachment_id:
            attachment = service.users().messages().attachments().get(
                userId="me",
                messageId=message_id,
                id=attachment_id
            ).execute()

            file_data = base64.urlsafe_b64decode(attachment["data"])
            reader = PdfReader(BytesIO(file_data))

            for page in reader.pages:
                extracted_text += (page.extract_text() or "") + "\n"

    return extracted_text[:max_chars]





