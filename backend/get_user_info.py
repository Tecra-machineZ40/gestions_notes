import urllib.request
import json

access_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc2NzU4MTU4LCJpYXQiOjE3NzY3NTQ1NTgsImp0aSI6Ijk3ZmEzMGY0OTlmZDQwZjdhZDBjN2JiNTE4ODkzNWMzIiwidXNlcl9pZCI6IjUifQ.XV1ztye8kmigRKnczuIwOTDceM-HkCUlJXvjC1cKx-Y'

# Try common user info endpoints
endpoints = [
    'http://localhost:8000/api/user/',
    'http://localhost:8000/api/auth/user/',
    'http://localhost:8000/api/users/me/',
    'http://localhost:8000/api/users/5/'
]

for endpoint in endpoints:
    try:
        req = urllib.request.Request(endpoint, headers={'Authorization': f'Bearer {access_token}'})
        response = urllib.request.urlopen(req)
        print(f'Endpoint: {endpoint}')
        print(f'Status Code: {response.status}')
        print('Response:')
        print(json.dumps(json.loads(response.read().decode('utf-8')), indent=2))
        print()
        break
    except Exception as e:
        print(f'{endpoint}: {str(e)}')
        continue
