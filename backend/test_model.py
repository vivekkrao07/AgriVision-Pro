
import io
from PIL import Image
import model_handler

def test_prediction():
    # Create a dummy image (green square for healthy)
    img = Image.new('RGB', (224, 224), color = (0, 255, 0))
    try:
        label, score = model_handler.get_disease_prediction(img)
        print(f"Prediction: {label}, Score: {score}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_prediction()
