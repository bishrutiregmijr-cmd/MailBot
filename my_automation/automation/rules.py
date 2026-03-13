# # ---------------------------
# # SIMPLE SPAM / OTP / IMPORTANT FILTER
# # ---------------------------
# def email_is_spam(email):
#     subject = (email.get("subject") or "").lower()
#     body = (email.get("body") or "").lower()

#     spam_words = ["win money", "free offer", "lottery"]
#     for word in spam_words:
#         if word in subject or word in body:
#             return True

#     return False

# # ---------------------------
# # EMAIL ANALYSIS (Gemini-like logic)
# # ---------------------------
# def analyze_email(email):
#     subject = (email.get("subject") or "").lower()
#     body = (email.get("body") or "").lower()

#     if "otp" in subject or "otp" in body:
#         return {
#             "category": "OTP",
#             "confidence": 0.95
#         }

#     if email.get("has_attachments"):
#         return {
#             "category": "ATTACHMENT",
#             "confidence": 0.90
#         }

#     if email_is_spam(email):
#         return {
#             "category": "SPAM",
#             "confidence": 0.85
#         }

#     return {
#         "category": "IMPORTANT",
#         "confidence": 0.80
#     }



# rules.py
def email_is_spam(email):
    # Simple spam detection (can improve later)
    spam_keywords = ["lottery", "win money", "free mobile"]
    content = (email.get("subject") or "") + " " + (email.get("body") or "")
    content = content.lower()
    return any(word in content for word in spam_keywords)

def analyze_email(email):
    """
    Analyze email and classify as OTP, ATTACHMENT, SPAM, or IMPORTANT.
    Properly detects attachments.
    """
    subject = (email.get("subject") or "").lower()
    body = (email.get("body") or "").lower()

    if "otp" in subject or "otp" in body:
        return {"category": "OTP", "confidence": 0.95}

    # Check real attachments (filename exists)
    if email.get("has_attachments") and email["has_attachments"] is True:
        return {"category": "ATTACHMENT", "confidence": 0.90}

    if email_is_spam(email):
        return {"category": "SPAM", "confidence": 0.85}

    return {"category": "IMPORTANT", "confidence": 0.80}
