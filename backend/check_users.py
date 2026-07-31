import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from notes.models import CustomUser

print("=" * 60)
print("TOUS LES UTILISATEURS")
print("=" * 60)

for user in CustomUser.objects.all():
    print(f"\n👤 {user.username}")
    print(f"   Email: {user.email}")
    print(f"   Role: {user.role}")
    print(f"   Active: {user.is_active}")
    print(f"   Preuve: {bool(user.preuve_appartenance)}")
    print(f"   Validée: {user.preuve_validee}")

print(f"\n\nTotal: {CustomUser.objects.count()} utilisateurs")

print("\n" + "=" * 60)
print("UTILISATEURS POUVANT ÊTRE VALIDÉS")
print("=" * 60)

users = CustomUser.objects.filter(
    role='etudiant', 
    preuve_validee=False, 
    preuve_appartenance__isnull=False
)

print(f"\nFiltres appliqués:")
print(f"  - role='etudiant'")
print(f"  - preuve_validee=False")
print(f"  - preuve_appartenance != NULL")
print(f"\nRésultat: {users.count()} utilisateurs")

for user in users:
    print(f"  ✅ {user.username} ({user.email})")
