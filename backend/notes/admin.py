from django.contrib import admin, messages
from django.utils.html import format_html

from .models import (
    AdminAuditLog,
    Alert,
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
)
from .services import validate_user_registration


EMAIL_STATUS_LABELS = {
    "missing_email": "email manquant",
    "invalid_email": "email invalide",
    "smtp_error": "erreur d'envoi SMTP",
}


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "role", "is_active", "compte_active", "preuve_validee", "preuve_preview", "date_joined")
    list_filter = ("role", "is_active", "compte_active", "preuve_validee")
    search_fields = ("username", "email")
    readonly_fields = ("preuve_preview", "date_validation_preuve", "code_activation", "code_inscription_attribue", "date_joined")
    actions = ["valider_preuves_inscription"]

    fieldsets = (
        ("Authentification", {"fields": ("username", "password", "email")}),
        ("Informations personnelles", {"fields": ("first_name", "last_name")}),
        ("Permissions", {"fields": ("role", "is_active", "compte_active", "is_staff", "is_superuser", "groups", "user_permissions"), "classes": ("collapse",)}),
        ("Inscription", {"fields": ("preuve_appartenance", "preuve_preview", "preuve_validee", "date_validation_preuve", "code_activation", "code_inscription_attribue")}),
        ("Dates", {"fields": ("date_joined", "last_login"), "classes": ("collapse",)}),
    )

    def preuve_preview(self, obj):
        if obj.preuve_appartenance:
            return format_html('<img src="{}" style="height: 100px; border-radius:8px;" />', obj.preuve_appartenance.url)
        return "Aucune preuve"

    preuve_preview.short_description = "Preuve d'appartenance"

    @admin.action(description="Valider les preuves d'inscription selectionnees")
    def valider_preuves_inscription(self, request, queryset):
        validated_count = 0
        skipped_count = 0
        email_sent_count = 0
        email_failed_count = 0
        warning_details = []
        for user in queryset:
            if not user.preuve_appartenance or user.preuve_validee:
                skipped_count += 1
                continue
            try:
                _, email_sent, email_status = validate_user_registration(user)
                validated_count += 1
                if email_sent:
                    email_sent_count += 1
                else:
                    email_failed_count += 1
                    reason = EMAIL_STATUS_LABELS.get(email_status, "raison inconnue")
                    warning_details.append(f"{user.username}: email non envoyé ({reason})")
            except Exception as e:
                email_failed_count += 1
                warning_details.append(f"{user.username}: {str(e)}")
                import traceback
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Erreur validation {user.username}: {traceback.format_exc()}")
        
        message = (
            f"{validated_count} validée(s), {skipped_count} ignorée(s), "
            f"{email_sent_count} email(s) envoyé(s), {email_failed_count} sans email."
        )
        if warning_details:
            message += "\n\nDétails:\n" + "\n".join(warning_details)
        
        self.message_user(request, message, messages.SUCCESS if email_failed_count == 0 else messages.WARNING)

    def save_model(self, request, obj, form, change):
        should_send_code = False
        if change and "preuve_validee" in form.changed_data and obj.preuve_validee:
            previous = CustomUser.objects.get(pk=obj.pk)
            should_send_code = not previous.preuve_validee and bool(obj.preuve_appartenance)

        super().save_model(request, obj, form, change)

        if should_send_code:
            try:
                code, email_sent, email_status = validate_user_registration(obj)
                if email_sent:
                    delivery = "envoyé par email"
                else:
                    reason = EMAIL_STATUS_LABELS.get(email_status, "raison inconnue")
                    delivery = f"non envoyé par email ({reason}), code disponible en console"
                self.message_user(
                    request,
                    f"Preuve validée. Code d'activation: {code.code} ({delivery}).",
                    messages.SUCCESS,
                )
            except Exception as e:
                self.message_user(
                    request,
                    f"Validation enregistree mais le code n'a pas pu etre genere/envoye: {e}",
                    messages.ERROR,
                )


@admin.register(Enseignant)
class EnseignantAdmin(admin.ModelAdmin):
    list_display = ("display_nom", "display_prenom", "specialite", "grade", "display_email")
    search_fields = ("nom", "prenom", "specialite", "email", "utilisateur__first_name", "utilisateur__last_name", "utilisateur__email")
    autocomplete_fields = ("utilisateur",)


@admin.register(Superviseur)
class SuperviseurAdmin(admin.ModelAdmin):
    list_display = ("nom", "prenom", "departement", "fonction", "email")
    search_fields = ("nom", "prenom", "departement", "email")
    autocomplete_fields = ("utilisateur",)


@admin.register(Classe)
class ClasseAdmin(admin.ModelAdmin):
    list_display = ("nom", "libelle", "derogation", "superviseur")
    list_filter = ("derogation", "superviseur")
    search_fields = ("nom", "libelle")
    autocomplete_fields = ("superviseur",)


@admin.register(Etudiant)
class EtudiantAdmin(admin.ModelAdmin):
    list_display = ("display_nom", "display_prenom", "matricule", "sexe", "display_email", "date_inscription")
    list_filter = ("sexe", "date_inscription")
    search_fields = ("nom", "prenom", "matricule", "email", "utilisateur__first_name", "utilisateur__last_name", "utilisateur__email")
    readonly_fields = ("date_inscription",)
    autocomplete_fields = ("utilisateur",)


