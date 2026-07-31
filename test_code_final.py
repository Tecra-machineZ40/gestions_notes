# Test de validate_user_registration
import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
os.chdir(os.path.dirname(__file__) + '/backend')
django.setup()

from notes.models import CustomUser
from notes.services import validate_user_registration

u = CustomUser.objects.filter(preuve_appartenance__isnull=False).first()
if u:
    print(f"USER: {u.username}")
    code_obj, sent = validate_user_registration(u)
    print(f"CODE GENERE: {code_obj.code}")
    print(f"EMAIL SENT: {sent}")
else:
    print("AUCUN USER AVEC PREUVE TROUVE")
    for x in CustomUser.objects.all():
        print(f"  - {x.username} preuve={x.preuve_appartenance} preuve_validee={x.preuve_validee}")
