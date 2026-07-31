#!/usr/bin/env python
"""
Script pour vérifier le format exact de la réponse API /ues/mes_ues/
"""
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from notes.models import CustomUser
from notes.views_api import UEViewSet
from rest_framework.test import APIRequestFactory
from rest_framework.request import Request

print("=" * 70)
print("🔍 DIAGNOSTIC: Format exact de /ues/mes_ues/")
print("=" * 70)

# Créer un objet de requête mock
factory = APIRequestFactory()

teachers = CustomUser.objects.filter(role='enseignant')[:2]  # Tester les 2 premiers

for teacher in teachers:
    print(f"\n👨‍🏫 Testant: {teacher.username}")
    
    # Créer une requête mock
    request = factory.get('/ues/mes_ues/')
    request.user = teacher
    
    # Créer une vue
    view = UEViewSet.as_view({'get': 'mes_ues'})
    
    # Appeler la vue
    response = view(request)
    
    print(f"   Status Code: {response.status_code}")
    print(f"   Data Type: {type(response.data)}")
    print(f"   Data: {json.dumps(response.data, indent=2, ensure_ascii=False, default=str)}")

print("\n" + "=" * 70)
