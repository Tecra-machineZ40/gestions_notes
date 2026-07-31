import json

full_response = {
    "status_code": 200,
    "tokens": {
        "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc2NzU4MTU4LCJpYXQiOjE3NzY3NTQ1NTgsImp0aSI6Ijk3ZmEzMGY0OTlmZDQwZjdhZDBjN2JiNTE4ODkzNWMzIiwidXNlcl9pZCI6IjUifQ.XV1ztye8kmigRKnczuIwOTDceM-HkCUlJXvjC1cKx-Y",
        "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc3NzM1OTM1OCwiaWF0IjoxNzc2NzU0NTU4LCJqdGkiOiJkM2M5M2M0ZDU4OGQ0NGM3YTEwMmZlMmU2Y2EyNGQ4NiIsInVzZXJfaWQiOiI1In0.epgFoaFsap5F1KUTJD3w1L1FHSH-dQLfI7Htsf-ZOyY"
    },
    "user_information": {
        "user_id": "5",
        "access_token_claims": {
            "token_type": "access",
            "exp": 1776758158,
            "iat": 1776754558,
            "jti": "97fa30f499fd40f7ad0c7bb5188935c3"
        },
        "refresh_token_claims": {
            "token_type": "refresh",
            "exp": 1777359358,
            "iat": 1776754558,
            "jti": "d3c93c4d588d44c7a102fe2e6ca24d86"
        }
    }
}

print(json.dumps(full_response, indent=2))
