"""
Vues API pour le systÃ¨me de gestion des notes
Utilise Django REST Framework ViewSets et APIView
"""

from rest_framework import viewsets, status, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode

from .models import (
    AdminAuditLog, CustomUser, Etudiant, UE, AnneeAcademique, Semestre,
    Session, Matiere, Note, ResultatUE, ResultatSemestre, Alert,
    CodeInscription, Classe, Enseignant, Superviseur
)
from .serializers import (
    CustomUserSerializer, EtudiantSerializer, UESerializer,
    AnneeAcademiqueSerializer, SemestreSerializer, SessionSerializer,
    MatiereAcademiqueSerializer, MatiereSerializer,
    ResultatUESerializer,
    ResultatSemestreSerializer, AlertSerializer, AdminAuditLogSerializer,
    CodeInscriptionSerializer, InscriptionSerializer, CurrentUserSerializer,
    ActivationCodeSerializer, CustomTokenObtainPairSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    ClasseSerializer, EnseignantSerializer, SuperviseurSerializer,
)
from .permissions import IsOwnerOrReadOnly


def is_admin_user(user):
    return user.is_authenticated and (
        user.is_superuser or user.is_staff or user.role in {"administrateur", "admin"}
    )


def snapshot_instance(instance):
    data = {}
    for field in instance._meta.fields:
        value = getattr(instance, field.name, None)
        if hasattr(value, "pk"):
            data[field.name] = value.pk
        elif isinstance(value, (str, int, float, bool)) or value is None:
            data[field.name] = value
        else:
            data[field.name] = str(value)
    return data


def log_admin_action(actor, action, resource_type, resource_id="", target_user=None, before_data=None, after_data=None, metadata=None):
    AdminAuditLog.objects.create(
        actor=actor,
        target_user=target_user,
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id or ""),
        before_data=before_data or {},
        after_data=after_data or {},
        metadata=metadata or {},
    )


# ============================================================================
# ðŸ‘¤ UTILISATEURS
# ============================================================================

