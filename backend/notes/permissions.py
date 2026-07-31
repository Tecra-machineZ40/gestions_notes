from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed


class JWTAuthenticationSafe(JWTAuthentication):
    """
    Authentification JWT qui retourne None au lieu de lever une exception
    si aucun token n'est fourni. Cela permet aux vues avec AllowAny
    de fonctionner sans authentification obligatoire.
    """
    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except AuthenticationFailed:
            # Si le token est manquant ou invalide, retourner None
            # pour permettre aux requêtes sans auth de passer
            return None


class IsOwnerOrReadOnly(BasePermission):
    """
    Règles d'accès métier :
    - administrateur/admin : tous les droits
    - superviseur : lecture seule
    - enseignant : accès à ses propres objets
    """

    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.role in {"administrateur", "admin"}:
            return True

        if user.role == "superviseur":
            return request.method in SAFE_METHODS

        if user.role == "enseignant":
            if hasattr(obj, "enseignant") and obj.enseignant is not None:
                return obj.enseignant == user or getattr(obj.enseignant, "utilisateur", None) == user

            if hasattr(obj, "matiere") and obj.matiere is not None:
                return getattr(obj.matiere.enseignant, "utilisateur", None) == user

            if hasattr(obj, "evaluation") and obj.evaluation is not None:
                return obj.evaluation.enseignant == user

            if hasattr(obj, "last_modified_by") and obj.last_modified_by is not None:
                return obj.last_modified_by == user

        return request.method in SAFE_METHODS and user.role == "etudiant"
