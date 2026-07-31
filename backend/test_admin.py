#!/usr/bin/env python
import os

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.contrib.auth import get_user_model

from notes.models import AnneeAcademique, Etudiant, Session, Semestre, UE

User = get_user_model()


def main():
    print("Test de creation et modification d'objets")

    AnneeAcademique.objects.filter(libelle__startswith="TEST").delete()
    Session.objects.filter(libelle__startswith="TEST").delete()
    UE.objects.filter(code_ue__startswith="TEST").delete()
    Etudiant.objects.filter(matricule__startswith="TEST").delete()
    User.objects.filter(username__startswith="test").delete()

    try:
        annee = AnneeAcademique.objects.create(
            libelle="TEST-2025-2026",
            date_debut="2025-09-01",
            date_fin="2026-06-30",
            active=True,
        )
        print(f"Annee OK: {annee}")
    except Exception as exc:
        print(f"Annee error: {exc}")

    try:
        session = Session.objects.create(libelle="TEST-principale", description="Session de test")
        print(f"Session OK: {session}")
    except Exception as exc:
        print(f"Session error: {exc}")

    try:
        annee = AnneeAcademique.objects.first()
        if annee:
            semestre = Semestre.objects.create(
                numero="S1",
                annee_academique=annee,
                date_debut="2025-09-01",
                date_fin="2026-01-31",
            )
            print(f"Semestre OK: {semestre}")
    except Exception as exc:
        print(f"Semestre error: {exc}")

    try:
        ue = UE.objects.create(
            code_ue="TEST001",
            libelle="Mathematiques Test",
            description="Un cours de test",
            credits=3,
            coefficient=1.5,
        )
        print(f"UE OK: {ue}")
    except Exception as exc:
        print(f"UE error: {exc}")


if __name__ == "__main__":
    main()