class CurrentUserView(APIView):
    """
    Retourne l'utilisateur actuellement connectÃ© avec ses permissions
    GET: RÃ©cupÃ©rer l'utilisateur courant
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = CurrentUserSerializer(request.user)
        data = dict(serializer.data)
        if request.user.is_superuser or request.user.is_staff:
            data["role"] = "administrateur"

        token_payload = getattr(request, "auth", None)
        if token_payload:
            data["impersonation_active"] = bool(token_payload.get("impersonation_active", False))
            data["impersonated_by"] = token_payload.get("impersonated_by")
            data["impersonated_by_username"] = token_payload.get("impersonated_by_username")

        return Response(data)


class PasswordResetRequestView(APIView):
    """
    Démarre la récupération de mot de passe.
    POST /password-reset/request/
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        identifier = serializer.validated_data["identifier"]
        user = CustomUser.objects.filter(Q(email__iexact=identifier) | Q(username__iexact=identifier)).first()

        reset_link = None
        if user and user.email:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173").rstrip("/")
            reset_link = f"{frontend_url}/reset-password?uid={uid}&token={token}"

            send_mail(
                subject="Réinitialisation de votre mot de passe",
                message=(
                    "Vous avez demandé la réinitialisation de votre mot de passe.\n\n"
                    f"Cliquez sur ce lien pour définir un nouveau mot de passe :\n{reset_link}\n\n"
                    "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email."
                ),
                from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@gestions-notes.local"),
                recipient_list=[user.email],
                fail_silently=True,
            )

        payload = {
            "detail": "Si un compte correspond à cet identifiant, un lien de réinitialisation a été envoyé par email."
        }
        if settings.DEBUG and reset_link:
            payload["debug_reset_link"] = reset_link

        return Response(payload, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    """
    Confirme la réinitialisation de mot de passe via uid/token.
    POST /password-reset/confirm/
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uid = serializer.validated_data["uid"].strip()
        token = serializer.validated_data["token"].strip()
        new_password = serializer.validated_data["new_password"]

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = CustomUser.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            payload = {"detail": "Lien de réinitialisation invalide."}
            if settings.DEBUG:
                payload["debug"] = {
                    "uid_received": uid,
                    "uid_length": len(uid),
                }
            return Response(payload, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            payload = {"detail": "Le lien de réinitialisation est invalide ou expiré."}
            if settings.DEBUG:
                payload["debug"] = {
                    "uid_received": uid,
                    "token_prefix": token[:8],
                    "token_length": len(token),
                    "user_id": user.id,
                }
            return Response(payload, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save(update_fields=["password"])

        return Response({"detail": "Mot de passe réinitialisé avec succès."}, status=status.HTTP_200_OK)


class CustomUserViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gÃ©rer les utilisateurs.
    - Admin/administrateur: CRUD complet
    - Autres rÃ´les: lecture seule
    """
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['username', 'date_joined']
    ordering = ['-date_joined']

    def _is_admin(self, user):
        return is_admin_user(user)

    def _ensure_admin(self, request):
        if not self._is_admin(request.user):
            return Response({"detail": "Action réservée à l'administrateur."}, status=status.HTTP_403_FORBIDDEN)
        return None

    def create(self, request, *args, **kwargs):
        forbidden = self._ensure_admin(request)
        if forbidden:
            return forbidden

        response = super().create(request, *args, **kwargs)
        if response.status_code < 300 and response.data:
            created = CustomUser.objects.filter(pk=response.data.get("id")).first()
            log_admin_action(
                actor=request.user,
                action="CREATE",
                resource_type="CustomUser",
                resource_id=response.data.get("id", ""),
                target_user=created,
                after_data=snapshot_instance(created) if created else dict(response.data),
            )
        return response

    def update(self, request, *args, **kwargs):
        forbidden = self._ensure_admin(request)
        if forbidden:
            return forbidden

        target = self.get_object()
        before_data = snapshot_instance(target)
        response = super().update(request, *args, **kwargs)
        target.refresh_from_db()
        log_admin_action(
            actor=request.user,
            action="UPDATE",
            resource_type="CustomUser",
            resource_id=target.id,
            target_user=target,
            before_data=before_data,
            after_data=snapshot_instance(target),
        )
        return response

    def partial_update(self, request, *args, **kwargs):
        forbidden = self._ensure_admin(request)
        if forbidden:
            return forbidden

        target = self.get_object()
        before_data = snapshot_instance(target)
        response = super().partial_update(request, *args, **kwargs)
        target.refresh_from_db()
        log_admin_action(
            actor=request.user,
            action="UPDATE",
            resource_type="CustomUser",
            resource_id=target.id,
            target_user=target,
            before_data=before_data,
            after_data=snapshot_instance(target),
        )
        return response

    def destroy(self, request, *args, **kwargs):
        forbidden = self._ensure_admin(request)
        if forbidden:
            return forbidden

        target = self.get_object()
        if target.id == request.user.id:
            return Response({"detail": "Vous ne pouvez pas supprimer votre propre compte administrateur."}, status=status.HTTP_400_BAD_REQUEST)

        before_data = snapshot_instance(target)
        target_id = target.id
        target_ref = target
        response = super().destroy(request, *args, **kwargs)
        if response.status_code < 300:
            log_admin_action(
                actor=request.user,
                action="DELETE",
                resource_type="CustomUser",
                resource_id=target_id,
                target_user=target_ref,
                before_data=before_data,
            )
        return response

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def set_password(self, request, pk=None):
        forbidden = self._ensure_admin(request)
        if forbidden:
            return forbidden

        new_password = request.data.get("password", "")
        if not new_password or len(new_password) < 6:
            return Response({"detail": "Le mot de passe doit contenir au moins 6 caractères."}, status=status.HTTP_400_BAD_REQUEST)

        target = self.get_object()
        target.set_password(new_password)
        target.save(update_fields=["password"])

        log_admin_action(
            actor=request.user,
            action="SET_PASSWORD",
            resource_type="CustomUser",
            resource_id=target.id,
            target_user=target,
            metadata={"password_changed": True},
        )

        return Response({"detail": "Mot de passe mis à jour."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def impersonate(self, request, pk=None):
        """Permet à un admin d'obtenir des tokens JWT au nom d'un autre utilisateur."""
        forbidden = self._ensure_admin(request)
        if forbidden:
            return forbidden

        target = self.get_object()
        if target.id == request.user.id:
            return Response({"detail": "Inutile d'usurper votre propre compte."}, status=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(target)
        refresh["impersonated_by"] = request.user.id
        refresh["impersonated_by_username"] = request.user.username
        refresh["impersonation_active"] = True

        log_admin_action(
            actor=request.user,
            action="IMPERSONATE",
            resource_type="CustomUser",
            resource_id=target.id,
            target_user=target,
            metadata={"target_role": target.role},
        )

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": CurrentUserSerializer(target).data,
                "impersonation": {
                    "active": True,
                    "admin_id": request.user.id,
                    "admin_username": request.user.username,
                    "target_id": target.id,
                    "target_username": target.username,
                    "target_role": target.role,
                },
            },
            status=status.HTTP_200_OK,
        )


# ============================================================================
# ðŸŽ“ Ã‰TUDIANTS
# ============================================================================

class EtudiantViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gÃ©rer les Ã©tudiants
    CRUD complet + Actions personnalisÃ©es
    """
    queryset = Etudiant.objects.all()
    serializer_class = EtudiantSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['sexe']
    search_fields = ['nom', 'prenom', 'matricule', 'email']
    ordering_fields = ['nom', 'prenom', 'date_inscription']
    ordering = ['nom', 'prenom']

    def create(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            return Response({'detail': "Action réservée à l'administrateur."}, status=status.HTTP_403_FORBIDDEN)
        response = super().create(request, *args, **kwargs)
        if response.status_code < 300 and response.data:
            created = Etudiant.objects.filter(pk=response.data.get("id")).first()
            log_admin_action(
                actor=request.user,
                action="CREATE",
                resource_type="Etudiant",
                resource_id=response.data.get("id", ""),
                target_user=getattr(created, "utilisateur", None),
                after_data=snapshot_instance(created) if created else dict(response.data),
            )
        return response

    def update(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            return Response({'detail': "Action réservée à l'administrateur."}, status=status.HTTP_403_FORBIDDEN)
        target = self.get_object()
        before_data = snapshot_instance(target)
        response = super().update(request, *args, **kwargs)
        target.refresh_from_db()
        log_admin_action(
            actor=request.user,
            action="UPDATE",
            resource_type="Etudiant",
            resource_id=target.id,
            target_user=target.utilisateur,
            before_data=before_data,
            after_data=snapshot_instance(target),
        )
        return response

    def partial_update(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            return Response({'detail': "Action réservée à l'administrateur."}, status=status.HTTP_403_FORBIDDEN)
        target = self.get_object()
        before_data = snapshot_instance(target)
        response = super().partial_update(request, *args, **kwargs)
        target.refresh_from_db()
        log_admin_action(
            actor=request.user,
            action="UPDATE",
            resource_type="Etudiant",
            resource_id=target.id,
            target_user=target.utilisateur,
            before_data=before_data,
            after_data=snapshot_instance(target),
        )
        return response

    def destroy(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            return Response({'detail': "Action réservée à l'administrateur."}, status=status.HTTP_403_FORBIDDEN)
        target = self.get_object()
        before_data = snapshot_instance(target)
        target_id = target.id
        target_user = target.utilisateur
        response = super().destroy(request, *args, **kwargs)
        if response.status_code < 300:
            log_admin_action(
                actor=request.user,
                action="DELETE",
                resource_type="Etudiant",
                resource_id=target_id,
                target_user=target_user,
                before_data=before_data,
            )
        return response

    @action(detail=False, methods=['get', 'patch'], permission_classes=[IsAuthenticated])
    def mon_profil(self, request):
        """
        RÃ©cupÃ¨re ou met Ã  jour le profil Ã©tudiant de l'utilisateur connectÃ©
        GET/PATCH /etudiants/mon_profil/
        """
        try:
            etudiant = Etudiant.objects.get(utilisateur=request.user)

            if request.method == 'PATCH':
                editable_fields = {
                    'nom',
                    'prenom',
                    'matricule',
                    'date_naissance',
                    'lieu_naissance',
                    'sexe',
                    'email',
                    'telephone',
                    'adresse',
                }
                payload = {key: value for key, value in request.data.items() if key in editable_fields}
                serializer = self.get_serializer(etudiant, data=payload, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                return Response(serializer.data)

            serializer = self.get_serializer(etudiant)
            return Response(serializer.data)
        except Etudiant.DoesNotExist:
            return Response(
                {'detail': 'Aucun profil Ã©tudiant trouvÃ©'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def mes_notes(self, request):
        """
        RÃ©cupÃ¨re toutes les notes de l'Ã©tudiant connectÃ©
        GET /etudiants/mes_notes/
        """
        try:
            etudiant = Etudiant.objects.get(utilisateur=request.user)
            notes = etudiant.notes.select_related('matiere', 'matiere__ue', 'session').all()
            # Use the full note serializer so the student dashboard gets UE/session/semester fields.
            serializer = MatiereSerializer(notes, many=True)
            return Response(serializer.data)
        except Etudiant.DoesNotExist:
            return Response(
                {'erreur': 'Aucun profil Ã©tudiant trouvÃ©'},
                status=status.HTTP_404_NOT_FOUND
            )


class EnseignantViewSet(viewsets.ModelViewSet):
    queryset = Enseignant.objects.select_related('utilisateur').all()
    serializer_class = EnseignantSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'prenom', 'specialite', 'grade', 'email']
    ordering = ['nom', 'prenom']

    def create(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            return Response({'detail': "Action réservée à l'administrateur."}, status=status.HTTP_403_FORBIDDEN)
        response = super().create(request, *args, **kwargs)
        if response.status_code < 300 and response.data:
            created = Enseignant.objects.filter(pk=response.data.get("id")).first()
            log_admin_action(
                actor=request.user,
                action="CREATE",
                resource_type="Enseignant",
                resource_id=response.data.get("id", ""),
                target_user=getattr(created, "utilisateur", None),
                after_data=snapshot_instance(created) if created else dict(response.data),
            )
        return response

    def update(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            return Response({'detail': "Action réservée à l'administrateur."}, status=status.HTTP_403_FORBIDDEN)
        target = self.get_object()
        before_data = snapshot_instance(target)
        response = super().update(request, *args, **kwargs)
        target.refresh_from_db()
        log_admin_action(
            actor=request.user,
            action="UPDATE",
            resource_type="Enseignant",
            resource_id=target.id,
            target_user=target.utilisateur,
            before_data=before_data,
            after_data=snapshot_instance(target),
        )
        return response

    def partial_update(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            return Response({'detail': "Action réservée à l'administrateur."}, status=status.HTTP_403_FORBIDDEN)
        target = self.get_object()
        before_data = snapshot_instance(target)
        response = super().partial_update(request, *args, **kwargs)
        target.refresh_from_db()
        log_admin_action(
            actor=request.user,
            action="UPDATE",
            resource_type="Enseignant",
            resource_id=target.id,
            target_user=target.utilisateur,
            before_data=before_data,
            after_data=snapshot_instance(target),
        )
        return response

    def destroy(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            return Response({'detail': "Action réservée à l'administrateur."}, status=status.HTTP_403_FORBIDDEN)
        target = self.get_object()
        before_data = snapshot_instance(target)
        target_id = target.id
        target_user = target.utilisateur
        response = super().destroy(request, *args, **kwargs)
        if response.status_code < 300:
            log_admin_action(
                actor=request.user,
                action="DELETE",
                resource_type="Enseignant",
                resource_id=target_id,
                target_user=target_user,
                before_data=before_data,
            )
        return response

    @action(detail=False, methods=['get', 'patch'], permission_classes=[IsAuthenticated])
    def mon_profil(self, request):
        """
        Récupère ou met à jour le profil enseignant de l'utilisateur connecté
        GET/PATCH /enseignants/mon_profil/
        """
        try:
            enseignant = Enseignant.objects.get(utilisateur=request.user)

            if request.method == 'PATCH':
                editable_fields = {
                    'nom',
                    'prenom',
                    'telephone',
                    'adresse',
                    'specialite',
                    'grade',
                    'email',
                }
                payload = {key: value for key, value in request.data.items() if key in editable_fields}
                serializer = self.get_serializer(enseignant, data=payload, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                return Response(serializer.data)

            serializer = self.get_serializer(enseignant)
            return Response(serializer.data)
        except Enseignant.DoesNotExist:
            return Response(
                {'detail': 'Aucun profil enseignant trouvé pour cet utilisateur.'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def mes_matieres(self, request):
        """
        Récupère les matières assignées à l'enseignant connecté
        GET /enseignants/mes_matieres/
        """
        try:
            enseignant = Enseignant.objects.get(utilisateur=request.user)
            matieres = Matiere.objects.filter(
                enseignant=enseignant
            ).select_related('ue', 'session', 'enseignant').order_by('ue__code_ue', 'nom')
            
            serializer = MatiereAcademiqueSerializer(matieres, many=True)
            return Response(serializer.data)
        except Enseignant.DoesNotExist:
            return Response(
                {'detail': 'Aucun profil enseignant trouvé pour cet utilisateur.'},
                status=status.HTTP_404_NOT_FOUND
            )


class SuperviseurViewSet(viewsets.ModelViewSet):
    queryset = Superviseur.objects.select_related('utilisateur').all()
    serializer_class = SuperviseurSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'prenom', 'departement', 'fonction', 'email']
    ordering = ['nom', 'prenom']

    def create(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            return Response({'detail': "Action réservée à l'administrateur."}, status=status.HTTP_403_FORBIDDEN)
        response = super().create(request, *args, **kwargs)
        if response.status_code < 300 and response.data:
            created = Superviseur.objects.filter(pk=response.data.get("id")).first()
            log_admin_action(
                actor=request.user,
                action="CREATE",
                resource_type="Superviseur",
                resource_id=response.data.get("id", ""),
                target_user=getattr(created, "utilisateur", None),
                after_data=snapshot_instance(created) if created else dict(response.data),
            )
        return response

    def update(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            return Response({'detail': "Action réservée à l'administrateur."}, status=status.HTTP_403_FORBIDDEN)
        target = self.get_object()
        before_data = snapshot_instance(target)
        response = super().update(request, *args, **kwargs)
        target.refresh_from_db()
        log_admin_action(
            actor=request.user,
            action="UPDATE",
            resource_type="Superviseur",
            resource_id=target.id,
            target_user=target.utilisateur,
            before_data=before_data,
            after_data=snapshot_instance(target),
        )
        return response

    def partial_update(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            return Response({'detail': "Action réservée à l'administrateur."}, status=status.HTTP_403_FORBIDDEN)
        target = self.get_object()
        before_data = snapshot_instance(target)
        response = super().partial_update(request, *args, **kwargs)
        target.refresh_from_db()
        log_admin_action(
            actor=request.user,
            action="UPDATE",
            resource_type="Superviseur",
            resource_id=target.id,
            target_user=target.utilisateur,
            before_data=before_data,
            after_data=snapshot_instance(target),
        )
        return response

    def destroy(self, request, *args, **kwargs):
        if not is_admin_user(request.user):
            return Response({'detail': "Action réservée à l'administrateur."}, status=status.HTTP_403_FORBIDDEN)
        target = self.get_object()
        before_data = snapshot_instance(target)
        target_id = target.id
        target_user = target.utilisateur
        response = super().destroy(request, *args, **kwargs)
        if response.status_code < 300:
            log_admin_action(
                actor=request.user,
                action="DELETE",
                resource_type="Superviseur",
                resource_id=target_id,
                target_user=target_user,
                before_data=before_data,
            )
        return response

    @action(detail=False, methods=['get', 'patch'], permission_classes=[IsAuthenticated])
    def mon_profil(self, request):
        """
        Récupère ou met à jour le profil superviseur de l'utilisateur connecté
        GET/PATCH /superviseurs/mon_profil/
        """
        try:
            superviseur = Superviseur.objects.get(utilisateur=request.user)

            if request.method == 'PATCH':
                editable_fields = {
                    'nom',
                    'prenom',
                    'telephone',
                    'adresse',
                    'departement',
                    'fonction',
                    'email',
                }
                payload = {key: value for key, value in request.data.items() if key in editable_fields}
                serializer = self.get_serializer(superviseur, data=payload, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                return Response(serializer.data)

            serializer = self.get_serializer(superviseur)
            return Response(serializer.data)
        except Superviseur.DoesNotExist:
            return Response(
                {'detail': 'Aucun profil superviseur trouvé pour cet utilisateur.'},
                status=status.HTTP_404_NOT_FOUND
            )


class ClasseViewSet(viewsets.ModelViewSet):
    queryset = Classe.objects.select_related('superviseur').all()
    serializer_class = ClasseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['superviseur', 'derogation']
    search_fields = ['nom', 'libelle']
    ordering = ['nom']


# ============================================================================
# ðŸ“š ANNÃ‰ES ACADÃ‰MIQUES
# ============================================================================

class AnneeAcademiqueViewSet(viewsets.ModelViewSet):
    """ViewSet pour gÃ©rer les annÃ©es acadÃ©miques"""
    queryset = AnneeAcademique.objects.all()
    serializer_class = AnneeAcademiqueSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['libelle', 'date_debut']
    ordering = ['-libelle']

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def actuelle(self, request):
        """
        RÃ©cupÃ¨re l'annÃ©e acadÃ©mique courante
        GET /annees-academiques/actuelle/
        """
        try:
            annee = AnneeAcademique.objects.get(active=True)
            serializer = self.get_serializer(annee)
            return Response(serializer.data)
        except AnneeAcademique.DoesNotExist:
            return Response(
                {'erreur': 'Aucune annÃ©e acadÃ©mique active'},
                status=status.HTTP_404_NOT_FOUND
            )


# ============================================================================
# ðŸ“… SEMESTRES
# ============================================================================

class SemestreViewSet(viewsets.ModelViewSet):
    """ViewSet pour gÃ©rer les semestres"""
    queryset = Semestre.objects.all()
    serializer_class = SemestreSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['numero', 'annee_academique']
    ordering_fields = ['annee_academique', 'numero']
    ordering = ['annee_academique', 'numero']


# ============================================================================
# ðŸ“– UNITÃ‰S D'ENSEIGNEMENT (UE)
# ============================================================================

class UEViewSet(viewsets.ModelViewSet):
    """ViewSet pour gÃ©rer les UnitÃ©s d'Enseignement"""
    queryset = UE.objects.all()
    serializer_class = UESerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    # Seuls les champs réellement présents sur le modèle UE doivent être utilisés
    filterset_fields = ['classe', 'semestre', 'code_ue']
    search_fields = ['code_ue', 'libelle', 'description']
    ordering_fields = ['code_ue', 'libelle']
    ordering = ['code_ue']

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def mes_ues(self, request):
        """
        Récupère les UE enseignées par l'utilisateur connecté
        GET /ues/mes_ues/
        """
        enseignant = Enseignant.objects.filter(utilisateur=request.user).first()
        if not enseignant:
            return Response([], status=status.HTTP_200_OK)

        ues = UE.objects.filter(matieres__enseignant=enseignant).distinct()
        serializer = self.get_serializer(ues, many=True)
        return Response(serializer.data)


class MatiereAcademiqueViewSet(viewsets.ModelViewSet):
    queryset = Matiere.objects.select_related('ue', 'session', 'enseignant').all()
    serializer_class = MatiereAcademiqueSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['ue', 'session', 'enseignant']
    search_fields = ['nom', 'ue__code_ue', 'ue__libelle']
    ordering = ['ue', 'nom']


# ============================================================================
# ðŸ—“ï¸ SESSIONS
# ============================================================================

class SessionViewSet(viewsets.ModelViewSet):
    """ViewSet pour gÃ©rer les sessions d'examen"""
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]
    ordering_fields = ['libelle']
    ordering = ['libelle']


# ============================================================================
# ðŸ“ MATIÃˆRES / NOTES
# ============================================================================

class MatiereViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gÃ©rer les notes (MatiÃ¨re)
    CRUD complet + Actions personnalisÃ©es pour analyse
    
    Filtrage par rôle:
    - Admin/Administrateur : accès complet à toutes les notes
    - Enseignant : accès uniquement aux notes des matières qu'il enseigne
    - Superviseur : lecture seule sur toutes les notes
    - Étudiant : lecture seule sur ses propres notes
    """
    serializer_class = MatiereSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['etudiant', 'matiere', 'matiere__ue', 'session', 'statut', 'est_publiee']
    search_fields = ['etudiant__nom', 'etudiant__prenom', 'matiere__nom', 'matiere__ue__libelle']
    ordering_fields = ['note_matiere', 'date_modification', 'etudiant']
    ordering = ['-date_modification']

    def get_queryset(self):
        """Filtre les notes selon le rôle et l'enseignant authentifié."""
        queryset = Note.objects.select_related(
            'etudiant', 'matiere', 'matiere__ue', 'matiere__ue__semestre', 'session', 'matiere__enseignant'
        ).all()
        
        user = self.request.user
        
        # Admin et administrateur : accès complet
        if user.role in ['admin', 'administrateur']:
            return queryset
        
        # Enseignant : accès uniquement aux notes des matières qu'il enseigne
        if user.role == 'enseignant':
            try:
                enseignant = Enseignant.objects.get(utilisateur=user)
                return queryset.filter(matiere__enseignant=enseignant)
            except Enseignant.DoesNotExist:
                return queryset.none()
        
        # Superviseur et autres : lecture seule, pas d'accès en écriture (géré par la permission)
        return queryset

    def perform_create(self, serializer):
        """Ajoute une validation pour empêcher les modifications non autorisées."""
        serializer.save()

    def perform_update(self, serializer):
        """Ajoute une validation pour empêcher les modifications non autorisées."""
        serializer.save()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def statistiques(self, request):
        """
        Calcule les statistiques des notes
        GET /matieres/statistiques/
        """
        matieres = self.get_queryset()
        
        from django.db.models import Avg, Count, Q
        stats = matieres.aggregate(
            nombre_notes=Count('id'),
            moyenne_generale=Avg('note_matiere'),
            nombre_validees=Count('id', filter=Q(statut='V')),
            nombre_non_validees=Count('id', filter=Q(statut='NV'))
        )
        
        return Response({
            'statistiques': stats,
            'taux_reussite': (
                stats['nombre_validees'] / stats['nombre_notes'] * 100
                if stats['nombre_notes'] > 0 else 0
            )
        })

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def calculer_moyennes(self, request):
        """
        Recalcule toutes les moyennes
        POST /matieres/calculer_moyennes/
        """
        matieres_updated = 0
        for matiere in self.get_queryset():
            matiere.save()
            matieres_updated += 1
        
        return Response({
            'message': f'{matieres_updated} notes mises à jour'
        })


class ResultatUEViewSet(viewsets.ReadOnlyModelViewSet):
    """Expose les résultats agrégés par UE."""
    queryset = ResultatUE.objects.all()
    serializer_class = ResultatUESerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['etudiant', 'ue', 'session', 'statut']
    search_fields = ['etudiant__nom', 'etudiant__prenom', 'ue__libelle', 'ue__code_ue']
    ordering_fields = ['date_calcul', 'moyenne_ue']
    ordering = ['-date_calcul']


class ResultatSemestreViewSet(viewsets.ReadOnlyModelViewSet):
    """Expose les résultats agrégés par semestre."""
    queryset = ResultatSemestre.objects.all()
    serializer_class = ResultatSemestreSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['etudiant', 'semestre', 'session', 'statut']
    search_fields = ['etudiant__nom', 'etudiant__prenom', 'semestre__numero']
    ordering_fields = ['date_calcul', 'moyenne_generale']
    ordering = ['-date_calcul']


# ============================================================================
# ðŸš¨ ALERTES
# ============================================================================

class AlertViewSet(viewsets.ModelViewSet):
    """ViewSet pour gÃ©rer les alertes de modification"""
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['type_modification', 'lu']
    ordering_fields = ['date_modification']
    ordering = ['-date_modification']

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def marquer_comme_lue(self, request, pk=None):
        """
        Marquer une alerte comme lue
        POST /alertes/{id}/marquer_comme_lue/
        """
        alert = self.get_object()
        alert.lu = True
        alert.save()
        return Response({'message': 'Alerte marquÃ©e comme lue'})

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def marquer_toutes_comme_lues(self, request):
        """
        Marquer toutes les alertes comme lues
        POST /alertes/marquer_toutes_comme_lues/
        """
        Alert.objects.filter(lu=False).update(lu=True)
        return Response({'message': 'Toutes les alertes marquÃ©es comme lues'})


class AdminAuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Consultation des journaux d'audit admin (admin uniquement)."""
    queryset = AdminAuditLog.objects.select_related('actor', 'target_user').all()
    serializer_class = AdminAuditLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['action', 'resource_type', 'actor', 'target_user']
    search_fields = ['actor__username', 'target_user__username', 'resource_type', 'resource_id']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        if not is_admin_user(self.request.user):
            return AdminAuditLog.objects.none()
        return super().get_queryset()


# ============================================================================
# ðŸŽ« CODES D'INSCRIPTION
# ============================================================================

class CodeInscriptionViewSet(viewsets.ModelViewSet):
    """ViewSet pour gÃ©rer les codes d'inscription (Admin uniquement)"""
    queryset = CodeInscription.objects.all()
    serializer_class = CodeInscriptionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['role', 'actif']
    ordering_fields = ['date_creation']
    ordering = ['-date_creation']

    def get_queryset(self):
        """Filtrer selon le rÃ´le"""
        if self.request.user.role in ['admin', 'administrateur', 'superviseur']:
            return CodeInscription.objects.all()
        return CodeInscription.objects.none()


# ============================================================================
# âœï¸ INSCRIPTION
# ============================================================================

class InscriptionView(APIView):
    """
    Vue pour l'enregistrement des nouveaux utilisateurs
    POST: CrÃ©er un nouveau compte avec preuve d'appartenance
    """
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = InscriptionSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    'message': 'Demande d\'inscription envoyÃ©e. Votre preuve sera vÃ©rifiÃ©e par l\'administrateur avant l\'envoi du code par email.',
                    'user': {
                        'username': user.username,
                        'email': user.email,
                        'role': user.role,
                    },
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ActivateAccountView(APIView):
    """
    Active un compte Ã©tudiant Ã  partir du code d'inscription reÃ§u par email.
    POST: Active le compte puis renvoie les tokens JWT.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ActivationCodeSerializer(data=request.data)
        if serializer.is_valid():
            activation_data = serializer.save()
            return Response(activation_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Vue JWT avec message mÃ©tier pour les comptes non encore activÃ©s."""
    serializer_class = CustomTokenObtainPairSerializer
