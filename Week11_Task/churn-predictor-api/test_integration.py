import sys
import io
import os
import pandas as pd
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.main import app

client = TestClient(app)

def run_tests():
    print("=== Testing FastAPI Customer Churn Backend ===")

    # 1. Health
    h = client.get('/health')
    assert h.status_code == 200, f'Health failed: {h.text}'
    print('[PASS] Health Check:', h.json())

    # 2. Single Predict
    cust = {
        'credit_score': 619,
        'country': 'France',
        'gender': 'Female',
        'age': 42,
        'tenure': 2,
        'balance': 0.0,
        'products_number': 1,
        'credit_card': 1,
        'active_member': 1,
        'estimated_salary': 101348.88
    }
    p = client.post('/predict', json=cust)
    assert p.status_code == 200, f'Predict failed: {p.text}'
    res = p.json()
    assert 'churn' in res and 'probability' in res and 'risk_level' in res
    print(f"[PASS] Single Predict: {res['label']} ({res['probability_percent']}%, {res['risk_level']} Risk)")

    # 3. CSV with Bank_Customer_Churn_Prediction.csv slice
    csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Bank_Customer_Churn_Prediction.csv')
    raw_df = pd.read_csv(csv_path).head(25)
    csv_buf = io.BytesIO()
    raw_df.to_csv(csv_buf, index=False)
    csv_buf.seek(0)
    c_res = client.post('/predict/file', files={'file': ('bank_churn.csv', csv_buf, 'text/csv')})
    assert c_res.status_code == 200, f'CSV batch failed: {c_res.text}'
    c_data = c_res.json()
    print('[PASS] CSV 25-row Batch:', c_data['summary'])

    # 4. Excel (.xlsx) file
    xlsx_buf = io.BytesIO()
    raw_df.head(10).to_excel(xlsx_buf, index=False)
    xlsx_buf.seek(0)
    x_res = client.post('/predict/file', files={'file': ('customers.xlsx', xlsx_buf, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')})
    assert x_res.status_code == 200, f'Excel batch failed: {x_res.text}'
    x_data = x_res.json()
    print('[PASS] Excel 10-row Batch:', x_data['summary'])

    # 5. TXT file (pipe delimited)
    txt_buf = io.BytesIO()
    raw_df.head(5).to_csv(txt_buf, sep='|', index=False)
    txt_buf.seek(0)
    t_res = client.post('/predict/file', files={'file': ('customers.txt', txt_buf, 'text/plain')})
    assert t_res.status_code == 200, f'TXT batch failed: {t_res.text}'
    t_data = t_res.json()
    print('[PASS] Pipe-delimited TXT Batch:', t_data['summary'])

    # 6. Template CSV download
    tpl = client.get('/template/sample.csv')
    assert tpl.status_code == 200 and 'attachment' in tpl.headers.get('content-disposition', '')
    print(f"[PASS] Sample CSV Download endpoint: 200 OK, length = {len(tpl.content)}")

    print("\nALL 6 INTEGRATION TESTS PASSED SUCCESSFULLY!")

if __name__ == '__main__':
    run_tests()

