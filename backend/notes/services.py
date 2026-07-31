import logging

from django.conf import settings
from django.core.mail import send_mail
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.utils import timezone

from .models import CodeInscription

logger = logging.getLogger(__name__)


def validate_user_registration(user):
    """
    Valide une demande d'inscription utilisateur et envoie le code par email.
    Retourne un tuple (code, email_sent, email_status).
    email_status ∈ {"sent", "missing_email", "invalid_email", "smtp_error"}
    """
    if not user.preuve_appartenance:
        raise ValueError("Aucune preuve d'appartenance n'est disponible pour cet utilisateur.")

    code = None
    if user.code_inscription_attribue:
        code = CodeInscription.objects.filter(
            code=user.code_inscription_attribue,
            role=user.role,
        ).first()

    if code is None:
        code = CodeInscription.objects.create(role=user.role, actif=True)
        user.code_inscription_attribue = code.code
        user.code_activation = code.code
    else:
        code.actif = True
        code.role = user.role
        code.utilise_par = None
        code.date_utilisation = None
        code.save(update_fields=["actif", "role", "utilise_par", "date_utilisation"])

    user.preuve_validee = True
    user.is_active = False
    user.compte_active = False
    user.date_validation_preuve = timezone.now()
    user.code_activation = code.code
    user.save(update_fields=["code_inscription_attribue", "code_activation", "preuve_validee", "is_active", "compte_active", "date_validation_preuve"])

    subject = "Votre code d'inscription"
    message = (
        f"Bonjour {user.username},\n\n"
        "Votre demande d'inscription a été validée par l'administrateur.\n"
        f"Votre code d'inscription est : {code.code}\n\n"
        "Utilisez votre nom d'utilisateur, votre mot de passe et ce code "
        "dans l'écran de connexion pour activer votre accès à la plateforme."
    )

    # ✅ AFFICHER LE CODE DANS LE TERMINAL QUOI QU'IL ARRIVE
    separator = "=" * 65
    print(
        f"\n{separator}\n"
        f"   📧 CODE D'ACTIVATION POUR {user.username}\n"
        f"   Email: {user.email}\n"
        f"   🔐 CODE: {code.code}\n"
        f"{separator}\n",
        flush=True,
    )
    logger.warning(
        "Code d'activation pour %s (%s): %s",
        user.username,
        user.email,
        code.code,
    )

    email_sent = False
    email_status = "smtp_error"
    email_value = (user.email or "").strip()

    if not email_value:
        logger.warning("Aucun email pour %s: code disponible uniquement en console.", user.username)
        return code, email_sent, "missing_email"

    try:
        validate_email(email_value)
    except ValidationError:
        logger.warning("Email invalide pour %s (%s): code disponible uniquement en console.", user.username, email_value)
        return code, email_sent, "invalid_email"

    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email_value],
            fail_silently=False,
        )
        logger.info("✅ Email d'inscription envoyé avec succès à %s", email_value)
        email_sent = True
        email_status = "sent"
    except Exception as e:
        logger.error("❌ Erreur lors de l'envoi de l'email à %s: %s", email_value, str(e))
        # Ne pas relancer l'exception - le code reste disponible en console
        email_status = "smtp_error"

    return code, email_sent, email_status


def recalculer_resultats_pour_notes(notes):
    """Recalcule les agrégats par UE et semestre pour une liste de notes."""
    from .models import sync_academic_results_for_note

    total = 0
    for note in notes:
        sync_academic_results_for_note(note)
        total += 1
    return total
