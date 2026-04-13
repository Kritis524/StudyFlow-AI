from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv
import uuid

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY", "")
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash')
else:
    model = None

# In-memory user database
users_db = {}

class UserCredentials(BaseModel):
    name: str = None
    email: str
    password: str

@app.post("/api/signup")
async def signup(credentials: UserCredentials):
    if credentials.email in users_db:
        raise HTTPException(status_code=400, detail="User already exists")
    user_id = str(uuid.uuid4())
    users_db[credentials.email] = {
        "id": user_id,
        "name": credentials.name or "User",
        "email": credentials.email,
        "password": credentials.password  # plaintext for simplicity, do not use in prod
    }
    return {"status": "success", "user": {"id": user_id, "name": users_db[credentials.email]["name"], "email": credentials.email}}

@app.post("/api/login")
async def login(credentials: UserCredentials):
    if credentials.email not in users_db or users_db[credentials.email]["password"] != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user = users_db[credentials.email]
    return {"status": "success", "user": {"id": user["id"], "name": user["name"], "email": user["email"]}}

class ChatRequest(BaseModel):
    message: str
    history: list
    user_name: str = "User"

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    if not model:
        return {"reply": f"API Key is missing. By the way, {request.user_name}, focus on setting up your credentials today!"}
    
    try:
        history_text = "\n".join([f"{'AI' if msg.get('isAi', False) else request.user_name}: {msg.get('text', '')}" for msg in request.history[-5:]])
        prompt = f"You are StudyFlow AI Planner, a supportive, concise study assistant for {request.user_name}. Do not use any markdown formatting or asterisks.\nHistory:\n{history_text}\nUser: {request.message}\nAI:"
        response = model.generate_content(prompt)
        clean_text = response.text.replace("*", "")
        return {"reply": clean_text}
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "Quota exceeded" in error_msg:
            return {"reply": "I'm sorry, I've hit my rate limit for answering right now! The Gemini API allows a few requests per minute on the free tier. Please wait about a minute and try again."}
        return {"reply": f"Error: {error_msg}"}

@app.get("/")
def read_root():
    return {"status": "ok"}
