from pymongo import MongoClient
import certifi
import os
from dotenv import load_dotenv

load_dotenv()
url = os.getenv("MONGODB_URL")
print(f"Connecting to: {url.split('@')[1] if '@' in url else 'UPDATE_YOUR_ENV'}")

try:
    print("Trying with certifi...")
    client = MongoClient(url, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("Certifi Success!")
except Exception as e:
    print(f"Certifi Failed: {e}")
    try:
        print("Trying with tlsAllowInvalidCertificates=True...")
        client = MongoClient(url, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print("Insecure Success!")
    except Exception as e2:
        print(f"Insecure Failed: {e2}")
