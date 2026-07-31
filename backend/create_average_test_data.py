#!/usr/bin/env python
"""Créer des données de test pour valider les calculs de moyenne sur 3 profils d'étudiants."""

import os
from decimal import Decimal
from datetime import timedelta

import django
from django.db import transaction
from django.utils import timezone

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from notes.models import (  # noqa: E402
    AnneeAcademique,
    CustomUser,
    Enseignant,
    Etudiant,
    Matiere,
    Note,
    ResultatSemestre,
    ResultatUE,
    Semestre,
    Session,
    UE,
)


PREFIX = "demo_avg_"


def score_pair(score):
    value = Decimal(str(score))
    return value, value


def cleanup_previous_data():
    Note.objects.filter(etudiant__utilisateur__username__startswith=PREFIX).delete()
    ResultatUE.objects.filter(etudiant__utilisateur__username__startswith=PREFIX).delete()
    ResultatSemestre.objects.filter(etudiant__utilisateur__username__startswith=PREFIX).delete()
    Matiere.objects.filter(ue__code_ue__startswith="AVG-").delete()
    UE.objects.filter(code_ue__startswith="AVG-").delete()
    Session.objects.filter(libelle__startswith="DEMO AVG").delete()
    Semestre.objects.filter(annee_academique__libelle__startswith="DEMO AVG").delete()
    AnneeAcademique.objects.filter(libelle__startswith="DEMO AVG").delete()
    Enseignant.objects.filter(utilisateur__username__startswith=PREFIX).delete()
    Etudiant.objects.filter(utilisateur__username__startswith=PREFIX).delete()
    CustomUser.objects.filter(username__startswith=PREFIX).delete()


def create_user(username, email, first_name, last_name, role):
    return CustomUser.objects.create_user(
        username=username,
        email=email,
        password="testpass123",
        role=role,
        first_name=first_name,
        last_name=last_name,
        is_active=True,
        compte_active=True,
    )


def create_student(user, matricule):
    student = Etudiant.objects.get(utilisateur=user)
    student.nom = user.first_name
    student.prenom = user.last_name
    student.matricule = matricule
    student.email = user.email
    student.niveau = 1
    student.filiere = "Informatique"
    student.save()
    return student


def create_note(etudiant, matiere, session, score):
    devoir, examen = score_pair(score)
    return Note.objects.create(
        etudiant=etudiant,
        matiere=matiere,
        session=session,
        note_devoir=devoir,
        note_examen=examen,
    )


