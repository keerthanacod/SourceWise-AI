# SourceWise AI — Chrome Side Panel + Local RAG Backend

A starter Chrome extension that opens a chatbot side panel beside the page you're browsing. Click **Read page** to send visible page text to your local Python backend, then ask questions with evidence.

## Requirements
- Recent Google Chrome
- Python 3.10+
- Ollama installed locally
- Internet for first-time dependency installation

## Start backend (VS Code terminal)
```cmd
cd path\to\SourceWise-AI-Chrome-Extension\backend
python -m pip install -r requirements.txt
ollama pull llama3.2
python app.py
```
Keep this terminal running. Ollama must also be running.

## Load extension
1. Open Chrome and go to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the project's `extension` folder.
5. Open any regular webpage, click the SourceWise AI extension icon, then click **Read page** in its side panel.
6. Ask your question.

## Modes
- **RAG + LLM** — answers using retrieved page/file evidence.
- **LLM only** — general answer from the local Ollama model.
- **Evidence only** — displays matching text snippets without generating an answer.

## Upload files
The side panel supports PDF, TXT, and Markdown files. Text is chunked and saved locally in `backend/data/chunks.json`. PDF extraction does not include OCR for scanned image-only PDFs.

## Limitations
This is a local starter, not a published Chrome Web Store extension. The extension only reads the active page when you click **Read page**. Browser-internal pages, some protected pages, and certain PDF viewers cannot be read. Some webpages may have little readable text. The backend binds to `127.0.0.1`.
