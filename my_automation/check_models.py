from google.genai import Client

# ✅ Replace with your actual API key
API_KEY = "AIzaSyBRLhMTaXAkE9VfnfDEGhWOrJ3NJ6Pn0lw"

# Initialize the client
client = Client(api_key=API_KEY)

print("Check models script is running!")

# Try to fetch the list of available models
try:
    models = client.models.list()  # returns a Pager object
    print("Available Models:")
    for model in models:  # iterate directly over Pager
        print(model.name)
except Exception as e:
    print("Error while fetching models:", e)
