from fastapi import FastAPI, Request, HTTPException
from fastapi.staticfiles import StaticFiles 
from fastapi.templating import Jinja2Templates 
from fastapi.responses import HTMLResponse 
 
from app.schemas import TicketRequest, TicketResponse
from app.predict import predict_category
 
app = FastAPI(
    title="Support Ticket Classifier API",
    description="Classifies support tickets into catlegories using a trained ML model.",
    version="1.0.0",
)
 
# serve CSS/JS and the HTML template
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")
 
 
@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})
 
 
@app.post("/predict", response_model=TicketResponse)
def predict(payload: TicketRequest):
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text field cannot be empty")
 
    category, confidence = predict_category(payload.text)
    return TicketResponse(category=category, confidence=confidence)
 
 
@app.get("/health")
def health_check():
    return {"status": "ok"}
