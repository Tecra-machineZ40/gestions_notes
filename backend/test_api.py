import requests


def main():
    response = requests.post(
        "http://127.0.0.1:8000/api/token/",
        json={"username": "admin", "password": "admin123"},
        timeout=10,
    )
    print(response.status_code)
    print(response.text)


if __name__ == "__main__":
    main()
