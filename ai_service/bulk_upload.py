import os
import requests
import cloudinary
import cloudinary.uploader
import re
import json

# Configuration
BASE_URL = "http://localhost:8080"
AI_SERVICE_URL = "http://localhost:5000"
IMAGE_DIR = r"C:\Users\jaiga\Downloads\Image"
CLOUD_NAME = "dfvkfmf4s"
API_KEY = "785688242659644"
API_SECRET = "9Bmo2cYJSgzmFRdhQsPAkka-eQo"

# Initialize Cloudinary
cloudinary.config(
  cloud_name = CLOUD_NAME,
  api_key = API_KEY,
  api_secret = API_SECRET
)

def get_jwt(email, password):
    print(f"Logging in as {email}...")
    try:
        resp = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": password})
        if resp.status_code == 200:
            return resp.json().get('token')
        else:
            print(f"Login failed: {resp.text}")
            return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def upload_to_cloudinary(filepath, folder):
    print(f"Uploading {filepath} to Cloudinary folder {folder}...")
    try:
        result = cloudinary.uploader.upload(filepath, folder=folder)
        return result.get('secure_url')
    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        return None

def process_categories(token):
    cat_dir = os.path.join(IMAGE_DIR, "category")
    if not os.path.exists(cat_dir):
        print("Category directory not found.")
        return

    headers = {"Authorization": f"Bearer {token}"}
    
    # Get existing categories
    resp = requests.get(f"{BASE_URL}/api/categories")
    existing_cats = {c['name']: c['id'] for c in resp.json()} if resp.status_code == 200 else {}

    for file in os.listdir(cat_dir):
        if file.lower().endswith(('.png', '.jpg', '.jpeg')):
            name = os.path.splitext(file)[0]
            img_url = upload_to_cloudinary(os.path.join(cat_dir, file), "categories")
            
            if name in existing_cats:
                print(f"Updating category {name}...")
                requests.put(f"{BASE_URL}/api/categories/{existing_cats[name]}", 
                             json={"name": name, "imageUrl": img_url}, headers=headers)
            else:
                print(f"Creating category {name}...")
                requests.post(f"{BASE_URL}/api/categories", 
                              json={"name": name, "imageUrl": img_url, "description": f"Fresh {name}"}, headers=headers)

def parse_rtf_with_ai(filepath):
    """Call AI service to parse RTF details."""
    try:
        with open(filepath, 'r', encoding='latin-1') as f:
            content = f.read()
            
        resp = requests.post(f"{AI_SERVICE_URL}/api/parse-rtf", json={"content": content})
        if resp.status_code == 200:
            return resp.json()
        else:
            print(f"AI parsing failed for {filepath}: {resp.text}")
            return None
    except Exception as e:
        print(f"Error calling AI for {filepath}: {e}")
        return None

def process_products(token):
    prod_root = os.path.join(IMAGE_DIR, "product")
    if not os.path.exists(prod_root):
        print("Product directory not found.")
        return

    headers = {"Authorization": f"Bearer {token}"}
    
    # Prefetch categories and subcategories
    cat_resp = requests.get(f"{BASE_URL}/api/categories")
    categories = {c['name']: c['id'] for c in cat_resp.json()} if cat_resp.status_code == 200 else {}

    subcat_resp = requests.get(f"{BASE_URL}/api/subcategories")
    subcategories = {s['name']: s['id'] for s in subcat_resp.json()} if subcat_resp.status_code == 200 else {}

    for cat_name in os.listdir(prod_root):
        cat_path = os.path.join(prod_root, cat_name)
        if not os.path.isdir(cat_path): continue
        
        cat_id = categories.get(cat_name)
        if not cat_id:
            print(f"Creating missing category {cat_name}...")
            r = requests.post(f"{BASE_URL}/api/categories", json={"name": cat_name}, headers=headers)
            if r.status_code == 200:
                cat_id = r.json().get('category', {}).get('id')
                categories[cat_name] = cat_id
            else: continue

        for sub_name in os.listdir(cat_path):
            sub_path = os.path.join(cat_path, sub_name)
            if not os.path.isdir(sub_path): continue
            
            sub_id = subcategories.get(sub_name)
            if not sub_id:
                print(f"Creating missing subcategory {sub_name} for {cat_name}...")
                r = requests.post(f"{BASE_URL}/api/subcategories", 
                                  json={"name": sub_name, "categoryId": cat_id}, headers=headers)
                if r.status_code == 200:
                    sub_id = r.json().get('subCategory', {}).get('id')
                    subcategories[sub_name] = sub_id
                else: continue

            for prod_name_folder in os.listdir(sub_path):
                prod_path = os.path.join(sub_path, prod_name_folder)
                if not os.path.isdir(prod_path): continue
                
                print(f"Processing product: {prod_name_folder}")
                
                details_file = os.path.join(prod_path, "product details.rtf")
                ai_details = parse_rtf_with_ai(details_file) if os.path.exists(details_file) else None
                
                if not ai_details:
                    ai_details = {
                        "Product Name": prod_name_folder,
                        "MRP": 99,
                        "Brand": prod_name_folder.split()[0],
                        "Description": f"High quality {prod_name_folder}"
                    }
                
                # Fetch first image
                img_url = None
                for file in os.listdir(prod_path):
                    if file.lower().endswith(('.png', '.jpg', '.jpeg')) and not file.startswith('.'):
                        img_url = upload_to_cloudinary(os.path.join(prod_path, file), f"products/{cat_name}/{sub_name}")
                        if img_url: break

                # Prepare product payload
                price = ai_details.get('MRP', 99)
                if isinstance(price, str):
                    price = re.sub(r'[^\d.]', '', price)
                    price = float(price) if price else 99.0

                payload = {
                    "name": ai_details.get('Product Name', prod_name_folder),
                    "description": ai_details.get('Description', f"High quality {prod_name_folder}"),
                    "price": str(price),
                    "stock": "100",
                    "categoryId": str(cat_id),
                    "subCategoryId": str(sub_id),
                    "imageUrl": img_url if img_url else "",
                    "brand": ai_details.get('Brand', 'Generic'),
                    "offerPercentage": "10"
                }
                
                print(f"Saving product: {payload['name']}...")
                requests.post(f"{BASE_URL}/api/products", headers=headers, data=payload)

if __name__ == "__main__":
    email = "jaiganeshrio474@gmail.com"
    password = "123456"
    
    token = get_jwt(email, password)
    if token:
        print("Success! token acquired.")
        print("--- Step 1: Processing Categories ---")
        process_categories(token)
        print("--- Step 2: Processing Products ---")
        process_products(token)
        print("Automation Complete!")
    else:
        print("Failed to start automation: No access token.")
