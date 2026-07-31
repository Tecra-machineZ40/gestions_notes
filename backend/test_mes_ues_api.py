#!/usr/bin/env python
"""
Script pour tester l'API /ues/mes_ues/
"""
import requests
import json
import os

# Delay Django setup and model imports to avoid side-effects during test discovery

def main():
    import django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    django.setup()

    from notes.models import CustomUser

    # Try to import Token from rest_framework.authtoken if available; otherwise mark as unavailable
    try:
        from rest_framework.authtoken.models import Token
    except Exception:
        Token = None

    print("=" * 60)
    print("🧪 TEST API: /ues/mes_ues/")
    print("=" * 60)

    # Obtenir un enseignant
    teacher = CustomUser.objects.filter(role='enseignant').first()
    if not teacher:
        print("❌ Aucun enseignant trouvé!")
        return

    print(f"\n📝 Testant avec: {teacher.username} ({teacher.email})")

    if Token is None:
        print("⚠️ Le modèle Token n'est pas disponible; ce script ne peut pas obtenir un token via Token model.")
        print("   Si vous voulez tester l'API en local, utilisez l'endpoint /api/token/ (simplejwt) ou installez rest_framework.authtoken.")
        return

    # Créer/récupérer le token
    token, created = Token.objects.get_or_create(user=teacher)
    print(f"   Token: {token.key}")

    # Appeler l'API
    headers = {
        'Authorization': f'Token {token.key}',
        'Content-Type': 'application/json'
    }

    url = "http://localhost:8000/api/ues/mes_ues/"

    try:
        response = requests.get(url, headers=headers)
        print(f"\n📡 Réponse API ({response.status_code}):")

        if response.status_code == 200:
            data = response.json()
            print(f"   Nombre d'UE: {len(data) if isinstance(data, list) else 'N/A'}")
            print(f"   Données: {json.dumps(data, indent=2, ensure_ascii=False)}")
        else:
            print(f"   Erreur: {response.text}")
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
        print(f"   Assurez-vous que le serveur Django est en cours d'exécution sur http://localhost:8000")

    print("\n" + "=" * 60)


if __name__ == "__main__":
    main()
