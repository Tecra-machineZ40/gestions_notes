from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Alert, CustomUser, Enseignant, Etudiant, Note, Superviseur


@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    if instance.role == "etudiant":
        student, created_profile = Etudiant.objects.get_or_create(utilisateur=instance)
        if created_profile or not student.nom or not student.prenom or not student.email:
            student.nom = student.nom or instance.first_name
            student.prenom = student.prenom or instance.last_name
            student.email = student.email or instance.email
            student.save(update_fields=[field for field in ["nom", "prenom", "email"] if getattr(student, field)])
    elif instance.role == "enseignant":
        teacher, created_profile = Enseignant.objects.get_or_create(utilisateur=instance)
        if created_profile or not teacher.nom or not teacher.prenom or not teacher.email:
            teacher.nom = teacher.nom or instance.first_name
            teacher.prenom = teacher.prenom or instance.last_name
            teacher.email = teacher.email or instance.email
            teacher.save(update_fields=[field for field in ["nom", "prenom", "email"] if getattr(teacher, field)])
    elif instance.role == "superviseur":
        Superviseur.objects.get_or_create(utilisateur=instance)


@receiver(post_save, sender=Note)
def create_alert_on_note_update(sender, instance, created, **kwargs):
    Alert.objects.create(
        type_modification="NOTE_CREEE" if created else "NOTE_MODIFIEE",
        note=instance,
        matiere=instance.matiere,
        modifie_par=None,
        description=f"Note de {instance.etudiant} {'creee' if created else 'modifiee'}.",
    )
