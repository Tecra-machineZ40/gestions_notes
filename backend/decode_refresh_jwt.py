import base64
import json

# Decode the refresh token as well
refresh_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc3NzM1OTM1OCwiaWF0IjoxNzc2NzU0NTU4LCJqdGkiOiJkM2M5M2M0ZDU4OGQ0NGM3YTEwMmZlMmU2Y2EyNGQ4NiIsInVzZXJfaWQiOiI1In0.epgFoaFsap5F1KUTJD3w1L1FHSH-dQLfI7Htsf-ZOyY'

parts = refresh_token.split('.')
if len(parts) == 3:
    payload = parts[1]
    padding = 4 - len(payload) % 4
    if padding != 4:
        payload += '=' * padding
    
    decoded = base64.urlsafe_b64decode(payload)
    claims = json.loads(decoded)
    print('Refresh JWT Claims:')
    print(json.dumps(claims, indent=2))
