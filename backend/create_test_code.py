import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE','backend.settings')
import django
django.setup()
from notes.models import CodeInscription

code = 'TEST1234'
if not CodeInscription.objects.filter(code=code).exists():
    c = CodeInscription.objects.create(code=code, role='enseignant')
    print(f"Code créé: {c.code} (actif={c.actif})")
else:
    c = CodeInscription.objects.get(code=code)
    print(f"Code existant: {c.code} (actif={c.actif})")
