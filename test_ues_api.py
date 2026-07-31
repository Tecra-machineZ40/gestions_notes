#!/usr/bin/env python
"""
Script pour tester l'API UE et vérifier le format de la réponse
"""
import os
import sys
import django

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from notes.views_api import UEViewSet
from django.contrib.auth import get_user_model

User = get_user_model()

# Créer une factory de requêtes
factory = APIRequestFactory()

# Créer une requête GET
request = factory.get('/api/ues/')

# Authentifier avec un utilisateur superuser
try:
    admin = User.objects.filter(is_superuser=True).first()
    if not admin:
        print("❌ Aucun superuser trouvé")
        sys.exit(1)
    
    force_authenticate(request, user=admin)
    print(f"✅ Authentifié en tant que: {admin.username}")
except Exception as e:
    print(f"❌ Erreur d'authentification: {e}")
    sys.exit(1)

# Appeler la vue
view = UEViewSet.as_view({'get': 'list'})
response = view(request)

print("\n" + "="*50)
print("RÉPONSE API UES")
print("="*50)
print(f"Status Code: {response.status_code}")
print(f"Contenu: {response.data}")
print(f"Type: {type(response.data)}")

# Vérifier la structure
if isinstance(response.data, list):
    print(f"\n✅ Format LIST (simple) - {len(response.data)} UE trouvées")
    for ue in response.data[:3]:
        print(f"   - {ue}")
elif isinstance(response.data, dict) and 'results' in response.data:
    print(f"\n✅ Format PAGINATED (avec 'results') - {len(response.data['results'])} UE trouvées")
    for ue in response.data['results'][:3]:
        print(f"   - {ue}")
else:
    print(f"\n⚠️  Format INCONNU")
