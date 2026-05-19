import urllib.request
import json
import urllib.error

url = 'http://localhost:8000/api/auth/register/admin?org_name=QuizPulse&invite_code=vexite'
data = {
    'email': 'admin@quizpulse.xyz',
    'username': 'admin',
    'full_name': 'Admin',
    'password': 'Afg@2005',
    'role': 'admin'
}
req = urllib.request.Request(url, data=json.dumps(data).encode(), headers={'Content-Type':'application/json'})
try:
    response = urllib.request.urlopen(req)
    print(response.read().decode())
except urllib.error.HTTPError as e:
    print(f"Error {e.code}: {e.read().decode()}")
