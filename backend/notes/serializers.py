from decimal import Decimal

from django.utils import timezone
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    AdminAuditLog,
    AnneeAcademique,
    Classe,
    CodeInscription,
    CustomUser,
    Enseignant,
    Etudiant,
    Matiere,
    Note,
    ResultatSemestre,
    ResultatUE,
    Semestre,
    Session,
    Superviseur,
    UE,
    Alert,
)


class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=False)

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "password",
            "is_active",
            "compte_active",
            "preuve_validee",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = CustomUser(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class CurrentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "username", "email", "role", "is_superuser", "compte_active"]


class EnseignantSerializer(serializers.ModelSerializer):
    utilisateur_username = serializers.CharField(source="utilisateur.username", read_only=True)

    class Meta:
        model = Enseignant
        fields = ["id", "utilisateur", "utilisateur_username", "nom", "prenom", "telephone", "adresse", "specialite", "grade", "photo", "email"]
        read_only_fields = ["id"]


class SuperviseurSerializer(serializers.ModelSerializer):
    utilisateur_username = serializers.CharField(source="utilisateur.username", read_only=True)

    class Meta:
        model = Superviseur
        fields = ["id", "utilisateur", "utilisateur_username", "nom", "prenom", "telephone", "adresse", "departement", "fonction", "photo", "email"]
        read_only_fields = ["id"]


class ClasseSerializer(serializers.ModelSerializer):
    superviseur_nom = serializers.CharField(source="superviseur.nom", read_only=True)

    class Meta:
        model = Classe
        fields = ["id", "nom", "libelle", "derogation", "superviseur", "superviseur_nom"]
        read_only_fields = ["id"]


class EtudiantSerializer(serializers.ModelSerializer):
    utilisateur_username = serializers.CharField(source="utilisateur.username", read_only=True)

    class Meta:
        model = Etudiant
        fields = [
            "id",
            "utilisateur",
            "utilisateur_username",
            "nom",
            "prenom",
            "matricule",
            "date_naissance",
            "lieu_naissance",
            "sexe",
            "email",
            "telephone",
            "adresse",
            "photo",
            "date_inscription",
        ]
        read_only_fields = ["id", "date_inscription"]


class AnneeAcademiqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnneeAcademique
        fields = ["id", "libelle", "date_debut", "date_fin", "active"]
        read_only_fields = ["id"]


class SemestreSerializer(serializers.ModelSerializer):
    annee_academique_libelle = serializers.CharField(source="annee_academique.libelle", read_only=True)

    class Meta:
        model = Semestre
        fields = ["id", "numero", "annee_academique", "annee_academique_libelle", "date_debut", "date_fin"]
        read_only_fields = ["id"]


class SessionSerializer(serializers.ModelSerializer):
    annee_academique_libelle = serializers.CharField(source="annee_academique.libelle", read_only=True)
    semestre_numero = serializers.CharField(source="semestre.numero", read_only=True)

    class Meta:
        model = Session
        fields = ["id", "libelle", "type_session", "annee_academique", "annee_academique_libelle", "semestre", "semestre_numero", "description"]
        read_only_fields = ["id"]


class UESerializer(serializers.ModelSerializer):
    classe_nom = serializers.CharField(source="classe.nom", read_only=True)
    semestre_numero = serializers.CharField(source="semestre.numero", read_only=True)

    class Meta:
        model = UE
        fields = [
            "id",
            "code_ue",
            "libelle",
            "classe",
            "classe_nom",
            "semestre",
            "semestre_numero",
        ]
        read_only_fields = ["id"]


class MatiereAcademiqueSerializer(serializers.ModelSerializer):
    ue_code = serializers.CharField(source="ue.code_ue", read_only=True)
    ue_libelle = serializers.CharField(source="ue.libelle", read_only=True)
    session_libelle = serializers.CharField(source="session.libelle", read_only=True)
    enseignant_nom = serializers.CharField(source="enseignant.nom", read_only=True)

    class Meta:
        model = Matiere
        fields = [
            "id",
            "nom",
            "code_matiere",
            "coefficient",
            "credits",
            "ue",
            "ue_code",
            "ue_libelle",
            "session",
            "session_libelle",
            "enseignant",
            "enseignant_nom",
        ]
        read_only_fields = ["id"]


