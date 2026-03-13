import os
from dotenv import load_dotenv
load_dotenv()
# # reply.py
# import base64
# from .gmail_auth import get_gmail_service
# from google import genai
# from google.genai import types

# # Use your Gemini API key here
# GENAI_API_KEY = "AIzaSyClDjbMDywpdN-RK7xt7BQRpxQMATJAiGo"
# client = genai.Client(api_key=GENAI_API_KEY)

# def generate_ai_reply(email):
#     subject = email.get("subject", "")
#     body = email.get("body", "")

#     # Build the prompt that you send to Gemini
#     prompt = f"""
# You are an assistant replying to an email.
# Email subject: {subject}
# Email body: {body}

# Write a polite, professional, and concise reply.
# """

#     # Generate content from a valid Gemini model:
#     # Use the same style as the Python SDK example
#     response = client.models.generate_content(
#         model="gemini-2.5-flash",       # valid Gemini model from your list
#         contents=prompt                # prompt text
#     )

#     # The generated text is available as response.text
#     return response.text.strip()

# def send_reply(original_email, reply_text):
#     service = get_gmail_service()
#     message = (
#         f"From: me\n"
#         f"To: {original_email['from']}\n"
#         f"Subject: Re: {original_email['subject']}\n\n"
#         f"{reply_text}"
#     )
#     raw = base64.urlsafe_b64encode(
#         message.encode("utf-8")
#     ).decode("utf-8")
#     service.users().messages().send(
#         userId="me",
#         body={"raw": raw}
#     ).execute()
#     return True


#This is the second code given by copilot
# import base64
# from .gmail_auth import get_gmail_service
# from google import genai

# GENAI_API_KEY = "AIzaSyClDjbMDywpdN-RK7xt7BQRpxQMATJAiGo"
# client = genai.Client(api_key=GENAI_API_KEY)

# def generate_ai_reply(email):
#     subject = email.get("subject", "")
#     body = email.get("body", "")

#     prompt = f"""
# You are an assistant replying to an email.
# Email subject: {subject}
# Email body: {body}

# Write a polite, professional, and concise reply.
# """

#     response = client.models.generate_content(
#         model="gemini-1.5-flash",
#         contents=prompt
#     )
#     return response.text.strip()

# def send_reply(original_email, reply_text):
#     service = get_gmail_service()
#     message = (
#         f"From: me\n"
#         f"To: {original_email['from']}\n"
#         f"Subject: Re: {original_email['subject']}\n\n"
#         f"{reply_text}"
#     )
#     raw = base64.urlsafe_b64encode(message.encode("utf-8")).decode("utf-8")
#     service.users().messages().send(
#         userId="me",
#         body={"raw": raw}
#     ).execute()
#     return True


# This is given by chatgpt by saying final one import base64

# import base64
# from google import genai
# from .gmail_auth import get_gmail_service

# GENAI_API_KEY = "AIzaSyC7B9k7KUHj_Bn6kvDzS9dJQ3Km92ik5_I"
# client = genai.Client(api_key=GENAI_API_KEY)

# def generate_ai_reply(email):
#     subject = email.get("subject", "")
#     body = email.get("message", "")  # FIXED

#     prompt = f"""
# You are an assistant replying to an email.

# Email subject: {subject}
# Email body:
# {body}

# Write a polite, professional, and concise reply.
# """

#     response = client.models.generate_content(
#         model="gemini-2.5-flash",
#         contents=prompt
#     )
#     return response.text.strip()


# def send_reply(original_email, reply_text):
#     service = get_gmail_service()

#     message = (
#         f"From: me\n"
#         f"To: {original_email['from']}\n"
#         f"Subject: Re: {original_email['subject']}\n"
#         f"In-Reply-To: {original_email['id']}\n"
#         f"References: {original_email['id']}\n\n"
#         f"{reply_text}"
#     )

#     raw_bytes = message.encode("utf-8")
#     raw = base64.urlsafe_b64encode(raw_bytes).decode("ascii")

#     service.users().messages().send(
#         userId="me",
#         body={"raw": raw}
#     ).execute()

#     return True



# Last Code
# from google import genai

