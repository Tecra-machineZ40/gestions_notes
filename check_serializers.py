#!/usr/bin/env python
import os
import sys
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

django.setup()

from notes.models import UE, Etudiant
from notes.serializers import UESerializer, EtudiantSerializer

# Test UE
print("=" * 60)
print("CHECKING UE SERIALIZER (for MyClasses)")
print("=" * 60)
ue = UE.objects.first()
if ue:
    serializer = UESerializer(ue)
    data = serializer.data
    print(f"UE: {ue}")
    print(f"Fields available: {list(data.keys())}")
    print(f"Has 'credits'? {'credits' in data}")
    print(f"Has 'coefficient'? {'coefficient' in data}")
    print(f"Full data: {json.dumps(data, indent=2, default=str)}")
else:
    print("No UE found")

# Test Etudiant
print("\n" + "=" * 60)
print("CHECKING ETUDIANT SERIALIZER (for MyStudents)")
print("=" * 60)
etudiant = Etudiant.objects.first()
if etudiant:
    serializer = EtudiantSerializer(etudiant)
    data = serializer.data
    print(f"Etudiant: {etudiant}")
    print(f"Fields available: {list(data.keys())}")
    print(f"Has 'matricule'? {'matricule' in data}")
    print(f"Has 'email'? {'email' in data}")
    print(f"Has 'telephone'? {'telephone' in data}")
    print(f"Full data: {json.dumps(data, indent=2, default=str)}")
else:
    print("No Etudiant found")
