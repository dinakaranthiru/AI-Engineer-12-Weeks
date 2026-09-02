from fastapi import FastAPI, Request, HTTPException
from fastapi.staticfiles import StaticFiles 
from fastapi.templating import Jinja2Templates 
from fastapi.responses import HTMLResponse 
from fastapi.middleware.cors import CORSMiddleware
 
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