def run():
    with transaction.atomic():
        cleanup_previous_data()

        print("\n" + "=" * 72)
        print("[TEST] Création des données de calcul de moyenne")
        print("=" * 72)

        teacher_user = create_user(
            username=f"{PREFIX}teacher",
            email="demo.avg.teacher@test.com",
            first_name="Paul",
            last_name="Calcul",
            role="enseignant",
        )
        teacher = Enseignant.objects.get(utilisateur=teacher_user)
        teacher.nom = "Paul"
        teacher.prenom = "Calcul"
        teacher.email = teacher_user.email
        teacher.specialite = "Mathématiques"
        teacher.grade = "Enseignant"
        teacher.save()

        annee = AnneeAcademique.objects.create(
            libelle="DEMO AVG 2025-2026",
            date_debut=timezone.now().date(),
            date_fin=(timezone.now() + timedelta(days=365)).date(),
            active=True,
        )
        semestre = Semestre.objects.create(
            numero="S1",
            annee_academique=annee,
            date_debut=timezone.now().date(),
            date_fin=(timezone.now() + timedelta(days=180)).date(),
        )

        session_ordinaire = Session.objects.create(
            libelle="DEMO AVG Ordinaire",
            type_session="SO",
            annee_academique=annee,
            semestre=semestre,
            description="Session ordinaire de test moyenne",
        )
        session_rattrapage = Session.objects.create(
            libelle="DEMO AVG Rattrapage",
            type_session="SR",
            annee_academique=annee,
            semestre=semestre,
            description="Session de rattrapage de test moyenne",
        )

        ue_maths = UE.objects.create(code_ue="AVG-MATH", libelle="Mathématiques", semestre=semestre)
        ue_info = UE.objects.create(code_ue="AVG-INF", libelle="Informatique", semestre=semestre)

        matieres = {
            "math_alg_so": Matiere.objects.create(nom="Algèbre", coefficient=Decimal("1.00"), credits=3, ue=ue_maths, session=session_ordinaire, enseignant=teacher),
            "math_ana_so": Matiere.objects.create(nom="Analyse", coefficient=Decimal("1.00"), credits=3, ue=ue_maths, session=session_ordinaire, enseignant=teacher),
            "info_algo_so": Matiere.objects.create(nom="Algorithmique", coefficient=Decimal("1.00"), credits=3, ue=ue_info, session=session_ordinaire, enseignant=teacher),
            "info_python_so": Matiere.objects.create(nom="Python", coefficient=Decimal("1.00"), credits=3, ue=ue_info, session=session_ordinaire, enseignant=teacher),
            "math_alg_sr": Matiere.objects.create(nom="Algèbre", coefficient=Decimal("1.00"), credits=3, ue=ue_maths, session=session_rattrapage, enseignant=teacher),
            "math_ana_sr": Matiere.objects.create(nom="Analyse", coefficient=Decimal("1.00"), credits=3, ue=ue_maths, session=session_rattrapage, enseignant=teacher),
            "info_algo_sr": Matiere.objects.create(nom="Algorithmique", coefficient=Decimal("1.00"), credits=3, ue=ue_info, session=session_rattrapage, enseignant=teacher),
            "info_python_sr": Matiere.objects.create(nom="Python", coefficient=Decimal("1.00"), credits=3, ue=ue_info, session=session_rattrapage, enseignant=teacher),
        }

        student_specs = [
            {
                "username": f"{PREFIX}mixte",
                "email": "demo.avg.mixte@test.com",
                "first_name": "Mélanie",
                "last_name": "Mixte",
                "matricule": "AVG-001",
                "plan": {
                    "ordinary": {
                        "math_alg_so": 12,
                        "math_ana_so": 8,
                        "info_algo_so": 14,
                        "info_python_so": 7,
                    },
                    "retake": {
                        "math_ana_sr": 11,
                        "info_python_sr": 13,
                    },
                },
            },
            {
                "username": f"{PREFIX}rattrapage",
                "email": "demo.avg.rattrapage@test.com",
                "first_name": "Rachid",
                "last_name": "Rattrapage",
                "matricule": "AVG-002",
                "plan": {
                    "ordinary": {
                        "math_alg_so": 4,
                        "math_ana_so": 5.5,
                        "info_algo_so": 7,
                        "info_python_so": 9,
                    },
                    "retake": {
                        "math_alg_sr": 11,
                        "math_ana_sr": 12,
                        "info_algo_sr": 10.5,
                        "info_python_sr": 14,
                    },
                },
            },
            {
                "username": f"{PREFIX}ordinaire",
                "email": "demo.avg.ordinaire@test.com",
                "first_name": "Olivia",
                "last_name": "Ordinaire",
                "matricule": "AVG-003",
                "plan": {
                    "ordinary": {
                        "math_alg_so": 15,
                        "math_ana_so": 13,
                        "info_algo_so": 12,
                        "info_python_so": 18,
                    },
                    "retake": {},
                },
            },
        ]

        created_students = []
        for spec in student_specs:
            user = create_user(
                username=spec["username"],
                email=spec["email"],
                first_name=spec["first_name"],
                last_name=spec["last_name"],
                role="etudiant",
            )
            student = create_student(user, spec["matricule"])
            created_students.append(student)

            for matiere_key, score in spec["plan"]["ordinary"].items():
                create_note(student, matieres[matiere_key], session_ordinaire, score)

            for matiere_key, score in spec["plan"]["retake"].items():
                create_note(student, matieres[matiere_key], session_rattrapage, score)

        print("\n[OK] Données créées avec succès")
        print("\nÉtudiants de test:")
        for student in created_students:
            print(f"- {student.matricule}: {student.nom} {student.prenom}")

        print("\nScénarios:")
        print("- AVG-001: 2 matières validées en ordinaire, 2 en rattrapage")
        print("- AVG-002: 0 validée en ordinaire, 4 validées en rattrapage")
        print("- AVG-003: 4 validées en ordinaire, aucune en rattrapage")

        print("\nMoyennes attendues par note: score donné = moyenne calculée")
        print("- En session ordinaire: moyenne = (devoir + examen) / 2")
        print("- En session rattrapage: moyenne = (devoir / 3) + (2 * examen / 3)")
        print("=" * 72 + "\n")


if __name__ == "__main__":
    run()
