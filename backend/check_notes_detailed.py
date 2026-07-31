#!/usr/bin/env python
import os, sys, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from notes.models import Note, Etudiant, Session

etudiant = Etudiant.objects.filter(utilisateur__username='testuser').first()
session = Session.objects.first()
notes = Note.objects.filter(etudiant=etudiant, session=session)

print(f"\nDetailed Notes Check:\n")
for idx, n in enumerate(notes, 1):
    print(f"{idx}. Matière: {n.matiere.nom} (ID: {n.matiere_id})")
    print(f"   Devoir: {n.note_devoir}, Examen: {n.note_examen}")
    print(f"   Note Matière: {n.note_matiere}")
    print(f"   Statut: {n.statut}")
    print(f"   Created: {n.date_saisie}, Modified: {n.date_modification}")
    print()
