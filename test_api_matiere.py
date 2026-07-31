#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

django.setup()

from notes.serializers import ResultatUESerializer
from notes.models import ResultatUE

# Tester le serializer
resultats = ResultatUE.objects.all()[:1]
if resultats:
    resultat = resultats[0]
    print(f"Testing ResultatUE: {resultat}")
    try:
        serializer = ResultatUESerializer(resultat)
        data = serializer.data
        print(f"Serialized data keys: {data.keys()}")
        print(f"Matieres field: {data.get('matieres')}")
        print(f"Primary matiere ID: {data.get('primary_matiere_id')}")
        print(f"Primary matiere nom: {data.get('primary_matiere_nom')}")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
else:
    print("No ResultatUE found")
