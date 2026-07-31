#!/usr/bin/env python
"""Create diverse test notes to show all three status types"""
import os
import sys
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from notes.models import (
    NOTE_VALIDEE, NOTE_NON_VALIDEE, NOTE_ELIMINATOIRE,
    Note, Etudiant, Matiere, Session
)

print("\n" + "="*70)
print("Creating test notes with different scores to show all 3 statuses")
print("="*70 + "\n")

session = Session.objects.first()
etudiant = Etudiant.objects.filter(utilisateur__username='testuser').first()

if not session or not etudiant:
    print("✗ Missing test data")
    sys.exit(1)

# Get different matieres
matieres = list(Matiere.objects.all()[:3])  # Get first 3 different matières

test_cases = [
    (Decimal("4.50"), NOTE_ELIMINATOIRE, "NE - Score 4.50"),
    (Decimal("7.50"), NOTE_NON_VALIDEE, "NV - Score 7.50"),
    (Decimal("15.00"), NOTE_VALIDEE, "V - Score 15.00"),
]

print(f"Creating notes for {etudiant.nom} {etudiant.prenom} in session {session.libelle}\n")

for idx, (score, expected_status, label) in enumerate(test_cases):
    if idx >= len(matieres):
        print(f"✗ Not enough matieres for all test cases")
        break
    
    matiere = matieres[idx]
    
    # Create note with both devoir and examen set to same score
    note, created = Note.objects.update_or_create(
        etudiant=etudiant,
        matiere=matiere,
        session=session,
        defaults={
            'note_devoir': score,
            'note_examen': score,
        }
    )
    
    # Refresh to get calculated values
    note.refresh_from_db()
    
    status_map = {'V': 'Validée', 'NV': 'Non Validée', 'NE': 'Note Éliminatoire'}
    status_label = status_map.get(note.statut, note.statut)
    
    print(f"✓ Created note for {matiere.nom}:")
    print(f"  Score: {score}")
    print(f"  Calculated note_matiere: {note.note_matiere}")
    print(f"  Status: {note.statut} ({status_label})\n")

print("="*70)
print("Test data created. Now check the API to see all 3 statuses!")
print("="*70 + "\n")
