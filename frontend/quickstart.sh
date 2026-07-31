#!/bin/bash
# 🚀 QUICK START SCRIPT
# Démarrage rapide de l'application

echo "📚 GestionNotes - Démarrage rapide"
echo "===================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier que nous sommes dans le bon dossier
if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}⚠️  Ce script doit être lancé depuis le dossier frontend/${NC}"
    echo "cd frontend && bash quickstart.sh"
    exit 1
fi

echo -e "${BLUE}1️⃣ Installation des dépendances...${NC}"
npm install

echo ""
echo -e "${BLUE}2️⃣ Démarrage du serveur de développement...${NC}"
echo -e "${GREEN}✅ L'application sera accessible sur http://localhost:5173${NC}"
echo ""
echo "Utilisateurs de test disponibles :"
echo "  👨‍🎓 Étudiant : ahmed@university.edu"
echo "  👨‍🏫 Enseignant : fatima@university.edu"
echo "  👨‍💼 Superviseur : mohamed@university.edu"
echo "  👨‍💻 Admin : admin@university.edu"
echo ""
echo "Mot de passe : n'importe quel (c'est une démo)"
echo ""

npm run dev
