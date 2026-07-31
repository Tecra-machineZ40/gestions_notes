#!/usr/bin/env python
"""
Script pour vérifier l'état des UE et des enseignants
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from notes.models import UE, CustomUser

print("=" * 60)
print("🔍 DIAGNOSTIC: UE vs ENSEIGNANTS")
print("=" * 60)

# Vérifier les enseignants
print("\n👨‍🏫 ENSEIGNANTS DISPONIBLES:")
teachers = CustomUser.objects.filter(role='enseignant')
print(f"Total: {teachers.count()}")
for teacher in teachers:
    ues_count = teacher.ues_enseignees.count()
    print(f"  - {teacher.username} ({teacher.email}): {ues_count} UE(s)")

# Vérifier les UE
print("\n📚 UE DISPONIBLES:")
ues = UE.objects.all()
print(f"Total: {ues.count()}")
for ue in ues:
    if ue.enseignant:
        print(f"  - {ue.code_ue} ({ue.libelle}): ✅ enseignant={ue.enseignant.username}")
    else:
        print(f"  - {ue.code_ue} ({ue.libelle}): ❌ AUCUN ENSEIGNANT")

# Résumé
print("\n📊 RÉSUMÉ:")
ues_with_teacher = UE.objects.filter(enseignant__isnull=False).count()
ues_without_teacher = UE.objects.filter(enseignant__isnull=True).count()
print(f"  - UE avec enseignant: {ues_with_teacher}")
print(f"  - UE sans enseignant: {ues_without_teacher}")

print("\n" + "=" * 60)
