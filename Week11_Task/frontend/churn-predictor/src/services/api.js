// API client for Customer Churn Predictor FastAPI Backend

const API_BASE_URL = 'http://127.0.0.1:8000';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    // If direct fails (e.g. strict CORS), try Vite proxy /api fallback
    try {
      const fallbackRes = await fetch('/api/health');
      if (fallbackRes.ok) {
        return await fallbackRes.json();
      }
    } catch {
      // ignore
    }
    throw new Error(err.message || 'Cannot reach backend server');
  }
}

/**
 * Predict churn for a single customer
 */
export async function predictSingleCustomer(customer) {
  const payload = {
    credit_score: Number(customer.credit_score),
    country: customer.country,
    gender: customer.gender,
    age: Number(customer.age),
    tenure: Number(customer.tenure),
    balance: Number(customer.balance),
    products_number: Number(customer.products_number),
    credit_card: Number(customer.credit_card),
    active_member: Number(customer.active_member),
    estimated_salary: Number(customer.estimated_salary),
  };

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Try proxy fallback
    try {
      response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error(
        `Failed to connect to backend at ${API_BASE_URL}. Ensure uvicorn server is running on port 8000.`
      );
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || `Prediction failed with status ${response.status}`;
    throw new Error(message);
  }

  return await response.json();
}

/**
 * Upload CSV, Excel (.xlsx/.xls), or TXT file for batch churn prediction
 */
export async function predictFromFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/predict/file`, {
      method: 'POST',
      body: formData,
    });
  } catch (err) {
    try {
      response = await fetch('/api/predict/file', {
        method: 'POST',
        body: formData,
      });
    } catch {
      throw new Error(
        `Failed to reach backend at ${API_BASE_URL}. Please ensure the backend is running.`
      );
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || `File prediction failed (HTTP ${response.status})`;
    throw new Error(message);
  }

  return await response.json();
}

/**
 * Get URL to download sample CSV template
 */
export function getSampleCsvUrl() {
  return `${API_BASE_URL}/template/sample.csv`;
}

