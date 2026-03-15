from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai
from dotenv import load_dotenv
import json

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini AI
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
else:
    print("Warning: GEMINI_API_KEY not found in environment")

try:
    model = genai.GenerativeModel('gemini-2.5-flash')
except Exception as e:
    model = None
    print(f"Error initializing Gemini: {e}")

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    data = request.json
    user_message = data.get('message', '')
    
    if not model:
        return jsonify({'response': "AI currently unavailable", 'error': 'No model loaded'}), 503

    try:
        # Generate response using Google Gemini
        response = model.generate_content(
            f"You are QuickCart AI, a helpful e-commerce assistant. Answer formatting must be concise. User says: {user_message}"
        )
        return jsonify({
            'response': response.text,
            'status': 'success'
        })
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'failed'}), 500

@app.route('/api/recommend', methods=['POST'])
def recommend():
    data = request.json
    history = data.get('history', []) # List of product names or categories viewed
    recent_searches = data.get('searches', [])
    
    if not model or (not history and not recent_searches):
        return jsonify({
            'recommendations': [],
            'status': 'no_history'
        })

    try:
        # Construct a prompt for Gemini to suggest categories/products
        history_str = ", ".join(history[-5:])
        search_str = ", ".join(recent_searches[-5:])
        
        prompt = f"""
        User recent views: {history_str}
        User recent searches: {search_str}
        
        Based on this data, suggest 3-4 relatable product categories or specific search terms they might be interested in.
        Return ONLY a JSON list of strings. Example: ["Wireless Headphones", "Mechanical Keyboards", "Ergonomic Chairs"]
        """
        
        response = model.generate_content(prompt)
        # Clean up response text in case it contains markdown
        text = response.text.strip()
        if text.startswith('```json'):
            text = text[7:-3].strip()
        elif text.startswith('```'):
            text = text[3:-3].strip()
            
        recommendations = json.loads(text)
        
        return jsonify({
            'recommendations': recommendations,
            'status': 'success'
        })
    except Exception as e:
        print(f"Error in recommendations: {e}")
        return jsonify({'recommendations': [], 'status': 'failed', 'error': str(e)}), 500

@app.route('/api/market-sync', methods=['POST'])
def market_sync():
    data = request.json
    products = data.get('products', [])
    
    if not model or not products:
        return jsonify({'products': products, 'status': 'no_model_or_data'})

    try:
        # We process products in batches to avoid token limits
        prompt = f"""
        Transform these placeholder product objects into REAL, TOP-BRAND products available in the market right now (2024-2026).
        Change name, brand, description, and price (in INR) to match premium real-world standards.
        Keep the categories as is but make the products "WOW" level.
        Return ONLY a JSON list of objects with keys: id, name, brand, description, price, imageUrl.
        
        Input: {json.dumps(products[:10])}
        """
        
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith('```json'):
            text = text[7:-3].strip()
        elif text.startswith('```'):
            text = text[3:-3].strip()
            
        transformed = json.loads(text)
        
        return jsonify({
            'products': transformed,
            'status': 'success'
        })
    except Exception as e:
        print(f"Error in market sync: {e}")
        return jsonify({'products': products, 'status': 'failed', 'error': str(e)}), 500

@app.route('/api/parse-rtf', methods=['POST'])
def parse_rtf():
    try:
        data = request.get_json()
        rtf_content = data.get('content', '')
        
        prompt = f"""
        Extract the following details from this RTF product description:
        - Product Name
        - MRP (Price in INR)
        - Brand
        - Description
        - Weight/Unit (e.g. 1 l, 500 g)
        
        Return the result as a JSON object only.
        
        RTF Content:
        {rtf_content}
        """
        
        response = model.generate_content(prompt)
        text = response.text
        
        # Clean the response to ensure it's valid JSON
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        return jsonify(json.loads(text))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
