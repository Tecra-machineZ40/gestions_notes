"""
Routage API pour le système de gestion des notes
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CurrentUserView,
    CustomUserViewSet,
    EnseignantViewSet,
    SuperviseurViewSet,
    ClasseViewSet,
    EtudiantViewSet,
    AnneeAcademiqueViewSet,
    SemestreViewSet,
    UEViewSet,
    SessionViewSet,
    MatiereAcademiqueViewSet,
    MatiereViewSet,
    ResultatUEViewSet,
    ResultatSemestreViewSet,
    AlertViewSet,
    AdminAuditLogViewSet,
    CodeInscriptionViewSet,
    InscriptionView,
    ActivateAccountView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)

# ============================================================================
# Configuration du routeur automatique
# ============================================================================

router = DefaultRouter()

# Enregistrer les ViewSets
router.register(r'utilisateurs', CustomUserViewSet, basename='utilisateur')
router.register(r'enseignants', EnseignantViewSet, basename='enseignant')
router.register(r'superviseurs', SuperviseurViewSet, basename='superviseur')
router.register(r'classes', ClasseViewSet, basename='classe')
router.register(r'etudiants', EtudiantViewSet, basename='etudiant')
router.register(r'annees-academiques', AnneeAcademiqueViewSet, basename='annee-academique')
router.register(r'semestres', SemestreViewSet, basename='semestre')
router.register(r'ues', UEViewSet, basename='ue')
router.register(r'sessions', SessionViewSet, basename='session')
router.register(r'matieres', MatiereViewSet, basename='matiere')
router.register(r'matieres-academiques', MatiereAcademiqueViewSet, basename='matiere-academique')
router.register(r'resultats-ue', ResultatUEViewSet, basename='resultat-ue')
router.register(r'resultats-semestres', ResultatSemestreViewSet, basename='resultat-semestre')
router.register(r'alertes', AlertViewSet, basename='alerte')
router.register(r'admin-audit-logs', AdminAuditLogViewSet, basename='admin-audit-log')
router.register(r'codes-inscription', CodeInscriptionViewSet, basename='code-inscription')

# ============================================================================
# URLs personnalisées
# ============================================================================

urlpatterns = [
    # Routes du routeur (CRUD automatique)
    path('', include(router.urls)),
    
    # Utilisateur courant
    path('me/', CurrentUserView.as_view(), name='current-user'),
    
    # Inscription
    path('register/', InscriptionView.as_view(), name='register'),
    path('activate-account/', ActivateAccountView.as_view(), name='activate-account'),
    path('password-reset/request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
]
