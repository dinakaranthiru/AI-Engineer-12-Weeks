# Support Ticket Classifier

This Week 10 project is a full-stack machine learning application for classifying support tickets.

It has two main parts:

- Frontend: React + Vite app for entering ticket text and displaying prediction results
- Backend: FastAPI API that loads a trained ML pipeline and returns the predicted category and confidence

## Project Overview

The frontend sends a POST request to the backend API at `http://127.0.0.1:8000/predict` and shows the returned result in the browser.

## Features

- React-based frontend for ticket entry and result display
- FastAPI backend for prediction requests
- Support-ticket prediction endpoint at `/predict`
- Health-check endpoint at `/health`
- TF-IDF text vectorization and scikit-learn model inference
- Saved model files loaded from the backend `model/` directory

## Project Structure

```text
Week10_Task/
├── README.md
├── frontend/
│   └── ticket-classifier/
│       ├── package.json
│       ├── package-lock.json
│       ├── vite.config.js
│       ├── index.html
│       ├── src/
│       └── public/
├── ticket-classifier-api/
│   ├── app/
│   │   ├── main.py
│   │   ├── predict.py
│   │   └── schemas.py
│   ├── model/
│   │   ├── ticket_classifier.pkl
│   │   └── tfidf_vectorizer.pkl
│   ├── requirements.txt
│   └── .venv/
```

## Requirements

- Python 3.9+
- Node.js 18+
- npm
- pip

## Backend Setup

Open a terminal in the API folder:

```powershell
cd C:\AI-Engineer\Week10_Task\ticket-classifier-api
```

Create and activate a virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks script execution, use:

```cmd
.venv\Scripts\activate.bat
```

Install Python dependencies:

```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Start the API server:

```powershell
uvicorn app.main:app --reload
```

The backend will be available at:

- API: http://127.0.0.1:8000
- Swagger docs: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

## Frontend Setup

Open a new terminal and go to the React app:

```powershell
cd C:\AI-Engineer\Week10_Task\frontend\ticket-classifier
```

Install the frontend dependencies:

```powershell
npm install
```

Start the React dev server:

```powershell
npm run dev
```

The frontend is usually available at:

- http://127.0.0.1:5173

## How the App Works

1. The user enters a support ticket in the React frontend.
2. The frontend sends the text to the backend API using `POST /predict`.
3. The backend cleans the input, transforms it using TF-IDF, and runs the trained model.
4. The API returns the predicted category and confidence score.
5. The React UI displays the result.

## API Endpoints

### Health check

```http
GET /health
```

Example response:

```json
{"status": "ok"}
```

### Predict ticket category

```http
POST /predict
Content-Type: application/json
```

Request body:

```json
{"text": "I cannot login to my account"}
```

Example response:

```json
{"category": "Login issue", "confidence": 0.94}
```

## Troubleshooting

- Make sure the backend is running before using the frontend.
- Confirm the trained model files exist in `ticket-classifier-api/model/`.
- If NLTK reports missing resources, restart the backend with internet access so it can download the required data.
- If port `8000` is in use, run:

```powershell
uvicorn app.main:app --reload --port 8001
```

Then update the frontend fetch URL to match the new port.

## Run Both Together

Use two terminals:

- Terminal 1: start the FastAPI backend
- Terminal 2: start the React frontend

Then open the frontend in the browser and submit a ticket description to see the prediction result.

## Summary

This project combines a machine learning backend with a user-friendly React interface to create a complete support ticket classification application.
