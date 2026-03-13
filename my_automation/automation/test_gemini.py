# # test_gemini.py
# import google.genai as genai

# # Configure API key
# genai.configure(api_key="AIzaSyClDjbMDywpdN-RK7xt7BQRpxQMATJAiGo")

# # Use the same valid model
# model = genai.GenerativeModel(model_name="gemini-1.5-turbo")  # ✅ updated model

# # Test simple prompt
# response = model.generate_content("Say hello politely to a user via email.")
# print("AI Response:", response.text.strip())
from google import genai

GENAI_API_KEY = "AIzaSyAPeiYURhCpSe9AoKRBkGfxwvcodlflKvo"
client = genai.Client(api_key=GENAI_API_KEY)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Say hello politely to a user via email."
)
print("AI Response:", response.text.strip())








































