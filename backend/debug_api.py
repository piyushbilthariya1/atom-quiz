import requests
import json

url = "http://localhost:8000/api/quizzes/"

payload = {
    "title": "Debug Quiz",
    "topic": "Manual",
    "organization_id": "default_org",
    "created_by": "admin",
    "questions": [
        {
            "text": "Is this working?",
            "options": [
                {"text": "Yes", "is_correct": True},
                {"text": "No", "is_correct": False},
                {"text": "Maybe", "is_correct": False},
                {"text": "Unknown", "is_correct": False}
            ],
            "points": 100,
            "time_limit": 30,
            "difficulty": "medium"
        }
    ]
}

try:
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
