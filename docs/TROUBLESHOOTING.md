# Troubleshooting

- **Backend offline:** run `python app.py` from the `backend` folder.
- **Cannot connect to Ollama:** start Ollama and run `ollama pull llama3.2`.
- **Model missing:** run `ollama list`; if needed set `OLLAMA_MODEL` before starting the backend.
- **Cannot read page:** only normal http/https tabs are supported; Chrome internal pages and some protected pages are restricted.
- **No matching evidence:** click Read page again and use terms likely to appear in the page. Retrieval in this starter uses lexical matching.
- **Scanned PDF:** image-only PDFs need OCR, which is not included.
- **Port 8000 busy:** stop the other local Python server or change the port in both `backend/app.py` and `extension/sidepanel.js`.
