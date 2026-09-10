from pydantic import BaseModel, Field
from typing import Literal, Optional, List, Dict, Any


class CustomerRequest(BaseModel):
    credit_score: int = Field(..., ge=300, le=900, examples=[619])
    country: Literal["France", "Spain", "Germany"] = Field(..., examples=["France"])
    gender: Literal["Male", "Female"] = Field(..., examples=["Female"])
    age: int = Field(..., ge=18, le=100, examples=[42])
    tenure: int = Field(..., ge=0, le=15, examples=[2])
    balance: float = Field(..., ge=0, examples=[0.0])
    products_number: int = Field(..., ge=1, le=4, examples=[1])
    credit_card: int = Field(..., ge=0, le=1, examples=[1])
    active_member: int = Field(..., ge=0, le=1, examples=[1])
    estimated_salary: float = Field(..., ge=0, examples=[101348.88])


class ChurnResponse(BaseModel):
    churn: int
    label: str
    probability: float
    probability_percent: float
    risk_level: str
    recommendation: str


class BatchSummary(BaseModel):
    total_records: int
    churn_count: int
    stay_count: int
    churn_rate_pct: float
    avg_churn_probability: float
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int


class BatchPredictionResponse(BaseModel):
    filename: str
    format_detected: str
    summary: BatchSummary
    records: List[Dict[str, Any]]
