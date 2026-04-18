import os
import random
from PIL import Image, ImageEnhance

def augment_image(img):
    angle = random.randint(-45, 45)
    img = img.rotate(angle, expand=True)
    
    if random.choice([True, False]):
        img = img.transpose(Image.FLIP_LEFT_RIGHT)
    if random.choice([True, False]):
        img = img.transpose(Image.FLIP_TOP_BOTTOM)
        
    enhancer = ImageEnhance.Brightness(img)
    img = enhancer.enhance(random.uniform(0.7, 1.3))
    
    enhancer = ImageEnhance.Color(img)
    img = enhancer.enhance(random.uniform(0.7, 1.3))
    
    img = img.resize((224, 224))
    return img

def main():
    base_dir = r"c:\Users\vivek\OneDrive\Desktop\new WHEAT"
    test_dir = os.path.join(base_dir, "test_images")
    output_dir = os.path.join(base_dir, "test")
    
    categories = {
        "Healthy": "healthy_wheat.png",
        "Yellow_Rust": "diseased_wheat.png",
        "Brown_Rust": "brown_rust_wheat.png",
        "Septoria": "septoria_wheat.png",
        "Random_Objects": "random_object.png"
    }
    
    samples_per_category = 60 # 60 * 5 = 300 total samples
    
    for cat_name, file_name in categories.items():
        cat_dir = os.path.join(output_dir, cat_name)
        os.makedirs(cat_dir, exist_ok=True)
        
        base_path = os.path.join(test_dir, file_name)
        try:
            img = Image.open(base_path).convert("RGB")
        except Exception as e:
            print(f"Error opening {base_path}: {e}")
            continue
            
        print(f"Generating {samples_per_category} samples for {cat_name}...")
        for i in range(samples_per_category):
            aug_img = augment_image(img)
            aug_img.save(os.path.join(cat_dir, f"{cat_name.lower()}_aug_{i}.jpg"))
            
    print("Successfully generated 300 test samples across 5 categories in the 'test' folder.")

if __name__ == "__main__":
    main()
