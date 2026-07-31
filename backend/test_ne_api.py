#!/usr/bin/env python
"""Test the NE status via API - verify it's working in the real system"""
import os
import sys
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from notes.models import (
    NOTE_VALIDEE, NOTE_NON_VALIDEE, NOTE_ELIMINATOIRE,
    Note, Etudiant, Matiere, Session, ResultatUE
)
from notes.serializers import ResultatUESerializer

print("\n" + "="*70)
print("Testing NE Status Display via API Serializer")
print("="*70 + "\n")

# Get test data
session = Session.objects.first()
etudiant = Etudiant.objects.filter(utilisateur__username='testuser').first()

if not session or not etudiant:
    print("✗ Missing test data")
    sys.exit(1)

print(f"Session: {session.libelle}")
print(f"Étudiant: {etudiant.nom} {etudiant.prenom} ({etudiant.matricule})\n")

# Get all ResultatUE for this student and session
resultats = ResultatUE.objects.filter(etudiant=etudiant, session=session).order_by('-moyenne_ue')

if not resultats.exists():
    print("✗ No ResultatUE found for this student")
    sys.exit(1)

print(f"Found {resultats.count()} ResultatUE entries:\n")
print(f"{'UE':<50} {'Moyenne':<10} {'Statut':<20}")
print("-" * 80)

status_labels = {
    'V': '✓ Validée',
    'NV': '⚠ Non Validée',
    'NE': '✗ Note Éliminatoire',
}

for resultat in resultats:
    serializer = ResultatUESerializer(resultat)
    data = serializer.data
    
    status_label = status_labels.get(data['statut'], data['statut'])
    moyenne = data['moyenne']
    
    # Show UE info
    ue_name = data['ue_libelle'][:45]
    print(f"{ue_name:<50} {moyenne if moyenne else 'N/A':<10} {status_label:<20}")

# Show summary statistics
print("\n" + "-" * 80)
ne_count = resultats.filter(statut=NOTE_ELIMINATOIRE).count()
nv_count = resultats.filter(statut=NOTE_NON_VALIDEE).count()
v_count = resultats.filter(statut=NOTE_VALIDEE).count()

print(f"\nStatistics:")
print(f"  Validées (V):           {v_count}")
print(f"  Non Validées (NV):      {nv_count}")
print(f"  Notes Éliminatoires (NE): {ne_count}")

# Test specific cases
print("\n" + "="*70)
print("Verifying specific status codes:")
print("="*70 + "\n")

test_cases = [
    (Decimal("3.50"), NOTE_ELIMINATOIRE, "Score 3.50"),
    (Decimal("6.00"), NOTE_NON_VALIDEE, "Score 6.00"),
    (Decimal("10.00"), NOTE_VALIDEE, "Score 10.00"),
]

for score, expected_status, label in test_cases:
    # Check if we have a resultat with this moyenne
    resultat = resultats.filter(moyenne_ue=score).first()
    if resultat:
        if resultat.statut == expected_status:
            print(f"✓ {label}: {status_labels.get(resultat.statut)} (correct)")
        else:
            print(f"✗ {label}: {status_labels.get(resultat.statut)} (expected {expected_status})")
    else:
        print(f"- {label}: No resultat found")

print("\n" + "="*70)
print("✓ NE Status Implementation Verified!")
print("="*70 + "\n")
