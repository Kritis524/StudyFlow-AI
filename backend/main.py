from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
from dotenv import load_dotenv
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
import pypdf
from io import BytesIO
import faiss
import numpy as np
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()

app = FastAPI()


# 2. Add the "Handshake" code right here
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://studyflowai.vercel.app",  # Your production URL
        "http://localhost:3000",           # For local testing
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY", "")
if api_key:
    try:
        genai.configure(api_key=api_key)
        # Using 'gemini-1.5-flash' is standard, but some regions/versions prefer the full path
        model = genai.GenerativeModel('gemini-2.5-flash-lite')
        print("Gemini model configured successfully.")
    except Exception as e:
        print(f"Error configuring Gemini: {e}")
        model = None
else:
    print("No GEMINI_API_KEY found in environment.")
    model = None

# MongoDB setup
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URI)
db = client.studyplanner
users_collection = db.users

class SimpleRAG:
    def __init__(self):
        self.index = None
        self.chunks = []
        
    def add_pdf(self, file_bytes):
        reader = pypdf.PdfReader(BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            if page.extract_text():
                text += page.extract_text() + "\n"
            
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        new_chunks = splitter.split_text(text)
        if not new_chunks: return
        
        import time
        embeddings = []
        batch_size = 50
        for i in range(0, len(new_chunks), batch_size):
            batch = new_chunks[i:i+batch_size]
            try:
                emb = genai.embed_content(model="models/text-embedding-004", content=batch, task_type="retrieval_document")
                embeddings.extend(emb['embedding'])
                time.sleep(2)  # small delay to help with rate limits
            except Exception as e:
                print(f"Error during embedding batch: {e}")
                
        if not embeddings:
            return
            
        embeddings_np = np.array(embeddings).astype('float32')
        if self.index is None:
            self.index = faiss.IndexFlatL2(len(embeddings[0]))
        self.index.add(embeddings_np)
        self.chunks.extend(new_chunks)
        
    def search(self, query, top_k=3):
        if self.index is None or self.index.ntotal == 0:
            return []
        emb = genai.embed_content(model="models/text-embedding-004", content=query, task_type="retrieval_query")
        query_np = np.array([emb['embedding']]).astype('float32')
        D, I = self.index.search(query_np, min(top_k, len(self.chunks)))
        return [self.chunks[i] for i in I[0] if i < len(self.chunks)]

global_rag = SimpleRAG()

@app.post("/api/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        global_rag.add_pdf(contents)
        return {"status": "success", "message": f"Successfully processed {file.filename}! You can now ask me questions about it."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class UserCredentials(BaseModel):
    name: str = None
    email: str
    password: str

@app.post("/api/signup")
async def signup(credentials: UserCredentials):
    existing_user = await users_collection.find_one({"email": credentials.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    user_id = str(uuid.uuid4())
    new_user = {
        "id": user_id,
        "name": credentials.name or "User",
        "email": credentials.email,
        "password": credentials.password  # plaintext for simplicity, do not use in prod
    }
    await users_collection.insert_one(new_user)
    return {"status": "success", "user": {"id": user_id, "name": new_user["name"], "email": credentials.email}}

@app.post("/api/login")
async def login(credentials: UserCredentials):
    user = await users_collection.find_one({"email": credentials.email})
    if not user or user["password"] != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {"status": "success", "user": {"id": user["id"], "name": user["name"], "email": user["email"]}}

class ChatRequest(BaseModel):
    message: str
    history: list
    user_name: str = "User"

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    if not model:
        return {"reply": f"API Key is missing. By the way, {request.user_name}, focus on setting up your credentials today!"}
    
    import time
    for attempt in range(5):
        try:
            try:
                retrieved_docs = global_rag.search(request.message)
            except Exception as e:
                print(f"RAG Search error: {e}")
                retrieved_docs = []
                
            context = ""
            if retrieved_docs:
                context = "Context from uploaded documents:\n" + "\n---\n".join(retrieved_docs) + "\n\n"
                
            history_text = "\n".join([f"{'AI' if msg.get('isAi', False) else request.user_name}: {msg.get('text', '')}" for msg in request.history[-5:]])
            prompt = f"You are StudyFlow AI Planner, a supportive, concise study assistant for {request.user_name}. Do not use any markdown formatting or asterisks.\n{context}History:\n{history_text}\nUser: {request.message}\nAI:"
            response = model.generate_content(prompt)
            clean_text = response.text.replace("*", "")
            return {"reply": clean_text}
        except Exception as e:
            error_msg = str(e)
            print(f"Chat generation error on attempt {attempt}: {error_msg}")
            if "429" in error_msg or "Quota exceeded" in error_msg or "quota" in error_msg.lower():
                if attempt < 4:
                    print("Rate limited, sleeping 15 seconds...")
                    time.sleep(15)
                    continue
                return {"reply": "Your Gemini API free tier quota is exhausted for today. Please wait until tomorrow for the quota to reset, or visit https://ai.google.dev to upgrade your plan."}
            if "400" in error_msg or "API_KEY_INVALID" in error_msg:
                return {"reply": "Your Gemini API key is invalid. Please generate a new key from https://aistudio.google.com/app/apikey and update your .env file."}
            return {"reply": f"Error: {error_msg}"}

@app.get("/")
def read_root():
    return {"status": "ok"}
