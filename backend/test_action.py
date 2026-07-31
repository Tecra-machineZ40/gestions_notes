import os

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.core.mail import send_mail
from django.utils import timezone

from notes.models import CodeInscription, CustomUser, generer_code_inscription


def main():
    users = CustomUser.objects.filter(
        role="etudiant",
        preuve_validee=False,
        preuve_appartenance__isnull=False,
    )

    print(f"Found {users.count()} users to validate")

    for user in users:
        print(f"Processing {user.username}...")

        code = generer_code_inscription()
        while CodeInscription.objects.filter(code=code).exists():
            code = generer_code_inscription()

        CodeInscription.objects.create(code=code, role="etudiant", actif=False)

        user.preuve_validee = True
        user.date_validation_preuve = timezone.now()
        user.code_inscription_attribue = code
        user.is_active = True
        user.save()

        try:
            send_mail(
                subject="Validation de votre inscription",
                message=(
                    f"Bonjour {user.username},\n\n"
                    "Votre preuve d'appartenance a ete validee.\n"
                    f"Votre code d'inscription est : {code}\n"
                ),
                from_email=None,
                recipient_list=[user.email],
                fail_silently=False,
            )
            print(f"Email sent to {user.email}")
        except Exception as exc:
            print(f"Email error: {exc}")


if __name__ == "__main__":
    main()
