#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

django.setup()

from notes.models import ResultatUE, Note, Matiere, Etudiant, UE, Session

# Tester avec les données réelles
resultat = ResultatUE.objects.first()
if resultat:
    print(f"ResultatUE: {resultat}")
    print(f"  Etudiant: {resultat.etudiant}")
    print(f"  UE: {resultat.ue}")
    print(f"  Session: {resultat.session}")
    
    # Chercher les matières de cette UE
    matieres = Matiere.objects.filter(ue=resultat.ue)
    print(f"\n  Matières de cette UE: {list(matieres.values_list('id', 'nom'))}")
    
    # Pour chaque matière, chercher les notes
    for matiere in matieres:
        notes = Note.objects.filter(
            etudiant=resultat.etudiant,
            matiere=matiere,
            session=resultat.session,
        )
        print(f"    Matière {matiere.nom}: {notes.count()} notes")
        for note in notes[:1]:
            print(f"      Note: {note.note_matiere}")
else:
    print("No ResultatUE found")
