# Bank Customer Churn Prediction API

A FastAPI service that serves a trained scikit-learn RandomForest pipeline
for predicting whether a bank customer is likely to churn, with a simple
browser UI for testing.

## Run locally

```bash
python -m venv venv
source venv/bin/activate        # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Then open http://127.0.0.1:8000/

## Endpoints

- `GET /` — browser fallback UI
- `POST /predict` — JSON in, churn prediction + probability out
- `POST /predict/file` — Multi-format file upload (CSV, Excel `.xlsx`/`.xls`, TXT), batch inference output with summary metrics and risk distribution
- `GET /template/sample.csv` — Download ready-to-test sample customer dataset
- `GET /health` — health check
- `GET /docs` — Swagger UI documentation

## Example request

```bash
curl -X POST "http://127.0.0.1:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{"credit_score":619,"country":"France","gender":"Female","age":42,"tenure":2,"balance":0,"products_number":1,"credit_card":1,"active_member":1,"estimated_salary":101348.88}'
```

Expected response:

```json
{"churn": 1, "label": "Likely to churn", "probability": 0.82}
```
