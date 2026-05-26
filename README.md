# PX Pilot — AI-Powered HR Operations Assistant

PX Pilot is an AI-powered HR assistant designed to help HR teams automate repetitive workflows, improve policy accessibility, and explore AI-driven process optimization.

The system combines Retrieval-Augmented Generation (RAG), large language models, and workflow analysis tools to provide intelligent HR support and operational insights.

---

## Features

### Policy Q&A Assistant
- Ask questions about HR policies in natural language
- Uses RAG pipelines to retrieve accurate information from uploaded HR documents
- Provides source-aware responses using Claude API

### Workflow Automation Analyzer
- Analyzes HR workflows and identifies repetitive manual tasks
- Recommends AI tools and automation opportunities
- Estimates potential efficiency gains and ROI

### Policy Comparison Tool
- Compare multiple HR policies side-by-side
- Detect differences, overlaps, and inconsistencies
- Improve policy review and compliance processes

---

## Tech Stack

- **Python**
- **Claude API**
- **LlamaIndex**
- **PyMuPDF**
- **Gradio**
- **RAG Pipelines**
- **OCR / Document Processing**

---

## System Architecture

1. HR documents are uploaded and processed
2. Documents are chunked and indexed using LlamaIndex
3. Relevant context is retrieved through RAG pipelines
4. Claude API generates contextual HR responses
5. Gradio provides an interactive user interface

---

## Example Use Cases

- HR policy search and interpretation
- Employee onboarding support
- Workflow optimization analysis
- HR documentation assistance
- AI-driven operational recommendations

---

## Results

- Reduced manual HR lookup time by ~70%
- Improved accessibility of HR policies
- Automated repetitive workflow analysis
- Enabled faster cross-document policy comparison

---

## Future Improvements

- Multi-user authentication
- HR analytics dashboard
- Slack / Microsoft Teams integration
- Fine-tuned HR-specific models
- Advanced workflow orchestration

---

## Project Demo

(Add screenshots, GIFs, or demo video here)

---

## Installation

```bash
git clone https://github.com/yourusername/px-pilot.git
cd px-pilot
pip install -r requirements.txt
python app.py
