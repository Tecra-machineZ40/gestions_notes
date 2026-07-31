#!/usr/bin/env python
"""
Test script to verify Note Éliminatoire (NE) status implementation
Tests that:
1. Notes < 6 get NE status
2. Notes 6-10 get NV status
3. Notes >= 10 get V status
"""
import os
import sys
import django
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from notes.models import (
    NOTE_VALIDEE, NOTE_NON_VALIDEE, NOTE_ELIMINATOIRE,
    Note, Etudiant, Matiere, Session, UE, CustomUser
)


def test_note_statut():
    """Test that Note statut calculation works correctly"""
    print("\n=== Testing Note Status Calculation ===\n")
    
    # Get or create test data
    try:
        user = CustomUser.objects.get(username='testuser')
    except CustomUser.DoesNotExist:
        user = CustomUser.objects.create_user(username='testuser', password='test123')
        print(f"✓ Created test user: {user.username}")

    
    # Get test session
    session = Session.objects.first()
    if not session:
        print("✗ No session found. Please create a session first.")
        return
    print(f"✓ Using session: {session.libelle}")
    
    # Get or create test etudiant
    try:
        etudiant = Etudiant.objects.get(utilisateur__username='testuser')
    except Etudiant.DoesNotExist:
        etudiant = Etudiant.objects.create(
            utilisateur=user,
            nom="Test",
            prenom="User",
            matricule="TEST001"
        )
        print(f"✓ Created etudiant: {etudiant.matricule}")
    
    # Get test matiere
    matiere = Matiere.objects.first()
    if not matiere:
        print("✗ No matiere found. Please create a matiere first.")
        return
    print(f"✓ Using matiere: {matiere.nom}")
    
    # Test cases: (score, expected_status, description)
    test_cases = [
        (Decimal("3.50"), NOTE_ELIMINATOIRE, "Score < 6 should be NE"),
        (Decimal("5.99"), NOTE_ELIMINATOIRE, "Score < 6 should be NE"),
        (Decimal("6.00"), NOTE_NON_VALIDEE, "Score 6-10 should be NV"),
        (Decimal("8.50"), NOTE_NON_VALIDEE, "Score 6-10 should be NV"),
        (Decimal("9.99"), NOTE_NON_VALIDEE, "Score 6-10 should be NV"),
        (Decimal("10.00"), NOTE_VALIDEE, "Score >= 10 should be V"),
        (Decimal("15.50"), NOTE_VALIDEE, "Score >= 10 should be V"),
        (Decimal("20.00"), NOTE_VALIDEE, "Score >= 10 should be V"),
    ]
    
    status_map = {
        'V': 'Validée',
        'NV': 'Non Validée',
        'NE': 'Note Éliminatoire'
    }
    
    print("\nTesting note status calculation:\n")
    passed = 0
    failed = 0
    
    for score, expected_status, description in test_cases:
        # Create or update test note
        note, created = Note.objects.get_or_create(
            etudiant=etudiant,
            matiere=matiere,
            session=session,
        )
        # Set devoir and examen to average to the desired score
        note.note_devoir = score
        note.note_examen = score
        note.save()  # This will trigger the save() method and calculate statut
        
        # Reload to ensure all values are current
        note.refresh_from_db()
        
        status_label = status_map.get(note.statut, note.statut)
        expected_label = status_map.get(expected_status, expected_status)
        
        if note.statut == expected_status:
            print(f"✓ Score {score}: {status_label} (expected {expected_label}) - {description}")
            passed += 1
        else:
            print(f"✗ Score {score}: Got {status_label}, expected {expected_label} - {description}")
            failed += 1
    
    print(f"\n{'='*60}")
    print(f"Results: {passed} passed, {failed} failed")
    print(f"{'='*60}\n")
    
    if failed == 0:
        print("✓ All tests passed!")
        
        # Test ResultatUE propagation
        print("\n=== Testing ResultatUE Status Propagation ===\n")
        from notes.models import ResultatUE
        
        resultat_ue = ResultatUE.objects.filter(
            etudiant=etudiant,
            session=session,
            ue=matiere.ue
        ).first()
        
        if resultat_ue:
            print(f"✓ ResultatUE found:")
            print(f"  - Moyenne UE: {resultat_ue.moyenne_ue}")
            print(f"  - Statut: {status_map.get(resultat_ue.statut, resultat_ue.statut)}")
        else:
            print("✗ No ResultatUE found for this etudiant/session")
    else:
        print("✗ Some tests failed!")
        return False
    
    return True

if __name__ == "__main__":
    success = test_note_statut()
    sys.exit(0 if success else 1)
