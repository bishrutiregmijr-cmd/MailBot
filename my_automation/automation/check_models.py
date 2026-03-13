from google.genai import Client

# Initialize client (replace YOUR_API_KEY_HERE with your key)
client = Client(api_key="AIzaSyBRLhMTaXAkE9VfnfDEGhWOrJ3NJ6Pn0lw")

# Example: print a test message
print("Check models script is running!")

# Example: fetch models (this requires a valid API key)
try:
    models = client.models.list()
    print("Available Models:")
    for model in models.data:
        print(model.name)
except Exception as e:
    print("Error:", e)
