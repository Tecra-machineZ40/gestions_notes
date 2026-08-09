FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Correction des chemins vers le sous-dossier backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

RUN python manage.py collectstatic --noinput

CMD ["sh", "-c", "gunicorn backend.wsgi:application --bind 0.0.0.0:${PORT:-8000}"]





# 1. Image Python officielle légère
#FROM python:3.11-slim

# 2. Éviter la création de fichiers .pyc et forcer l'affichage des logs
#ENV PYTHONDONTWRITEBYTECODE=1
#ENV PYTHONUNBUFFERED=1

# 3. Dossier de travail dans le conteneur
#WORKDIR /app

# 4. Installer les dépendances système nécessaires pour Django (ex: psycopg2 pour PostgreSQL si utilisé)
#RUN apt-get update && apt-get install -y --no-install-recommends \
    #build-essential \
    #libpq-dev \
    #&& rm -rf /var/lib/apt/lists/*

# 5. Installer les dépendances Python
#COPY requirements.txt .
#RUN pip install --no-cache-dir -r requirements.txt

# 6. Copier le reste du code du projet
#COPY backend/ .

# 7. Collecter les fichiers statiques de Django pour la production
#RUN python manage.py collectstatic --noinput

# 8. Commande de démarrage adaptée à Render (utilise gunicorn pour la production)
#CMD ["sh", "-c", "gunicorn backend.wsgi:application --bind 0.0.0.0:${PORT:-8000}"]
