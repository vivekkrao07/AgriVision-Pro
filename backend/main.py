import io
import os
import random
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from model_handler import get_disease_prediction
from PIL import Image
from pydantic import BaseModel

app = FastAPI(title="Wheat Disease Prediction API")

class ChatRequest(BaseModel):
    message: str
    context: str = None

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple offline response system
OFFLINE_RESPONSES = {
    "yellow rust": [
        "Yellow Rust (Puccinia striiformis) thrives in cool, moist conditions. I recommend applying a triazole fungicide as soon as possible.",
        "To manage Yellow Rust, ensure good air circulation in your field and avoid excessive nitrogen fertilization.",
        "Yellow Rust can spread rapidly. Check your flag leaves daily and consider resistant varieties for your next planting."
    ],
    "brown rust": [
        "Brown Rust (Leaf Rust) prefers slightly warmer temperatures than Yellow Rust. Early detection is key to preventing yield loss.",
        "For Brown Rust, fungicides like tebuconazole are effective. Make sure to spray when the wind is calm.",
        "Keep an eye on humidity levels. Brown Rust spores germinate quickly when leaves stay wet for more than 6 hours."
    ],
    "healthy": [
        "Your wheat looks healthy! Continue monitoring for any signs of discoloration, especially after rain.",
        "Great news, no disease detected. Maintain your current irrigation and nutrient schedule.",
        "Healthy crops are the goal! Remember to rotate crops next season to maintain soil health and prevent future outbreaks."
    ],
    "default": [
        "I'm Kutty Vivek. I can help you with wheat disease diagnosis and treatment plans.",
        "Please upload a clear photo of a wheat leaf so I can provide more specific advice.",
        "Did you know? Wheat rust spores can travel hundreds of miles on the wind. Regular scanning is your best defense."
    ]
}

@app.get("/")
def read_root():
    return {"message": "Wheat Disease Prediction API is running. Use /predict to classify images."}

@app.post("/predict")
async def predict_disease(file: UploadFile = File(...)):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")

    try:
        # Read the image file
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Get prediction
        prediction, confidence = get_disease_prediction(image)
        
        return {
            "success": True,
            "filename": file.filename,
            "prediction": prediction,
            "confidence": round(confidence * 100, 2)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_with_expert(request: ChatRequest):
    msg = request.message.lower()
    context = request.context.lower() if request.context else ""
    
    # Check context first
    if "yellow rust" in context or "yellow rust" in msg:
        response = random.choice(OFFLINE_RESPONSES["yellow rust"])
    elif "brown rust" in context or "brown rust" in msg:
        response = random.choice(OFFLINE_RESPONSES["brown rust"])
    elif "healthy" in context or "healthy" in msg:
        response = random.choice(OFFLINE_RESPONSES["healthy"])
    else:
        response = random.choice(OFFLINE_RESPONSES["default"])
        
    return {"response": response}

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
