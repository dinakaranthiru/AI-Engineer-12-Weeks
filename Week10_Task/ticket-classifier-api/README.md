# Support Ticket Classifier API

A FastAPI service that classifies support-ticket text with a trained scikit-learn model. The project includes a browser interface and JSON endpoints for health checks and predictions.

## Features

- FastAPI REST API
- Browser UI at `/`
- Support-ticket prediction at `/predict`
- Health check at `/health`
- TF-IDF text vectorization
- Text cleaning with NLTK stopword removal and lemmatization
- Saved model artifacts loaded from the `model/` directory

## Project Structure

```text
ticket-classifier-api/
├── app/
│   ├── main.py        # FastAPI application and routes
│   ├── predict.py     # Text preprocessing and model inference
│   └── schemas.py     # Request and response models
├── model/
│   ├── ticket_classifier.pkl
│   └── tfidf_vectorizer.pkl
├── static/            # CSS and JavaScript for the browser UI
├── templates/         # HTML templates
└── requirements.txt
```

## Requirements

- Python 3.9 or newer
- pip

## Installation

Open a terminal in this directory:

```powershell
cd C:\AI-Engineer\Week10_Task\ticket-classifier-api
```

Create and activate a virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks script activation, use Command Prompt instead:

```cmd
.venv\Scripts\activate.bat
```

Install the dependencies:

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

NLTK downloads `stopwords` and `wordnet` automatically when the prediction module is first loaded. An internet connection may be required on the first startup.

## Run the API

Run this command from the `ticket-classifier-api` directory:

```powershell
uvicorn app.main:app --reload
```

The server is available at:

- Web UI: <http://127.0.0.1:8000/>
- Swagger documentation: <http://127.0.0.1:8000/docs>
- ReDoc documentation: <http://127.0.0.1:8000/redoc>

Stop the development server with `Ctrl+C`.

## API Endpoints

### Health check

```http
GET /health
```

Example response:

```json
{"status": "ok"}
```

### Classify a ticket

```http
POST /predict
Content-Type: application/json
```

Request body:

```json
{"text": "cannot login to system"}
```

PowerShell example:

```powershell
$body = @{ text = "cannot login to system" } | ConvertTo-Json
Invoke-RestMethod -Uri http://127.0.0.1:8000/predict -Method Post -ContentType "application/json" -Body $body
```

Example response:

```json
{"category": "Login issue", "confidence": 0.94}
```

The exact category and confidence depend on the trained model.

## Troubleshooting

- Run `uvicorn` from the `ticket-classifier-api` directory. The application loads model files using the relative paths `model/ticket_classifier.pkl` and `model/tfidf_vectorizer.pkl`.
- Confirm both model files exist in `model/` before starting the server.
- If NLTK reports missing resources, restart the application while connected to the internet so the automatic downloads can complete.
- If port `8000` is already in use, choose another port: `uvicorn app.main:app --reload --port 8001`.
