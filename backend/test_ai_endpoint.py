"""
Test the AI endpoint to verify Gemini integration works
"""

import requests
import json

# Test the endpoint
url = "http://localhost:8000/api/ai/generate-gift-message"

payload = {
    "recipient_name": "Sarah",
    "sender_name": "John",
    "gift_name": "Digital Birthday Card",
    "gift_type": "digital_card"
}

print("Testing AI endpoint...")
print(f"URL: {url}")
print(f"Payload: {json.dumps(payload, indent=2)}\n")

try:
    response = requests.post(url, json=payload, timeout=30)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print("SUCCESS! AI endpoint is working!")
        print(f"\nGenerated Message:\n{data.get('message', 'N/A')}\n")
        print(f"Success: {data.get('success', False)}")
        print(f"Message Length: {len(data.get('message', ''))} characters")
    else:
        print(f"ERROR: {response.status_code}")
        print(f"Response: {response.text}")
        
except requests.exceptions.ConnectionError:
    print("ERROR: Could not connect to server.")
    print("Make sure the backend server is running on http://localhost:8000")
except Exception as e:
    print(f"ERROR: {e}")

