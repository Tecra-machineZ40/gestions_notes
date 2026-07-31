import os

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.core.mail import send_mail


def main():
    try:
        send_mail(
            "Email TEST",
            "Ceci est un email de test.",
            None,
            ["test@example.com"],
            fail_silently=False,
        )
        print("Email TEST envoye avec succes")
    except Exception as exc:
        print(f"Erreur lors de l'envoi: {exc}")


if __name__ == "__main__":
    main()
