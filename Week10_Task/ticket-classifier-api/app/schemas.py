from pydantic import BaseModel, Field 
 
 
class TicketRequest(BaseModel):
    text: str = Field(..., min_length=1, examples=["cannot login to system"])
 
 
class TicketResponse(BaseModel):
    category: str
    confidence: float
