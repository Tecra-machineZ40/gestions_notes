#!/usr/bin/env python
"""
Script pour tester directement la vue mes_ues sans faire une requête HTTP
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from notes.models import UE, CustomUser
from notes.serializers import UESerializer

print("=" * 70)
print("🔍 TEST: Vérifier ce que retourne mes_ues pour chaque enseignant")
print("=" * 70)

# Tester pour chaque enseignant
teachers = CustomUser.objects.filter(role='enseignant')

for teacher in teachers:
    print(f"\n👨‍🏫 Enseignant: {teacher.username} (ID: {teacher.id})")
    
    # Simuler ce que la vue mes_ues retourne
    ues = UE.objects.filter(enseignant=teacher)
    print(f"   UE trouvées: {ues.count()}")
    
    for ue in ues:
        serializer = UESerializer(ue)
        print(f"   - {ue.code_ue}: {serializer.data}")

# Vérifier les UE sans enseignant
print(f"\n📚 UE SANS ENSEIGNANT:")
orphan_ues = UE.objects.filter(enseignant__isnull=True)
for ue in orphan_ues:
    print(f"   - {ue.code_ue} ({ue.libelle})")

print("\n" + "=" * 70)
