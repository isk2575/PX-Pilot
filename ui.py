import gradio as gr
import anthropic
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.llms.anthropic import Anthropic
from llama_index.core import Settings
from dotenv import load_dotenv
import pymupdf
import os

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Setup RAG
Settings.llm = Anthropic(
    model="claude-haiku-4-5-20251001",
    api_key=os.getenv("ANTHROPIC_API_KEY")
)

# Load documents
# Load documents using PyMuPDF
print("Loading HR policy documents...")
from llama_index.core import Document

all_text = []
for filename in os.listdir("documents"):
    if filename.endswith(".pdf"):
        doc = pymupdf.open(os.path.join("documents", filename))
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        all_text.append(Document(text=text, metadata={"filename": filename}))
        print(f"  Loaded: {filename}")

index = VectorStoreIndex.from_documents(all_text)
query_engine = index.as_query_engine()
print("Ready!")

def ask_general(question):
    response = query_engine.query(question)
    return str(response)

def analyze_workflow(workflow_description):
    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2048,
        system="""You are an HR automation consultant for Rocket's People Experience team.
Analyze the HR workflow and return a SHORT, visually clean report using this exact format:

🔍 REPETITIVE TASKS
- [task 1]
- [task 2]
- [task 3]

 TOP 3 AUTOMATION OPPORTUNITIES
1. [opportunity] → [tool] — [Easy/Medium/Hard]
2. [opportunity] → [tool] — [Easy/Medium/Hard]
3. [opportunity] → [tool] — [Easy/Medium/Hard]

 ESTIMATED TIME SAVED
[X hours/week] — [one sentence explanation]

 ROI SNAPSHOT
[One or two sentences. Dollar amount + break-even timeline.]

 QUICK WIN
[Single most impactful, easiest change to make right now.]

Keep each section to 2-4 bullet points max. No tables. No long paragraphs.""",
        messages=[{"role": "user", "content": f"Analyze this HR workflow:\n\n{workflow_description}"}]
    )
    return message.content[0].text

def compare_policies(pdf_file_a, pdf_file_b):
    doc_a = pymupdf.open(pdf_file_a.name)
    text_a = ""
    for page in doc_a:
        text_a += page.get_text()
    doc_a.close()

    doc_b = pymupdf.open(pdf_file_b.name)
    text_b = ""
    for page in doc_b:
        text_b += page.get_text()
    doc_b.close()

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2048,
        system="""You are an HR policy analyst specializing in mergers and acquisitions.
Compare the two HR policy documents and return a SHORT, clean report using this exact format:

⚠️ CONFLICTS
- [Policy Area]: [Policy A says X] vs [Policy B says Y]
- [Policy Area]: [Policy A says X] vs [Policy B says Y]
- [Policy Area]: [Policy A says X] vs [Policy B says Y]

🔁 DUPLICATES
- [shared rule or process]
- [shared rule or process]
- [shared rule or process]

📐 INCONSISTENCIES
- [Area]: [brief description of tone/structural difference]
- [Area]: [brief description of tone/structural difference]

✅ TOP 3 STANDARDIZATION RECOMMENDATIONS
1. [Policy Area] → Adopt [A or B]'s approach — [one sentence reason]
2. [Policy Area] → Adopt [A or B]'s approach — [one sentence reason]
3. [Policy Area] → Adopt [A or B]'s approach — [one sentence reason]

Keep each section to 3-5 bullet points max. No tables. No long paragraphs. Be direct and concise.""",
        messages=[{
            "role": "user",
            "content": f"Policy Document A:\n\n{text_a}\n\n---\n\nPolicy Document B:\n\n{text_b}\n\nCompare these two HR policy documents."
        }]
    )
    return message.content[0].text

with gr.Blocks(title="PX Pilot", theme=gr.themes.Base(
    primary_hue="red",
    secondary_hue="red",
    neutral_hue="gray",
)) as app:
    gr.Markdown("# 🚀 PX Pilot")
    gr.Markdown("*AI-powered People Experience assistant*")

    with gr.Tab(" Employee Knowledge Hub"):
        gr.Markdown("### Ask any HR or policy question")
        chat_input = gr.Textbox(placeholder="e.g. How many PTO days do I get?")
        chat_output = gr.Textbox(label="Answer", lines=5)
        chat_btn = gr.Button("Ask", variant="primary")
        chat_btn.click(ask_general, inputs=chat_input, outputs=chat_output)

    with gr.Tab(" Workflow Intelligence"):
        gr.Markdown("### Paste an HR workflow and get an AI analysis")
        rag_input = gr.Textbox(placeholder="e.g. Our onboarding process requires managers to manually send training docs...", lines=5)
        rag_output = gr.Textbox(label="Analysis", lines=10)
        rag_btn = gr.Button("Analyze", variant="primary")
        rag_btn.click(analyze_workflow, inputs=rag_input, outputs=rag_output)

    with gr.Tab(" Policy Harmonizer"):
        gr.Markdown("### Upload two HR policy documents to compare them")
        pdf_input_a = gr.File(label="Policy Document A", file_types=[".pdf"])
        pdf_input_b = gr.File(label="Policy Document B", file_types=[".pdf"])
        pdf_output = gr.Textbox(label="Comparison Report", lines=15)
        pdf_btn = gr.Button("Compare Policies", variant="primary")
        pdf_btn.click(compare_policies, inputs=[pdf_input_a, pdf_input_b], outputs=pdf_output)

app.launch()