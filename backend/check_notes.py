#!/usr/bin/env python
import os, sys, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from notes.models import Note, Etudiant, Session

etudiant = Etudiant.objects.filter(utilisateur__username='testuser').first()
session = Session.objects.first()
notes = Note.objects.filter(etudiant=etudiant, session=session).order_by('matiere__nom')

print(f"\nNotes for {etudiant.nom} {etudiant.prenom}:\n")
print(f"{'Matière':<40} {'Devoir':<8} {'Examen':<8} {'Note':<8} {'Statut':<5}")
print("-" * 80)

status_map = {'V': 'V', 'NV': 'NV', 'NE': 'NE'}

for n in notes:
    matiere_name = n.matiere.nom[:35]
    d = f"{n.note_devoir}" if n.note_devoir else "—"
    e = f"{n.note_examen}" if n.note_examen else "—"
    m = f"{n.note_matiere}" if n.note_matiere else "—"
    s = status_map.get(n.statut, n.statut)
    print(f"{matiere_name:<40} {d:<8} {e:<8} {m:<8} {s:<5}")

print()
