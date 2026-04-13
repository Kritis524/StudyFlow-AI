import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("API Key not found in .env")
    exit()

genai.configure(api_key=api_key)

print("Listing all models...")
try:
    for m in genai.list_models():
        print(f"{m.name} - {m.supported_generation_methods}")
except Exception as e:
    print(f"Error: {e}")