# GENAI_API_KEY = "AIzaSyC7B9k7KUHj_Bn6kvDzS9dJQ3Km92ik5_I"  # Replace with your Gemini API key
# client = genai.Client(api_key=GENAI_API_KEY)

# def generate_ai_reply(email):
#     subject = email.get("subject", "")
#     body = email.get("body", "")  # make sure this matches get_latest_messages()

#     prompt = f"""
# You are an assistant replying to an email.

# Email subject: {subject}
# Email body:
# {body}

# Write a friendly, concise reply responding to the message content.
# """

#     response = client.models.generate_content(
#         model="gemini-2.5-flash",  # or any supported model
#         contents=prompt
#     )

#     return response.text.strip()



# automation/reply.py

# import base64
# from google import genai
# from .gmail_auth import get_gmail_service

# GENAI_API_KEY = "AIzaSyCv6lpNyXgnt0TGSwE0ohritZJLFG3yDTE"
# client = genai.Client(api_key=GENAI_API_KEY)

# def generate_ai_reply(email):
#     subject = email.get("subject", "")
#     body = email.get("body", "")

#     prompt = f"""
# You are an assistant replying to an email.

# Email subject: {subject}
# Email body:
# {body}

# Write a polite, professional, and concise reply.
# """

#     response = client.models.generate_content(
#         model="gemini-2.5-flash",
#         contents=prompt
#     )
#     return response.text.strip()



# import base64
# from google import genai
# from .gmail_auth import get_gmail_service

# GENAI_API_KEY = "AIzaSyD417aGTe6Ue8WCdPcR_dVPCPqXB-xIdto"
# client = genai.Client(api_key=GENAI_API_KEY)

# def generate_ai_reply(email):
#     """
#     Generate a context-aware AI reply to the sender's email.
#     """
#     subject = email.get("subject", "")
#     body = email.get("body", "")

#     prompt = f"""
# You are an intelligent email assistant. Reply politely, professionally, and contextually
# to the following email.

# Email subject: {subject}
# Email body:
# {body}

# Instructions:
# - Greet the sender appropriately if they say hello.
# - If they ask about a topic (like Forex), answer briefly with correct info.
# - Keep the reply concise, clear, and polite.
# - Do not apologize unnecessarily.
# - Only answer what is relevant to the email content.
# """

#     try:
#         response = client.models.generate_content(
#             model="gemini-2.5-flash",
#             contents=prompt
#         )
#         return response.text.strip()
#     except Exception:
#         # If Gemini fails, fallback to generic polite reply
#         return "Thank you for your email. I will get back to you shortly."




# reply.py
# from google import genai

# # Replace with your actual Gemini API key
# GENAI_API_KEY = "AIzaSyA92QphTF3vtgovPztBR0jPdM0ico0_4Is"

# client = genai.Client(api_key=GENAI_API_KEY)

# def generate_ai_reply(email):
#     """
#     Generates a smart AI reply for an email using Gemini.
#     Replies intelligently to questions like n8n chat model.
#     """
#     subject = email.get("subject", "")
#     body = email.get("body", "")

#     prompt = f"""
# You are an intelligent email assistant.

# Email subject: {subject}
# Email body: {body}

# Write a polite, professional, concise reply.
# - Avoid replying if this is spam or OTP.
# - If a question is asked (e.g., Forex, investment, weather), provide a brief explanation.
# - Use natural language, as if responding personally.
# """
#     try:
#         response = client.models.generate_content(
#             model="gemini-2.5-flash",
#             contents=prompt
#         )
#         return response.text.strip()
#     except Exception:
#         # fallback if API fails or quota exceeded
#         return "Thank you for your email. I will get back to you shortly."
    


# from google import genai

# GENAI_API_KEY = "AIzaSyA92QphTF3vtgovPztBR0jPdM0ico0_4Is"
# client = genai.Client(api_key=GENAI_API_KEY)

# def generate_ai_reply(subject: str, full_body: str) -> str:
#     """
#     Generates a detailed, context-aware reply.
#     Handles PDF summaries, schedules, policies, workshops, etc.
#     """

