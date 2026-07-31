import urllib.request
import json

url = 'http://localhost:8000/api/token/'
data = json.dumps({'username': 'admin', 'password': 'admin'}).encode('utf-8')
headers = {'Content-Type': 'application/json'}

req = urllib.request.Request(url, data=data, headers=headers, method='POST')

try:
    with urllib.request.urlopen(req, timeout=5) as response:
        print(f'Status Code: {response.status}')
        body = response.read().decode('utf-8')
        print(f'Response: {body}')
except urllib.error.HTTPError as e:
    print(f'HTTP Error {e.code}: {e.reason}')
    try:
        body = e.read().decode('utf-8')
        print(f'Error Response: {body}')
    except:
        pass
except Exception as e:
    print(f'Error: {type(e).__name__}: {e}')
