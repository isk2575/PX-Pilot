from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import anthropic
from llama_index.core import VectorStoreIndex, Document, Settings
from llama_index.llms.anthropic import Anthropic
from llama_index.core.embeddings import BaseEmbedding
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
import pymupdf
import os
import tempfile
import hashlib
from typing import List

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOCS_DIR = os.path.join(BASE_DIR, "documents")
PROTECTED_FILES = ["general_us_hr_policy.pdf"]

app = FastAPI()

@app.get("/")
def root():
    return {"status": "ok"}

frontend_build = os.path.join(BASE_DIR, "..", "frontend", "build")

if os.path.exists(frontend_build):
    app.mount("/static", StaticFiles(directory=os.path.join(frontend_build, "static")), name="static")





app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

class SimpleHashEmbedding(BaseEmbedding):
    def _get_text_embedding(self, text: str) -> List[float]:
        words = text.lower().split()[:100]
        embedding = [0.0] * 384
        for word in words:
            hash_val = int(hashlib.md5(word.encode()).hexdigest(), 16)
            embedding[hash_val % 384] += 1.0
        magnitude = sum(x**2 for x in embedding) ** 0.5
        if magnitude > 0:
            embedding = [x / magnitude for x in embedding]
        return embedding

    def _get_query_embedding(self, query: str) -> List[float]:
        return self._get_text_embedding(query)

    async def _aget_query_embedding(self, query: str) -> List[float]:
        return self._get_query_embedding(query)

    async def _aget_text_embedding(self, text: str) -> List[float]:
        return self._get_text_embedding(text)

    def _get_text_embeddings(self, texts: List[str]) -> List[List[float]]:
        return [self._get_text_embedding(t) for t in texts]

Settings.llm = Anthropic(
    model="claude-haiku-4-5-20251001",
    api_key=os.getenv("ANTHROPIC_API_KEY")
)
Settings.embed_model = SimpleHashEmbedding()

# Lazy loading — index built on first request so Azure starts instantly
index = None
query_engine = None
print("Ready!")

def get_query_engine():
    global index, query_engine
    if query_engine is None:
        print("Building index...")
        all_text = []
        for filename in os.listdir(DOCS_DIR):
            if filename.endswith(".pdf"):
                doc = pymupdf.open(os.path.join(DOCS_DIR, filename))
                text = "".join(page.get_text() for page in doc)
                doc.close()
                all_text.append(Document(text=text, metadata={"filename": filename}))
                print(f"  Loaded: {filename}")
        if all_text:
            index = VectorStoreIndex.from_documents(all_text)
        else:
            index = VectorStoreIndex.from_documents([Document(text="No documents loaded yet.")])
        query_engine = index.as_query_engine()
        print("Index ready!")
    return query_engine

@app.post("/ask")
async def ask(question: str = Form(...)):
    company_docs = [f for f in os.listdir(DOCS_DIR)
                   if f.endswith(".pdf") and f not in PROTECTED_FILES]

    if company_docs:
        docs_text = []
        for filename in company_docs:
            doc = pymupdf.open(os.path.join(DOCS_DIR, filename))
            text = "".join(page.get_text() for page in doc)
            doc.close()
            docs_text.append(Document(text=text, metadata={"filename": filename}))
        company_index = VectorStoreIndex.from_documents(docs_text)
        company_query_engine = company_index.as_query_engine()
        response = company_query_engine.query(question)
    else:
        response = get_query_engine().query(question)

    return {"answer": str(response)}

@app.post("/analyze")
async def analyze(workflow: str = Form(...)):
    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2048,
        system="""You are an HR automation consultant for a company's People Operations / HR team.
Analyze the HR workflow and return a SHORT, visually clean report using this exact format:

🔍 REPETITIVE TASKS
- [task 1]
- [task 2]
- [task 3]

⚡ TOP 3 AUTOMATION OPPORTUNITIES
1. [opportunity] → [tool] — [Easy/Medium/Hard]
2. [opportunity] → [tool] — [Easy/Medium/Hard]
3. [opportunity] → [tool] — [Easy/Medium/Hard]

⏱️ ESTIMATED TIME SAVED
[X hours/week] — [one sentence explanation]

💰 ROI SNAPSHOT
[One or two sentences. Dollar amount + break-even timeline.]

✅ QUICK WIN
[Single most impactful, easiest change to make right now.]

Keep each section to 2-4 bullet points max. No tables. No long paragraphs.""",
        messages=[{"role": "user", "content": f"Analyze this HR workflow:\n\n{workflow}"}]
    )
    return {"result": message.content[0].text}

