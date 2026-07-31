import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE','backend.settings')
import django
django.setup()
from notes.models import CustomUser, CodeInscription

print("Utilisateurs :")
for user in CustomUser.objects.all():
    print(f"- {user.username} ({user.email}) - {user.role}")

print("\nCodes d'inscription :")
for code in CodeInscription.objects.all():
    print(f"- {code.code} ({code.role}) - actif: {code.actif}")