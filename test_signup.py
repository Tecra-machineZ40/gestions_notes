#!/usr/bin/env python3
"""
Test script pour l'endpoint d'inscription
"""

import requests
import json
from pathlib import Path

# Test data
BASE_URL = "http://localhost:8000/api"

# Créer un fichier de test (image vide)
test_image_path = Path("test_image.jpg")
if not test_image_path.exists():
    # Créer une petite image de test
    with open(test_image_path, "wb") as f:
        # Minimum JPEG header
        f.write(b'\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00')

# Données d'inscription
test_data = {
    'username': 'testuser123',
    'first_name': 'John',
    'last_name': 'Doe',
    'email': 'testuser@example.com',
    'password': 'SecurePass123',
    'role': 'étudiant'
}

print("🧪 Test d'inscription API")
print("=" * 60)
print(f"URL: {BASE_URL}/register/")
print(f"Données: {json.dumps(test_data, indent=2)}")
print("-" * 60)

try:
    # Test POST avec image
    with open(test_image_path, "rb") as img:
        files = {
            'preuve_appartenance': img,
        }
        data = test_data
        
        response = requests.post(
            f"{BASE_URL}/register/",
            data=data,
            files=files,
            timeout=10
        )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"\nResponse Body:")
    print(json.dumps(response.json(), indent=2))
    
    if response.status_code == 201:
        print("\n✅ SUCCESS: Inscription créée")
    else:
        print(f"\n❌ ERROR: {response.status_code}")
        
except requests.exceptions.ConnectionError:
    print("❌ Impossible de joindre le serveur Django")
    print("Assurez-vous que le serveur est démarré: python manage.py runserver")
except Exception as e:
    print(f"❌ Erreur: {str(e)}")

finally:
    # Nettoyer le fichier de test
    if test_image_path.exists():
        test_image_path.unlink()
