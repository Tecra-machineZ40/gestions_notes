import base64
import json

# Decode the access token to see the embedded claims
access_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc2NzU4MTU4LCJpYXQiOjE3NzY3NTQ1NTgsImp0aSI6Ijk3ZmEzMGY0OTlmZDQwZjdhZDBjN2JiNTE4ODkzNWMzIiwidXNlcl9pZCI6IjUifQ.XV1ztye8kmigRKnczuIwOTDceM-HkCUlJXvjC1cKx-Y'

# Split the token
parts = access_token.split('.')
if len(parts) == 3:
    # Decode the payload (second part)
    payload = parts[1]
    # Add padding if needed
    padding = 4 - len(payload) % 4
    if padding != 4:
        payload += '=' * padding
    
    decoded = base64.urlsafe_b64decode(payload)
    claims = json.loads(decoded)
    print('JWT Claims:')
    print(json.dumps(claims, indent=2))