class NoteSerializer(serializers.ModelSerializer):
    etudiant_nom = serializers.CharField(source="etudiant.nom", read_only=True)
    etudiant_prenom = serializers.CharField(source="etudiant.prenom", read_only=True)
    matiere_nom = serializers.CharField(source="matiere.nom", read_only=True)
    ue = serializers.PrimaryKeyRelatedField(source="matiere.ue", read_only=True)
    ue_code = serializers.CharField(source="matiere.ue.code_ue", read_only=True)
    ue_libelle = serializers.CharField(source="matiere.ue.libelle", read_only=True)
    semestre = serializers.PrimaryKeyRelatedField(source="matiere.ue.semestre", read_only=True)
    semestre_numero = serializers.CharField(source="matiere.ue.semestre.numero", read_only=True)
    session_libelle = serializers.CharField(source="session.libelle", read_only=True)

    def validate(self, attrs):
        matiere = attrs.get("matiere")
        session = attrs.get("session")
        etudiant = attrs.get("etudiant")

        if self.instance is None and etudiant is not None and matiere is not None and session is not None:
            if getattr(session, "type_session", None) == "SR":
                already_passed = Note.objects.filter(
                    etudiant=etudiant,
                    matiere=matiere,
                    session__type_session="SO",
                    note_matiere__gte=Decimal("10"),
                ).exists()

                if already_passed:
                    raise serializers.ValidationError({
                        "etudiant": ["Cet étudiant a déjà validé cette matière en session ordinaire et ne peut pas passer en rattrapage."]
                    })
        
        if self.instance is None and matiere is None:
            raise serializers.ValidationError({"matiere": ["La matière est requise."]})
        
        if self.instance is None and session is None:
            raise serializers.ValidationError({"session": ["La session est requise."]})
        
        return attrs
    
    devoir = serializers.DecimalField(source="note_devoir", max_digits=5, decimal_places=2, required=False, allow_null=True)
    examen = serializers.DecimalField(source="note_examen", max_digits=5, decimal_places=2, required=False, allow_null=True)
    moyenne = serializers.DecimalField(source="note_matiere", max_digits=5, decimal_places=2, read_only=True)
    resultat = serializers.CharField(source="statut", read_only=True)
    publie = serializers.BooleanField(source="est_publiee", required=False)

    class Meta:
        model = Note
        fields = [
            "id",
            "etudiant",
            "etudiant_nom",
            "etudiant_prenom",
            "matiere",
            "matiere_nom",
            "ue",
            "ue_code",
            "ue_libelle",
            "semestre",
            "semestre_numero",
            "session",
            "session_libelle",
            "note_devoir",
            "note_examen",
            "note_matiere",
            "statut",
            "est_publiee",
            "devoir",
            "examen",
            "moyenne",
            "resultat",
            "publie",
            "date_saisie",
            "date_modification",
        ]
        read_only_fields = ["id", "note_matiere", "statut", "date_saisie", "date_modification"]


class NoteListSerializer(serializers.ModelSerializer):
    etudiant_str = serializers.CharField(source="etudiant", read_only=True)
    ue_str = serializers.CharField(source="matiere.ue", read_only=True)
    devoir = serializers.DecimalField(source="note_devoir", max_digits=5, decimal_places=2, read_only=True)
    examen = serializers.DecimalField(source="note_examen", max_digits=5, decimal_places=2, read_only=True)
    moyenne = serializers.DecimalField(source="note_matiere", max_digits=5, decimal_places=2, read_only=True)
    resultat = serializers.CharField(source="statut", read_only=True)
    publie = serializers.BooleanField(source="est_publiee", read_only=True)

    class Meta:
        model = Note
        fields = ["id", "etudiant_str", "ue_str", "devoir", "examen", "moyenne", "resultat", "publie", "date_modification"]


MatiereSerializer = NoteSerializer
MatiereListSerializer = NoteListSerializer