@app.post("/compare")
async def compare(file_a: UploadFile = File(...), file_b: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_a:
        tmp_a.write(await file_a.read())
        tmp_a_path = tmp_a.name
    doc_a = pymupdf.open(tmp_a_path)
    text_a = "".join(page.get_text() for page in doc_a)
    doc_a.close()
    os.unlink(tmp_a_path)

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_b:
        tmp_b.write(await file_b.read())
        tmp_b_path = tmp_b.name
    doc_b = pymupdf.open(tmp_b_path)
    text_b = "".join(page.get_text() for page in doc_b)
    doc_b.close()
    os.unlink(tmp_b_path)

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2048,
        system="""You are an HR policy analyst specializing in mergers and acquisitions.
Compare the two HR policy documents and return a SHORT, clean report using this exact format:

⚠️ CONFLICTS
- [Policy Area]: [Policy A says X] vs [Policy B says Y]

🔁 DUPLICATES
- [shared rule or process]

📐 INCONSISTENCIES
- [Area]: [brief description]

✅ TOP 3 STANDARDIZATION RECOMMENDATIONS
1. [Policy Area] → Adopt [A or B]'s approach — [one sentence reason]
2. [Policy Area] → Adopt [A or B]'s approach — [one sentence reason]
3. [Policy Area] → Adopt [A or B]'s approach — [one sentence reason]

Keep each section to 3-5 bullet points max. No tables. No long paragraphs.""",
        messages=[{"role": "user", "content": f"Policy A:\n\n{text_a[:4000]}\n\n---\n\nPolicy B:\n\n{text_b[:4000]}\n\nCompare these."}]
    )
    return {"result": message.content[0].text}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    global index, query_engine

    save_path = os.path.join(DOCS_DIR, file.filename)
    with open(save_path, "wb") as f:
        f.write(await file.read())

    # Reset index so it rebuilds on next request
    index = None
    query_engine = None
    print(f"Saved: {file.filename} — index will rebuild on next query")

    return {"message": f"Successfully uploaded {file.filename}", "filename": file.filename}

@app.get("/documents")
def get_documents():
    docs = []
    for filename in os.listdir(DOCS_DIR):
        if filename.endswith(".pdf") and filename not in PROTECTED_FILES:
            path = os.path.join(DOCS_DIR, filename)
            size = os.path.getsize(path)
            docs.append({"name": filename, "size": f"{round(size / 1024)} KB", "updated": "Preloaded"})
    return {"documents": docs}

@app.delete("/documents/{filename}")
def delete_document(filename: str):
    global index, query_engine

    if filename in PROTECTED_FILES:
        return {"message": f"{filename} is protected and cannot be deleted.", "protected": True}

    file_path = os.path.join(DOCS_DIR, filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    # Reset index so it rebuilds on next request
    index = None
    query_engine = None

    return {"message": f"Deleted {filename}"}

@app.post("/search")
async def search(query: str = Form(...)):
    company_docs = [f for f in os.listdir(DOCS_DIR)
                   if f.endswith(".pdf") and f not in PROTECTED_FILES]

    if company_docs:
        docs_text = []
        for filename in company_docs:
            doc = pymupdf.open(os.path.join(DOCS_DIR, filename))
            text = "".join(page.get_text() for page in doc)
            doc.close()
            docs_text.append(Document(text=text, metadata={"filename": filename}))
        company_index = VectorStoreIndex.from_documents(docs_text)
        engine = company_index.as_query_engine()
    else:
        engine = get_query_engine()

    response = engine.query(query)
    return {"result": str(response)}

@app.get("/{full_path:path}")
def serve_react(full_path: str):
    return FileResponse(os.path.join(frontend_build, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))