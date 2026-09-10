import io
import re
import pandas as pd
from fastapi import FastAPI,UploadFile, File, HTTPException # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from fastapi.responses import  Response # type: ignore

from app.schemas import CustomerRequest, ChurnResponse, BatchPredictionResponse, BatchSummary
from app.predict import predict_churn, predict_churn_batch, FEATURE_ORDER

app = FastAPI(
    title="Bank Customer Churn Prediction API",
    description="Predicts whether bank customers are likely to churn using a trained ML model.",
    version="1.1.0",
    debug=True
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Normalization mapping for CSV/Excel/TXT headers
COLUMN_SYNONYMS = {
    "credit_score": ["credit_score", "creditscore", "credit score", "score"],
    "country": ["country", "geography", "nation", "location"],
    "gender": ["gender", "sex"],
    "age": ["age"],
    "tenure": ["tenure", "years_with_bank", "years"],
    "balance": ["balance", "account_balance", "current_balance"],
    "products_number": ["products_number", "numofproducts", "num_products", "number_of_products", "products", "products_count"],
    "credit_card": ["credit_card", "hascrcard", "has_credit_card", "has_cr_card", "creditcard"],
    "active_member": ["active_member", "isactivemember", "is_active_member", "active"],
    "estimated_salary": ["estimated_salary", "estimatedsalary", "salary", "annual_salary"],
    "customer_id": ["customer_id", "customerid", "cust_id", "id", "customer_no"],
}


def clean_col_name(col: str) -> str:
    """Normalize string: lowercase, remove non-alphanumeric except underscore, strip."""
    return re.sub(r"[^a-z0-9_]+", "", str(col).strip().lower().replace(" ", "_"))


def normalize_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Rename columns to standard FEATURE_ORDER names based on synonyms."""
    col_map = {}
    cleaned_to_orig = {clean_col_name(c): c for c in df.columns}

    for standard_col, synonyms in COLUMN_SYNONYMS.items():
        found = False
        for syn in synonyms:
            cleaned_syn = clean_col_name(syn)
            if cleaned_syn in cleaned_to_orig:
                orig_col = cleaned_to_orig[cleaned_syn]
                col_map[orig_col] = standard_col
                found = True
                break

    df = df.rename(columns=col_map)

    # Check missing required features
    missing = [f for f in FEATURE_ORDER if f not in df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Uploaded file is missing required column(s): {', '.join(missing)}. "
                   f"Found columns: {list(df.columns)}. Supported columns include: {list(COLUMN_SYNONYMS.keys())}"
        )

    # Clean country values
    country_map = {
        "france": "France",
        "germany": "Germany",
        "spain": "Spain"
    }
    df["country"] = df["country"].astype(str).str.strip().str.lower().map(
        lambda x: country_map.get(x, "France")
    )

    # Clean gender values
    def clean_gender(val):
        s = str(val).strip().lower()
        if s.startswith("f"):
            return "Female"
        return "Male"

    df["gender"] = df["gender"].apply(clean_gender)

    # Ensure numeric columns are cleanly coerced
    numeric_cols = ["credit_score", "age", "tenure", "balance", "products_number", "credit_card", "active_member", "estimated_salary"]
    for nc in numeric_cols:
        df[nc] = pd.to_numeric(df[nc], errors="coerce").fillna(0)

    # Coerce integers
    df["credit_score"] = df["credit_score"].astype(int)
    df["age"] = df["age"].astype(int)
    df["tenure"] = df["tenure"].astype(int)
    df["products_number"] = df["products_number"].astype(int).clip(lower=1, upper=4)
    df["credit_card"] = df["credit_card"].astype(int).clip(lower=0, upper=1)
    df["active_member"] = df["active_member"].astype(int).clip(lower=0, upper=1)

    return df


@app.post("/predict", response_model=ChurnResponse)
async def predict(payload: CustomerRequest):
    churn, probability, risk_level, recommendation = predict_churn(payload.model_dump())

    label = "Likely to churn" if churn == 1 else "Likely to stay"

    return ChurnResponse(
        churn=churn,
        label=label,
        probability=probability,
        probability_percent=round(probability * 100, 1),
        risk_level=risk_level,
        recommendation=recommendation
    )


@app.post("/predict/file", response_model=BatchPredictionResponse)
async def predict_file(file: UploadFile = File(...)):
    """Accepts CSV, Excel (.xlsx, .xls), or delimited TXT files and returns batch predictions."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file was uploaded.")

    filename = file.filename
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    contents = await file.read()

    if not contents:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    format_detected = ext

    try:
        if ext in ["xlsx", "xls"]:
            format_detected = "Excel (" + ext + ")"
            df = pd.read_excel(io.BytesIO(contents))
        elif ext == "csv":
            format_detected = "CSV"
            try:
                df = pd.read_csv(io.BytesIO(contents))
            except UnicodeDecodeError:
                df = pd.read_csv(io.BytesIO(contents), encoding="latin-1")
        elif ext == "txt":
            format_detected = "Delimited Text (TXT)"
            # Try sniffing delimiter or check common delimiters: comma, tab, pipe, semicolon
            sample = contents[:4096].decode("utf-8", errors="replace")
            sep = ","
            if "\t" in sample:
                sep = "\t"
            elif "|" in sample:
                sep = "|"
            elif ";" in sample:
                sep = ";"
            
            try:
                df = pd.read_csv(io.BytesIO(contents), sep=sep)
            except Exception:
                # Fallback to python auto-detection
                df = pd.read_csv(io.BytesIO(contents), sep=None, engine="python")
        else:
            # Try reading as CSV / text table regardless of file extension
            format_detected = f"Generic Text ({ext or 'unknown'})"
            try:
                df = pd.read_csv(io.BytesIO(contents), sep=None, engine="python")
            except Exception:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported file format '{ext}'. Please upload a CSV, Excel (.xlsx/.xls), or TXT file."
                )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    if df.empty:
        raise HTTPException(status_code=400, detail="Uploaded file contains no data rows.")

    # Normalize columns and prepare data
    df = normalize_dataframe(df)

    # Run predictions
    try:
        records, summary = predict_churn_batch(df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction error: {str(e)}")

    return BatchPredictionResponse(
        filename=filename,
        format_detected=format_detected,
        summary=BatchSummary(**summary),
        records=records
    )


@app.get("/template/sample.csv")
async def download_sample_csv():
    """Returns a sample CSV formatted for customer churn prediction."""
    sample_content = (
        "customer_id,credit_score,country,gender,age,tenure,balance,products_number,credit_card,active_member,estimated_salary\n"
        "15634602,619,France,Female,42,2,0.00,1,1,1,101348.88\n"
        "15647311,608,Spain,Female,41,1,83807.86,1,0,1,112542.58\n"
        "15619304,502,France,Female,42,8,159660.80,3,1,0,113931.57\n"
        "15701354,699,France,Female,39,1,0.00,2,0,0,93826.63\n"
        "15737888,850,Spain,Female,43,2,125510.82,1,1,1,79084.10\n"
        "15574012,645,Spain,Male,44,8,113755.78,2,1,0,149756.71\n"
        "15592531,822,France,Male,50,7,0.00,2,1,1,10062.80\n"
        "15656148,376,Germany,Female,29,4,115046.74,4,1,0,119346.88\n"
        "15792365,501,France,Male,44,4,142051.07,2,0,1,74940.50\n"
        "15592389,684,France,Male,27,2,134603.88,1,1,1,71725.73\n"
    )
    return Response(
        content=sample_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=bank_churn_sample.csv"}
    )


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "Bank Customer Churn Predictor",
        "version": "1.1.0",
        "supported_formats": [".csv", ".xlsx", ".xls", ".txt"]
    }