from fastapi import FastAPI,HTTPException # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
 
from app.schemas import TicketRequest, TicketResponse
from app.predict import predict_category
 
app = FastAPI(
    title="Support Ticket Classifier API",
    description="Classifies support tickets into categories using a trained ML model.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
@app.post("/predict", response_model=TicketResponse)
async def predict(payload: TicketRequest):
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text field cannot be empty")
 
    category, confidence = predict_category(payload.text)
    return TicketResponse(category=category, confidence=confidence)
 
 
@app.get("/health")
async def health_check():
    return {"status": "ok"}
