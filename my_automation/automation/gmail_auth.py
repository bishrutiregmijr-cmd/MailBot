import os
import json
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

SCOPES = [
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
]

BASE_DIR   = os.path.dirname(__file__)
TOKEN_FILE = os.path.join(BASE_DIR, "token.json")
CREDS_FILE = os.path.join(BASE_DIR, "credentials (3).json")
REDIRECT_URI = "http://127.0.0.1:8000/automation/oauth-callback/"


# ─── DEFAULT (single) AUTH ────────────────────────────────────────────────────

def get_credentials():
    """Load saved credentials from token.json, refresh if expired."""
    if not os.path.exists(TOKEN_FILE):
        return None

    creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        with open(TOKEN_FILE, "w") as f:
            f.write(creds.to_json())

    return creds if creds and creds.valid else None


def get_gmail_service():
    """Returns Gmail API service using default token. Raises if not authenticated."""
    creds = get_credentials()
    if not creds:
        raise Exception("NOT_AUTHENTICATED")
    return build("gmail", "v1", credentials=creds)


def get_auth_flow():
    """Create OAuth flow for web redirect."""
    flow = Flow.from_client_secrets_file(
        CREDS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI,
    )
    return flow


def save_token_from_code(code: str):
    """Exchange auth code for token and save to token.json."""
    flow = get_auth_flow()
    flow.fetch_token(code=code)
    creds = flow.credentials
    with open(TOKEN_FILE, "w") as f:
        f.write(creds.to_json())


# ─── PER-CLIENT AUTH ──────────────────────────────────────────────────────────

def get_credentials_for_client(gmail_account):
    """
    Load credentials from a GmailAccount database record.
    Refreshes token if expired and saves back to DB.
    """
    if not gmail_account.token_json:
        return None

    try:
        creds = Credentials.from_authorized_user_info(
            json.loads(gmail_account.token_json), SCOPES
        )
    except Exception as e:
        print(f"❌ Could not load credentials for {gmail_account.email}: {e}")
        return None

    if creds and creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
            # Save refreshed token back to DB
            gmail_account.token_json    = creds.to_json()
            gmail_account.is_authorized = True
            gmail_account.save()
        except Exception as e:
            print(f"❌ Token refresh failed for {gmail_account.email}: {e}")
            gmail_account.is_authorized = False
            gmail_account.save()
            return None

    return creds if creds and creds.valid else None


def get_gmail_service_for_client(gmail_account):
    """Returns Gmail API service for a specific client."""
    creds = get_credentials_for_client(gmail_account)
    if not creds:
        raise Exception(f"NOT_AUTHENTICATED for {gmail_account.email}")
    return build("gmail", "v1", credentials=creds)


def save_token_for_client(code: str, gmail_account):
    """Exchange auth code for token and save to client's GmailAccount in DB."""
    flow = get_auth_flow()
    flow.fetch_token(code=code)
    creds = flow.credentials

    gmail_account.token_json    = creds.to_json()
    gmail_account.is_authorized = True
    gmail_account.save()