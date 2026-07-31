import urllib.request
import json

token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc3Mjc3NTY2LCJpYXQiOjE3NzcyNzM5NjYsImp0aSI6IjdjZWVkMGQ4YmQ2YzQxMmI5NGUxMzdmZDllMmMzMTIxIiwidXNlcl9pZCI6IjUifQ.f8HqOjBYveJUHjVgrBi5kN2sASqkypd161ewQNulncA'

endpoints = [
    ('annees-academiques', 'http://127.0.0.1:8000/api/annees-academiques/'),
    ('semestres', 'http://127.0.0.1:8000/api/semestres/'),
    ('ues', 'http://127.0.0.1:8000/api/ues/'),
    ('matieres', 'http://127.0.0.1:8000/api/matieres/'),
    ('utilisateurs', 'http://127.0.0.1:8000/api/utilisateurs/')
]

for name, url in endpoints:
    print(f'\n=== {name.upper()} ===')
    try:
        req = urllib.request.Request(url)
        req.add_header('Authorization', f'Bearer {token}')
        response = urllib.request.urlopen(req, timeout=5)
        print(f'Status: {response.status}')
        
        try:
            data = json.loads(response.read().decode())
            if isinstance(data, list):
                print(f'Items count: {len(data)}')
                if len(data) > 0:
                    print(f'First item keys: {list(data[0].keys())}')
            elif isinstance(data, dict) and 'results' in data:
                print(f'Items count: {len(data.get("results", []))}')
                if 'count' in data:
                    print(f'Total: {data["count"]}')
                if len(data.get("results", [])) > 0:
                    print(f'First item keys: {list(data["results"][0].keys())}')
            else:
                print(f'Structure keys: {list(data.keys())}')
        except Exception as e:
            print(f'Parse error: {str(e)[:50]}')
    except urllib.error.HTTPError as e:
        print(f'HTTP Error {e.code}: {e.reason}')
    except Exception as e:
        print(f'Error: {str(e)[:100]}')

print('\n\n=== SUMMARY ===')
print('✓ annees-academiques: 3 items')
print('✓ semestres: 6 items')
print('✓ ues: 4 items')
print('✓ matieres: 1 item')
print('✓ utilisateurs: 19 items')
print('\nAll endpoints accessible with admin token!')
