#!/usr/bin/env python
"""Create a note with very low score to get NE at UE level"""
import os, sys, django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from notes.models import NOTE_ELIMINATOIRE, Note, Etudiant, Session, Matiere

session = Session.objects.first()
etudiant = Etudiant.objects.filter(utilisateur__username='testuser').first()

# Get any matière that's in a different UE than the expression ones
# Let's use "Linux" which should be in a different UE
matiere = Matiere.objects.get(nom='Linux')

# Create note with score < 6 to get NE status
score = Decimal("3.00")
note = Note.objects.create(
    etudiant=etudiant,
    matiere=matiere,
    session=session,
    note_devoir=score,
    note_examen=score,
)

print(f"✓ Created new note:")
print(f"  Matière: {note.matiere.nom}")
print(f"  UE: {note.matiere.ue.libelle}")
print(f"  Score: {score}")
print(f"  Note Matière: {note.note_matiere}")
print(f"  Statut Note: {note.statut}\n")

# Check the ResultatUE  
from notes.models import ResultatUE

resultat = ResultatUE.objects.filter(
    etudiant=etudiant,
    ue=matiere.ue,
    session=session
).first()

if resultat:
    status_map = {'V': 'Validée', 'NV': 'Non Validée', 'NE': 'Note Éliminatoire'}
    status_label = status_map.get(resultat.statut, resultat.statut)
    print(f"✓ ResultatUE updated:")
    print(f"  UE: {resultat.ue.libelle}")
    print(f"  Moyenne UE: {resultat.moyenne_ue}")
    print(f"  Statut UE: {resultat.statut} ({status_label})\n")
else:
    print("✗ ResultatUE not found\n")