class ResultatUESerializer(serializers.ModelSerializer):
    ue_code = serializers.CharField(source="ue.code_ue", read_only=True)
    ue_libelle = serializers.CharField(source="ue.libelle", read_only=True)
    etudiant_nom = serializers.CharField(source="etudiant.nom", read_only=True)
    etudiant_prenom = serializers.CharField(source="etudiant.prenom", read_only=True)
    semestre = serializers.PrimaryKeyRelatedField(source="ue.semestre", read_only=True)
    semestre_numero = serializers.CharField(source="ue.semestre.numero", read_only=True)
    session_libelle = serializers.CharField(source="session.libelle", read_only=True)
    moyenne = serializers.DecimalField(source="moyenne_ue", max_digits=5, decimal_places=2, read_only=True)
    resultat = serializers.CharField(source="statut", read_only=True)
    matieres = serializers.SerializerMethodField(read_only=True)
    primary_matiere_id = serializers.SerializerMethodField(read_only=True)
    primary_matiere_nom = serializers.SerializerMethodField(read_only=True)

    def get_matieres(self, obj):
        """Retourne les matières associées à cette UE"""
        from notes.models import Matiere
        
        # Récupérer toutes les matières de cette UE
        matieres = Matiere.objects.filter(ue=obj.ue).order_by("nom")
        
        return [
            {
                "id": matiere.id,
                "nom": matiere.nom,
            }
            for matiere in matieres
        ]

    def get_primary_matiere_id(self, obj):
        """Retourne l'ID de la première matière"""
        from notes.models import Matiere
        
        # Récupérer la première matière de cette UE
        matiere = Matiere.objects.filter(ue=obj.ue).order_by("nom").first()
        return matiere.id if matiere else None

    def get_primary_matiere_nom(self, obj):
        """Retourne le nom de la première matière"""
        from notes.models import Matiere
        
        # Récupérer la première matière de cette UE
        matiere = Matiere.objects.filter(ue=obj.ue).order_by("nom").first()
        return matiere.nom if matiere else None

    class Meta:
        model = ResultatUE
        fields = [
            "id",
            "etudiant",
            "etudiant_nom",
            "etudiant_prenom",
            "ue",
            "ue_code",
            "ue_libelle",
            "semestre",
            "semestre_numero",
            "session",
            "session_libelle",
            "moyenne_ue",
            "statut",
            "moyenne",
            "resultat",
            "matieres",
            "primary_matiere_id",
            "primary_matiere_nom",
            "date_calcul",
        ]
        read_only_fields = ["id", "date_calcul"]


class ResultatSemestreSerializer(serializers.ModelSerializer):
    etudiant_nom = serializers.CharField(source="etudiant.nom", read_only=True)
    etudiant_prenom = serializers.CharField(source="etudiant.prenom", read_only=True)
    semestre_numero = serializers.CharField(source="semestre.numero", read_only=True)
    session_libelle = serializers.CharField(source="session.libelle", read_only=True)
    resultat = serializers.CharField(source="statut", read_only=True)

    class Meta:
        model = ResultatSemestre
        fields = [
            "id",
            "etudiant",
            "etudiant_nom",
            "etudiant_prenom",
            "semestre",
            "semestre_numero",
            "session",
            "session_libelle",
            "moyenne_generale",
            "statut",
            "resultat",
            "date_calcul",
        ]
        read_only_fields = ["id", "date_calcul"]


class AlertSerializer(serializers.ModelSerializer):
    modifie_par_username = serializers.CharField(source="modifie_par.username", read_only=True)
    note_str = serializers.CharField(source="note", read_only=True)
    matiere_str = serializers.CharField(source="matiere", read_only=True)

    class Meta:
        model = Alert
        fields = ["id", "type_modification", "note", "note_str", "matiere", "matiere_str", "modifie_par", "modifie_par_username", "description", "date_modification", "lu"]
        read_only_fields = ["id", "date_modification"]


class AdminAuditLogSerializer(serializers.ModelSerializer):
    actor_username = serializers.CharField(source="actor.username", read_only=True)
    target_username = serializers.CharField(source="target_user.username", read_only=True)

    class Meta:
        model = AdminAuditLog
        fields = [
            "id",
            "created_at",
            "action",
            "actor",
            "actor_username",
            "target_user",
            "target_username",
            "resource_type",
            "resource_id",
            "before_data",
            "after_data",
            "metadata",
        ]
        read_only_fields = fields


class CodeInscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeInscription
        fields = ["id", "code", "role", "actif", "date_creation", "date_expiration", "utilise_par", "date_utilisation"]
        read_only_fields = ["id", "code", "date_creation"]


class InscriptionSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES, required=False, default="etudiant")
    preuve_appartenance = serializers.ImageField(required=True)

    def validate_username(self, value):
        username = value.strip().lower()
        if CustomUser.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur est deja pris.")
        return username

    def validate_email(self, value):
        email = value.strip().lower()
        if CustomUser.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("Cette adresse email est deja utilisee.")
        return email

    def validate_preuve_appartenance(self, value):
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("La preuve ne doit pas depasser 5 Mo.")
        return value

    def create(self, validated_data):
        username = validated_data["username"].strip().lower()
        email = validated_data["email"].strip().lower()
        return CustomUser.objects.create_user(
            username=username,
            email=email,
            password=validated_data["password"],
            first_name=validated_data.get("first_name", "").strip(),
            last_name=validated_data.get("last_name", "").strip(),
            role=validated_data.get("role", "etudiant"),
            is_active=False,
            compte_active=False,
            preuve_appartenance=validated_data["preuve_appartenance"],
        )


class ActivationCodeSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)
    code_inscription = serializers.CharField(max_length=8)

    def validate(self, attrs):
        username = attrs["username"].strip().lower()
        password = attrs["password"]
        code_value = attrs["code_inscription"].strip().upper()

        try:
            user = CustomUser.objects.get(username__iexact=username)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError({"username": ["Aucun compte ne correspond a ce nom d'utilisateur."]})

        if not user.check_password(password):
            raise serializers.ValidationError({"password": ["Mot de passe incorrect."]})
        if user.is_active:
            raise serializers.ValidationError({"non_field_errors": ["Ce compte est deja active. Connectez-vous normalement."]})
        if not user.preuve_validee:
            raise serializers.ValidationError({"non_field_errors": ["Votre inscription n'a pas encore ete validee par l'administrateur."]})
        if user.code_activation != code_value and user.code_inscription_attribue != code_value:
            raise serializers.ValidationError({"code_inscription": ["Ce code ne correspond pas a votre compte."]})

        try:
            code = CodeInscription.objects.get(code=code_value, role=user.role)
        except CodeInscription.DoesNotExist:
            raise serializers.ValidationError({"code_inscription": ["Code d'inscription introuvable."]})

        if not code.actif:
            raise serializers.ValidationError({"code_inscription": ["Ce code a deja ete utilise ou a ete desactive."]})
        if code.date_expiration and code.date_expiration <= timezone.now():
            raise serializers.ValidationError({"code_inscription": ["Ce code d'inscription a expire."]})

        attrs["user"] = user
        attrs["code"] = code
        return attrs

    def save(self, **kwargs):
        user = self.validated_data["user"]
        code = self.validated_data["code"]

        user.is_active = True
        user.compte_active = True
        user.save(update_fields=["is_active", "compte_active"])

        if user.role == "etudiant":
            Etudiant.objects.get_or_create(
                utilisateur=user,
                defaults={"nom": user.first_name or user.username, "prenom": user.last_name or "", "matricule": f"ETU{user.id:06d}", "email": user.email},
            )

        code.actif = False
        code.utilise_par = user
        code.date_utilisation = timezone.now()
        code.save(update_fields=["actif", "utilise_par", "date_utilisation"])

        refresh = RefreshToken.for_user(user)
        return {"message": "Compte active avec succes.", "access": str(refresh.access_token), "refresh": str(refresh), "user": {"username": user.username, "email": user.email, "role": user.role}}


class PasswordResetRequestSerializer(serializers.Serializer):
    identifier = serializers.CharField(max_length=150)

    def validate_identifier(self, value):
        return value.strip()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField(max_length=255, required=False, allow_blank=True)
    uidb64 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    token = serializers.CharField(max_length=255)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        uid = (attrs.get("uid") or "").strip()
        uidb64 = (attrs.get("uidb64") or "").strip()
        if not uid and not uidb64:
            raise serializers.ValidationError({"uid": ["Le paramètre uid est requis."]})

        attrs["uid"] = uid or uidb64
        return attrs

    def validate_new_password(self, value):
        if len(value.strip()) < 8:
            raise serializers.ValidationError("Le mot de passe doit contenir au moins 8 caractères.")
        return value


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    default_error_messages = {"no_active_account": "Nom d'utilisateur ou mot de passe incorrect."}

    def validate(self, attrs):
        username = attrs.get(self.username_field, "").strip()
        password = attrs.get("password", "")
        normalized_username = username.lower() if "@" in username else username
        user = CustomUser.objects.filter(username__iexact=normalized_username).first()
        if user and not user.is_active and user.check_password(password):
            raise AuthenticationFailed("Votre compte n'est pas encore active. Utilisez le code recu par email.", code="account_not_activated")
        return super().validate(attrs)
