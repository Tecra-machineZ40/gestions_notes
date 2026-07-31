import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()

from notes.models import Etudiant, Note, CustomUser

# Get the admin user
try:
    admin_user = CustomUser.objects.get(username='admin')
except CustomUser.DoesNotExist:
    print("Admin user not found. Please create it first.")
    exit()

# Create some sample students if they don't exist
students_data = [
    {'nom': 'Dupont', 'prenom': 'Jean', 'matricule': 'MAT001'},
    {'nom': 'Martin', 'prenom': 'Marie', 'matricule': 'MAT002'},
    {'nom': 'Durand', 'prenom': 'Pierre', 'matricule': 'MAT003'},
]

students = []
for data in students_data:
    student, created = Etudiant.objects.get_or_create(
        matricule=data['matricule'],
        defaults=data
    )
    students.append(student)
    if created:
        print(f"Created student: {student}")
    else:
        print(f"Student already exists: {student}")

# Create sample notes
notes_data = [
    {'etudiant': students[0], 'valeur': 15.5},
    {'etudiant': students[1], 'valeur': 18.0},
    {'etudiant': students[2], 'valeur': 12.75},
    {'etudiant': students[0], 'valeur': 16.25},
]

for data in notes_data:
    note = Note.objects.create(
        etudiant=data['etudiant'],
        valeur=data['valeur'],
        last_modified_by=admin_user
    )
    print(f"Created note: {note}")

print("Sample data added successfully!")