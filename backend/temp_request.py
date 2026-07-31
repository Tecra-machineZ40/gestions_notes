import urllib.request
import json

data = json.dumps({'username': 'admin', 'password': 'admin123'}).encode('utf-8')
req = urllib.request.Request('http://localhost:8000/api/token/', data=data, headers={'Content-Type': 'application/json'})

try:
    response = urllib.request.urlopen(req)
    print('Status Code:', response.status)
    print('Response:')
    print(json.dumps(json.loads(response.read().decode('utf-8')), indent=2))
except Exception as e:
    print('Error:', str(e))
