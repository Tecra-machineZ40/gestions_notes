#!/usr/bin/env python
"""Delete old test note and recreate it correctly"""
import os, sys, django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from notes.models import NOTE_ELIMINATOIRE, NOTE_NON_VALIDEE, NOTE_VALIDEE, Note, Etudiant, Session, Matiere

session = Session.objects.first()
etudiant = Etudiant.objects.filter(utilisateur__username='testuser').first()

# Get the matière that had the wrong note
problematic_matiere = Matiere.objects.get(nom='Technique d\'expression et communication anglaise')

# Delete the old note
Note.objects.filter(
    etudiant=etudiant,
    matiere=problematic_matiere,
    session=session
).delete()

print(f"✓ Deleted old note for {problematic_matiere.nom}")

# Now recreate with score 4.50 (should give NE status)
score = Decimal("4.50")
note = Note.objects.create(
    etudiant=etudiant,
    matiere=problematic_matiere,
    session=session,
    note_devoir=score,
    note_examen=score,
)

print(f"\n✓ Created new note:")
print(f"  Matière: {note.matiere.nom}")
print(f"  Devoir: {note.note_devoir}, Examen: {note.note_examen}")
print(f"  Note Matière: {note.note_matiere}")
print(f"  Statut: {note.statut}\n")

# Check all notes now
print("All notes for this student:")
notes = Note.objects.filter(etudiant=etudiant, session=session).order_by('matiere__nom')
status_map = {'V': 'Validée', 'NV': 'Non Validée', 'NE': 'Note Éliminatoire'}
for n in notes:
    status_label = status_map.get(n.statut, n.statut)
    print(f"  {n.matiere.nom[:35]:<35} Moyenne: {n.note_matiere:<6} Statut: {status_label}")

print()
