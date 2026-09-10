# Bank Customer Churn Predictor AI - React Frontend

Modern fintech dashboard for bank customer retention forecasting and high-throughput batch churn risk analysis.

## Features

- **Single Customer Assessment**:
  - Sliders and inputs for 10 customer features (Credit Score, Country, Gender, Age, Tenure, Balance, Products, Credit Card, Active Member, Estimated Salary).
  - 1-click preset demo profiles (High Risk, Loyal Account, Mid-Tier).
  - Real-time churn probability gauge with color-coded risk levels (High, Medium, Low) and proactive retention recommendations.
- **Batch File Analysis**:
  - Drag-and-drop file ingestion supporting **CSV (`.csv`)**, **Excel (`.xlsx`, `.xls`)**, and **Delimited Text (`.txt`)**.
  - Intelligent column synonym matching (supports Kaggle dataset formats and snake_case).
  - Aggregate metrics dashboard: Total Evaluated, Churn Risk Count, Overall Churn Rate %, and High-Risk Intervention counts.
  - Interactive table with live search (Customer ID, country, etc.) and filter tabs (All, Churn Risk, Retained, High Risk).
  - Export enriched predictions with recommendations as CSV.
  - 1-click sample dataset download directly from the UI.
- **System Monitoring**:
  - Live backend connectivity monitor with auto-reconnect checks.

## Getting Started

### 1. Start the FastAPI Backend
In a terminal:
```bash
cd Week11_Task/churn-predictor-api
.venv\Scripts\activate       # On Windows
uvicorn app.main:app --reload --port 8000
```

### 2. Start the React Frontend
In a separate terminal:
```bash
cd Week11_Task/frontend/churn-predictor
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.
