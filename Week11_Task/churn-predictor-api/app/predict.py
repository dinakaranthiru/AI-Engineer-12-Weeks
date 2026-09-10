import os
import joblib
import pandas as pd
import numpy as np

# Load the trained pipeline ONCE when the module is imported.
# Use robust path resolution so it works regardless of current working directory.
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(os.path.dirname(CURRENT_DIR), "model", "churn_model.pkl")
if not os.path.exists(MODEL_PATH):
    # Fallback to relative path
    MODEL_PATH = "model/churn_model.pkl"

model = joblib.load(MODEL_PATH)

FEATURE_ORDER = [
    "credit_score",
    "country",
    "gender",
    "age",
    "tenure",
    "balance",
    "products_number",
    "credit_card",
    "active_member",
    "estimated_salary",
]


def assess_risk(probability: float):
    """Categorize risk level and suggest proactive retention advice."""
    if probability >= 0.70:
        return "High", "Immediate intervention recommended: offer personalized account terms, fee waiver, or loyalty manager outreach."
    elif probability >= 0.40:
        return "Medium", "Moderate risk: engage with tailored product offerings, rewards program, or service check-in."
    else:
        return "Low", "Healthy customer relationship: maintain standard relationship cadence and cross-sell opportunities."


def predict_churn(payload: dict):
    """Run the pipeline on a single customer record and return
    (churn_label: int, probability_of_churn: float, risk_level: str, recommendation: str)."""
    row = pd.DataFrame([payload], columns=FEATURE_ORDER)
    prediction = int(model.predict(row)[0])
    probability = float(model.predict_proba(row)[0][1])  # P(churn = 1)
    risk_level, recommendation = assess_risk(probability)
    return prediction, round(probability, 4), risk_level, recommendation


def predict_churn_batch(df: pd.DataFrame):
    """Run batch prediction on a pandas DataFrame with features matching FEATURE_ORDER.
    Returns (records: list[dict], summary: dict)."""
    # Ensure all required features are present
    missing = [f for f in FEATURE_ORDER if f not in df.columns]
    if missing:
        raise ValueError(f"Missing required feature columns: {', '.join(missing)}")

    # Subset to model features in precise order
    feature_df = df[FEATURE_ORDER].copy()
    
    # Run predictions
    predictions = model.predict(feature_df)
    probabilities = model.predict_proba(feature_df)[:, 1]

    results = []
    high_risk_count = 0
    med_risk_count = 0
    low_risk_count = 0

    for idx, (original_idx, row) in enumerate(df.iterrows()):
        pred = int(predictions[idx])
        prob = round(float(probabilities[idx]), 4)
        risk_level, rec = assess_risk(prob)

        if risk_level == "High":
            high_risk_count += 1
        elif risk_level == "Medium":
            med_risk_count += 1
        else:
            low_risk_count += 1

        # Preserve identifiers like customer_id if present in input
        record = {
            "row_index": idx + 1,
            "churn": pred,
            "label": "Likely to churn" if pred == 1 else "Likely to stay",
            "probability": prob,
            "probability_percent": round(prob * 100, 1),
            "risk_level": risk_level,
            "recommendation": rec,
        }

        if "customer_id" in df.columns:
            record["customer_id"] = str(row["customer_id"])
        
        # Include feature values in record for frontend display
        for col in FEATURE_ORDER:
            val = row[col]
            if pd.isna(val):
                record[col] = None
            elif isinstance(val, (np.integer, int)):
                record[col] = int(val)
            elif isinstance(val, (np.floating, float)):
                record[col] = round(float(val), 2)
            else:
                record[col] = str(val)

        results.append(record)

    total = len(results)
    churn_count = sum(1 for r in results if r["churn"] == 1)
    stay_count = total - churn_count
    churn_rate = round((churn_count / total * 100), 2) if total > 0 else 0.0
    avg_prob = round((sum(r["probability"] for r in results) / total), 4) if total > 0 else 0.0

    summary = {
        "total_records": total,
        "churn_count": churn_count,
        "stay_count": stay_count,
        "churn_rate_pct": churn_rate,
        "avg_churn_probability": avg_prob,
        "high_risk_count": high_risk_count,
        "medium_risk_count": med_risk_count,
        "low_risk_count": low_risk_count,
    }

    return results, summary
