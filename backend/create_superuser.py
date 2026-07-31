import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE','backend.settings')
import django
django.setup()
from notes.models import CustomUser

# Créer un superuser si il n'existe pas
if not CustomUser.objects.filter(username='admin').exists():
    user = CustomUser.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='admin123',
        role='admin'
    )
    print(f"Superuser créé: {user.username}")
else:
    print("Superuser existe déjà")