#     prompt = f"""
# You are an intelligent email assistant.

# EMAIL SUBJECT:
# {subject}

# EMAIL CONTENT (may include PDF text):
# {full_body}

# INSTRUCTIONS:
# - If this is a document (policy, code of conduct, schedule, agenda):
#   → Summarize it clearly in bullet points.
# - If dates, rules, expectations, or topics exist:
#   → Mention them explicitly.
# - Be detailed and informative when content is rich.
# - Be concise only when content is short.
# - Sound professional and human.
# - DO NOT use generic replies.
# - DO NOT invent information.

# Write the reply as if sending a real Gmail response.
# """

#     try:
#         response = client.models.generate_content(
#             model="gemini-2.5-flash",
#             contents=prompt
#         )
#         return response.text.strip()
#     except Exception as e:
#         return (
#             "Thank you for sharing the document. "
#             "I have reviewed the content and will respond in detail shortly."
#         )


# from google import genai
# from .knowledge_base.knowledge_loader import load_knowledge_text


# GENAI_API_KEY = "AIzaSyB3XmvWPk0AF6PFfbOrSjWg-9mvEgqjB5M"
# client = genai.Client(api_key=GENAI_API_KEY)

# def generate_ai_reply(subject: str, full_body: str) -> str:
#     """
#     Answers strictly based on email body + attached PDF content.
#     """

#     prompt = f"""
# You are an email assistant.

# EMAIL SUBJECT:
# {subject}

# EMAIL CONTENT (this may include PDF text):
# {full_body}

# RULES:
# - Answer ONLY using the information above
# - If the content describes an institution, policy, or schedule:
#   → summarize clearly in bullet points
# - If a question is asked:
#   → answer directly from the content
# - If something is not mentioned:
#   → clearly say it is not provided
# - DO NOT suggest websites or external sources
# - DO NOT invent information
# - Be clear, professional, and specific
# """

#     try:
#         response = client.responses.generate(
#             model="gemini-2.5-flash",
#             input=prompt,
#         )
#         return response.output_text.strip()

#     except Exception:
#         return "I have reviewed the document and responded based on the available information."












# from google import genai
# import os

# client = genai.Client(api_key=os.getenv("GENAI_API_KEY"))

# def generate_ai_reply(subject: str, full_body: str) -> str:
#     prompt = f"""
# You are an email assistant.

# EMAIL SUBJECT:
# {subject}

# EMAIL CONTENT:
# {full_body}

# RULES:
# - Answer ONLY using the information above
# - If something is not mentioned, clearly say so
# - Be specific, structured, and factual
# - DO NOT give generic replies
# """

#     response = client.models.generate_content(
#         model="gemini-2.5-flash",
#         contents=prompt,
#     )

#     if not response or not response.text:
#         raise RuntimeError("Gemini returned empty response")

#     return response.text.strip()







from google import genai
import os
import re

client = genai.Client(api_key=os.getenv("GENAI_API_KEY"))

# Detect greetings
GREETING_PATTERN = re.compile(
    r"\b(hi|hello|hey|how are you|good morning|good afternoon|good evening|thanks|thank you)\b",
    re.IGNORECASE
)

def is_greeting(text: str) -> bool:
    return bool(GREETING_PATTERN.search(text))


def generate_ai_reply(subject: str, email_body: str, knowledge_text: str) -> str:
    """
    - Greetings → normal polite reply
    - Queries → strict knowledge-base only
    """

    # 🟢 Greeting path (NO knowledge base)
    if is_greeting(email_body):
        prompt = f"""
You are a polite professional email assistant.
Reply naturally to the greeting.

EMAIL:
{email_body}
"""
    else:
        # 🔒 Knowledge-only path
        prompt = f"""
You are a professional email assistant.

OFFICIAL KNOWLEDGE BASE (USE THIS ONLY):
{knowledge_text}

--------------------------------
EMAIL:
{email_body}

RULES:
- Answer ONLY using the knowledge base above
- If information is missing, say politely it is not mentioned
- Do NOT invent information
- Be professional and factual
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    if not response or not response.text:
        raise RuntimeError("Gemini returned empty response")

    return response.text.strip()


