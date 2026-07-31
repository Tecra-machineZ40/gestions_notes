from decimal import Decimal

from django.test import TestCase

from .models import (
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


class AcademicResultsTest(TestCase):
    def setUp(self):
        self.year = AnneeAcademique.objects.create(
            libelle="2024-2025",
            date_debut="2024-09-01",
            date_fin="2025-06-30",
            active=True,
        )
        self.semester = Semestre.objects.create(
            numero="S1",
            annee_academique=self.year,
            date_debut="2024-09-01",
            date_fin="2025-01-31",
        )
        self.session = Session.objects.create(
            libelle="Session normale",
            semestre=self.semester,
            annee_academique=self.year,
            description="Session normale",
            type_session="SO",
        )
        self.student_user = CustomUser.objects.create_user(
            username="student1",
            email="student1@example.com",
            password="secret123",
            role="etudiant",
            is_active=True,
        )
        self.student, _ = Etudiant.objects.update_or_create(
            utilisateur=self.student_user,
            defaults={
                "nom": "Student",
                "prenom": "One",
                "matricule": "ETU001",
                "email": "student1@example.com",
            },
        )
        self.teacher_user = CustomUser.objects.create_user(
            username="teacher1",
            email="teacher1@example.com",
            password="secret123",
            role="enseignant",
            is_active=True,
        )
        self.teacher = Enseignant.objects.get(utilisateur=self.teacher_user)
        self.ue = UE.objects.create(
            code_ue="UE001",
            libelle="Mathematiques",
            semestre=self.semester,
        )
        self.matiere = Matiere.objects.create(
            nom="Algebre",
            ue=self.ue,
            session=None,
            enseignant=self.teacher,
            coefficient=1,
            credits=3,
        )

    def test_session_rattrapage_uses_one_third_devoir_two_thirds_examen(self):
        rattrapage_session = Session.objects.create(
            libelle="Session rattrapage",
            semestre=self.semester,
            annee_academique=self.year,
            description="Session de rattrapage",
            type_session="SR",
        )
        rattrapage_matiere = Matiere.objects.create(
            nom="Algebre SR",
            ue=self.ue,
            session=None,
            enseignant=self.teacher,
            coefficient=1,
            credits=3,
        )

        note = Note.objects.create(
            etudiant=self.student,
            matiere=rattrapage_matiere,
            session=rattrapage_session,
            note_devoir=12,
            note_examen=15,
        )

        self.assertEqual(note.note_matiere, Decimal("14.00"))

    def test_note_calculates_average_and_marks_incomplete_scores_as_nv(self):
        note = Note.objects.create(
            etudiant=self.student,
            matiere=self.matiere,
            session=self.session,
            note_devoir=12,
            note_examen=14,
        )

        self.assertEqual(note.note_matiere, Decimal("13.00"))
        self.assertEqual(note.statut, "V")
        self.assertFalse(note.est_publiee)

        second_matiere = Matiere.objects.create(
            nom="Geometrie",
            ue=self.ue,
            session=None,
            enseignant=self.teacher,
            coefficient=1,
            credits=3,
        )
        incomplete = Note.objects.create(
            etudiant=self.student,
            matiere=second_matiere,
            session=self.session,
            note_devoir=9,
            note_examen=None,
        )

        self.assertIsNone(incomplete.note_matiere)
        self.assertEqual(incomplete.statut, "NV")

    def test_resultat_ue_and_semestre_are_generated_from_grades(self):
        Note.objects.create(
            etudiant=self.student,
            matiere=self.matiere,
            session=self.session,
            note_devoir=10,
            note_examen=12,
        )

        resultat_ue = ResultatUE.objects.get(
            etudiant=self.student,
            ue=self.ue,
            session=self.session,
        )
        self.assertEqual(resultat_ue.moyenne_ue, Decimal("11.00"))
        self.assertEqual(resultat_ue.statut, "V")

        resultat_semestre = ResultatSemestre.objects.get(
            etudiant=self.student,
            semestre=self.semester,
            session=self.session,
        )
        self.assertEqual(resultat_semestre.moyenne_generale, Decimal("11.00"))
        self.assertEqual(resultat_semestre.statut, "V")
