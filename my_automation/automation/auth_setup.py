from google_auth_oauthlib.flow import InstalledAppFlow
import json, os

SCOPES = [
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
]

BASE_DIR = os.path.dirname(__file__)
CREDS_FILE = r"C:\Users\advwo\Downloads\credentials (3).json"
TOKEN_FILE = os.path.join(BASE_DIR, "token.json")

flow = InstalledAppFlow.from_client_secrets_file(CREDS_FILE, SCOPES)
creds = flow.run_local_server(port=0)

with open(TOKEN_FILE, "w") as f:
    f.write(creds.to_json())

print("✅ Authentication successful! token.json saved.")