import logging
import random
import time

logger = logging.getLogger(__name__)

# DEMO MODE: No heavy models are loaded to ensure the app runs on the 512MB free tier.
MODEL_LOADED = False
print("Running in DEMO MODE (Mock Predictions) to save memory.")

def get_disease_prediction(image):
    """
    Takes a PIL Image and returns a tuple of (prediction_label, confidence_score).
    Since we are in demo mode, it returns realistic-looking mock data.
    """
    # Simulate processing delay
    time.sleep(1.5)
    
    # Possible realistic outcomes
    outcomes = [
        ("Wheat: Yellow Rust", random.uniform(0.85, 0.99)),
        ("Wheat: Brown Rust", random.uniform(0.82, 0.97)),
        ("Wheat: Healthy", random.uniform(0.90, 0.99))
    ]
    
    # Pick a random outcome for the demo
    prediction, confidence = random.choice(outcomes)
    
    return prediction, confidence
