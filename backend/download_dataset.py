import os
import sys

def main():
    print("Wheat Disease Dataset Downloader")
    print("================================")
    print("This script uses the Kaggle API to download the 'Wheat Leaf Dataset'.")
    print("Before running, you must:")
    print("1. Have a Kaggle account.")
    print("2. Create an API token from your Kaggle account settings (kaggle.json).")
    print("3. Place kaggle.json in ~/.kaggle/kaggle.json (Linux/Mac) or C:\\Users\\<User>\\.kaggle\\kaggle.json (Windows).")
    print("4. Install the kaggle library: pip install kaggle")
    print("")
    
    response = input("Do you have your kaggle.json configured? (y/n): ")
    if response.lower() != 'y':
        print("Please configure your Kaggle credentials and run this script again.")
        sys.exit(0)

    try:
        import kaggle
    except ImportError:
        print("Error: The 'kaggle' library is not installed. Please run: pip install kaggle")
        sys.exit(1)

    dataset_name = "olyadgetch/wheat-leaf-dataset" # Common wheat leaf dataset on kaggle
    download_path = "./datasets/wheat_leaves"
    
    print(f"Downloading dataset '{dataset_name}' to '{download_path}'...")
    
    # Create directory if it doesn't exist
    os.makedirs(download_path, exist_ok=True)
    
    try:
        kaggle.api.dataset_download_files(dataset_name, path=download_path, unzip=True)
        print("Download and extraction complete!")
        print(f"Dataset is ready at: {os.path.abspath(download_path)}")
    except Exception as e:
        print(f"An error occurred during download: {e}")
        print("Make sure you have accepted any rules for the dataset on Kaggle if required.")

if __name__ == "__main__":
    main()