@admin.register(AnneeAcademique)
class AnneeAcademiqueAdmin(admin.ModelAdmin):
    list_display = ("libelle", "date_debut", "date_fin", "active")
    list_filter = ("active", "date_debut")
    search_fields = ("libelle",)

""" 
@admin.register(Semestre)
class SemestreAdmin(admin.ModelAdmin):
    list_display = ("numero", "annee_academique", "date_debut", "date_fin")
    list_filter = ("numero", "annee_academique")
    search_fields = ("numero", "annee_academique__libelle")
    raw_id_fields = ("annee_academique",)
 """

@admin.register(Semestre)
class SemestreAdmin(admin.ModelAdmin):
    # Suppression de "annee_academique" ici
    list_display = ("numero", "date_debut", "date_fin")
    
    # Suppression de "annee_academique" ici
    list_filter = ("numero",) # Gardez la virgule pour le tuple
    
    # Suppression de "annee_academique__libelle" ici
    search_fields = ("numero",) 
    
    # Plus besoin de raw_id_fields s'il n'y a plus de relation
    raw_id_fields = () 

@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ("libelle", "type_session", "annee_academique", "semestre")
    list_filter = ("type_session", "annee_academique", "semestre")
    search_fields = ("libelle", "semestre__numero")
    autocomplete_fields = ("annee_academique", "semestre")


@admin.register(UE)
class UEAdmin(admin.ModelAdmin):
    list_display = ("code_ue", "libelle", "classe", "semestre")
    list_filter = ("classe", "semestre")
    search_fields = ("code_ue", "libelle")
    autocomplete_fields = ("classe", "semestre")


""" @admin.register(UE)
class UEAdmin(admin.ModelAdmin):
    # Les éléments "credits" et "coefficient" ont été retirés
    list_display = ("code_ue", "libelle", "classe", "semestre", "enseignant")
    
    # L'élément "credits" a été retiré
    list_filter = ("classe", "semestre", "enseignant")
    
    search_fields = ("code_ue", "libelle")
    raw_id_fields = ("classe", "semestre", "enseignant") """



@admin.register(Matiere)
class MatiereAdmin(admin.ModelAdmin):
    list_display = ("nom", "code_matiere", "ue", "session", "enseignant", "coefficient", "credits")
    list_filter = ("enseignant",)
    search_fields = ("nom", "code_matiere", "ue__code_ue", "ue__libelle")
    fields = ("nom", "code_matiere", "ue", "session", "enseignant", "coefficient", "credits")
    autocomplete_fields = ("ue", "enseignant")

    class Media:
        js = ("notes/js/matiere_admin.js",)


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ("etudiant", "matiere", "note_devoir", "note_examen", "note_matiere", "statut", "est_publiee", "date_modification")
    list_filter = ("statut", "est_publiee")
    search_fields = ("etudiant__nom", "etudiant__prenom", "matiere__nom", "matiere__ue__code_ue")
    autocomplete_fields = ("etudiant", "matiere")
    readonly_fields = ("note_matiere", "statut", "date_saisie", "date_modification")




""" @admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    # Suppression de "est_publiee" ici
    list_display = ("etudiant", "matiere", "note_devoir", "note_examen", "note_matiere", "statut", "date_modification")
    
    # Suppression de "est_publiee" ici
    list_filter = ("statut",) # Gardez la virgule à la fin pour que Django lise cela comme un tuple
    
    search_fields = ("etudiant__nom", "etudiant__prenom", "matiere__nom", "matiere__ue__code_ue")
    raw_id_fields = ("etudiant", "matiere")
    readonly_fields = ("note_matiere", "statut", "date_saisie", "date_modification") """


@admin.register(ResultatUE)
class ResultatUEAdmin(admin.ModelAdmin):
    list_display = ("etudiant", "ue", "session", "moyenne_ue", "statut", "date_calcul")
    list_filter = ("statut", "session")
    autocomplete_fields = ("etudiant", "ue", "session")


@admin.register(ResultatSemestre)
class ResultatSemestreAdmin(admin.ModelAdmin):
    list_display = ("etudiant", "semestre", "session", "moyenne_generale", "statut", "date_calcul")
    list_filter = ("statut", "session", "semestre")
    autocomplete_fields = ("etudiant", "semestre", "session")


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ("type_modification", "note", "matiere", "modifie_par", "date_modification", "lu")
    list_filter = ("type_modification", "lu", "date_modification")
    search_fields = ("description", "modifie_par__username")
    readonly_fields = ("date_modification",)


@admin.register(AdminAuditLog)
class AdminAuditLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "action", "actor", "target_user", "resource_type", "resource_id")
    list_filter = ("action", "resource_type", "created_at")
    search_fields = ("actor__username", "target_user__username", "resource_type", "resource_id")
    readonly_fields = ("created_at", "action", "actor", "target_user", "resource_type", "resource_id", "before_data", "after_data", "metadata")
    autocomplete_fields = ("actor", "target_user")


@admin.register(CodeInscription)
class CodeInscriptionAdmin(admin.ModelAdmin):
    list_display = ("code", "role", "actif", "date_creation", "utilise_par", "date_utilisation")
    list_filter = ("role", "actif", "date_creation")
    search_fields = ("code", "utilise_par__username")
    autocomplete_fields = ("utilise_par",)
    readonly_fields = ("date_creation", "code")
