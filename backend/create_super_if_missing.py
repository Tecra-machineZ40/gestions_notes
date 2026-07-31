import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE','backend.settings')
import django
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()

if not User.objects.filter(is_superuser=True).exists():
    username = 'admin'
    email = 'admin@example.com'
    password = 'AdminPass123'
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f"Superuser créé: {username} / {password}")
else:
    su = User.objects.filter(is_superuser=True).first()
    print(f"Superuser déjà présent: {su.username}")
