@echo off
REM 🚀 QUICK START SCRIPT FOR WINDOWS
REM Démarrage rapide de l'application

echo 📚 GestionNotes - Démarrage rapide
echo ====================================
echo.

REM Vérifier que nous sommes dans le bon dossier
if not exist "package.json" (
    echo ⚠️  Ce script doit être lancé depuis le dossier frontend\
    echo cd frontend ^&^& quickstart.bat
    pause
    exit /b 1
)

echo 1️⃣  Installation des dépendances...
call npm install

echo.
echo 2️⃣  Démarrage du serveur de développement...
echo ✅ L'application sera accessible sur http://localhost:5173
echo.
echo Utilisateurs de test disponibles :
echo   👨‍🎓 Étudiant : ahmed@university.edu
echo   👨‍🏫 Enseignant : fatima@university.edu
echo   👨‍💼 Superviseur : mohamed@university.edu
echo   👨‍💻 Admin : admin@university.edu
echo.
echo Mot de passe : n'importe quel (c'est une démo)
echo.

call npm run dev
pause
