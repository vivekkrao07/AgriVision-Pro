from transformers import pipeline
import logging

# Initialize the pipelines globally so they're only loaded once when the app starts.
MODEL_NAME = "wambugu71/crop_leaf_diseases_vit"
VALIDATION_MODEL_NAME = "openai/clip-vit-base-patch32"

logger = logging.getLogger(__name__)

try:
    print(f"Loading validation model {VALIDATION_MODEL_NAME}...")
    validator = pipeline("zero-shot-image-classification", model=VALIDATION_MODEL_NAME)
    print(f"Loading disease model {MODEL_NAME}...")
    classifier = pipeline("image-classification", model=MODEL_NAME)
    print("Models loaded successfully.")
    MODEL_LOADED = True
except Exception as e:
    logger.error(f"Failed to load models: {e}")
    print("Falling back to mock prediction mode due to model loading failure.")
    MODEL_LOADED = False

def get_disease_prediction(image):
    """
    Takes a PIL Image and returns a tuple of (prediction_label, confidence_score).
    Raises ValueError if the image is not detected as a leaf.
    """
    if not MODEL_LOADED:
        return "Wheat___Healthy (Mock)", 0.99

    try:
        # 1. Validation Step: Check if it's actually a leaf
        # We ask CLIP to classify the image into these categories
        validation_labels = ["a crop leaf", "a person", "a car", "a room", "random objects", "an animal"]
        val_predictions = validator(image, candidate_labels=validation_labels)
        
        top_val = val_predictions[0]
        # If the top prediction is NOT "a crop leaf", reject it
        if top_val['label'] != "a crop leaf" and top_val['score'] > 0.3:
            # Optionally we can be more lenient, but if it thinks it's a person/car/room with >30% conf and "a crop leaf" is lower, reject.
            # Actually, just checking if the top label is not a leaf is robust for CLIP.
            if top_val['label'] != "a crop leaf":
                 raise ValueError("This image does not appear to be a crop leaf. Please upload a valid leaf image.")

        # 2. Disease Prediction Step
        predictions = classifier(image)
        
        # Get the top prediction
        top_prediction = predictions[0]
        
        # Clean up the label format (e.g., "Wheat___Yellow_Rust" -> "Wheat: Yellow Rust")
        label = top_prediction['label']
        if "___" in label:
            parts = label.split("___")
            label = f"{parts[0]}: {parts[1].replace('_', ' ')}"
            
        return label, top_prediction['score']
    except ValueError as ve:
        # Re-raise the validation error so it reaches the frontend
        raise ve
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return "Error predicting disease", 0.0
