from decimal import Decimal

from django.contrib.auth.models import AbstractUser
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


NOTE_VALIDEE = "V"
NOTE_NON_VALIDEE = "NV"
NOTE_ELIMINATOIRE = "NE"
SEMESTRE_NON_ELIMINATOIRE = "NE"


class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ("enseignant", "Enseignant"),
        ("etudiant", "Etudiant"),
        ("superviseur", "Superviseur"),
        ("administrateur", "Administrateur"),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="enseignant")
    preuve_appartenance = models.ImageField(upload_to="preuves_inscription/", blank=True, null=True)
    preuve_validee = models.BooleanField(default=False)
    date_validation_preuve = models.DateTimeField(blank=True, null=True)
    code_activation = models.CharField(max_length=8, blank=True)
    compte_active = models.BooleanField(default=False)
    code_inscription_attribue = models.CharField(max_length=8, blank=True)

    @property
    def is_admin_role(self):
        return self.role in {"administrateur", "admin"}

    def __str__(self):
        return f"{self.username} ({self.role})"


class AnneeAcademique(models.Model):
    libelle = models.CharField(max_length=50, unique=True, verbose_name="Libelle de l'annee")
    date_debut = models.DateField(null=True, blank=True, verbose_name="Date de debut")
    date_fin = models.DateField(null=True, blank=True, verbose_name="Date de fin")
    active = models.BooleanField(default=False, verbose_name="Annee active")

    class Meta:
        verbose_name = "Annee academique"
        verbose_name_plural = "Annees academiques"
        ordering = ["-libelle"]

    def __str__(self):
        return self.libelle


class Semestre(models.Model):
    numero = models.CharField(max_length=10, verbose_name="Numero")
    annee_academique = models.ForeignKey(
        AnneeAcademique,
        on_delete=models.CASCADE,
        related_name="semestres",
        verbose_name="Annee academique",
    ) 
    date_debut = models.DateField(null=True, blank=True, verbose_name="Date de debut")
    date_fin = models.DateField(null=True, blank=True, verbose_name="Date de fin")

    class Meta:
        verbose_name = "Semestre"
        verbose_name_plural = "Semestres"
        unique_together = ("numero", "annee_academique")
        ordering = ["annee_academique", "numero"]

    def __str__(self):
        return f"{self.numero} - {self.annee_academique}" if self.annee_academique else self.numero


class Enseignant(models.Model):
    utilisateur = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="profil_enseignant",
        limit_choices_to={"role": "enseignant"},
        verbose_name="Utilisateur",
    )
    nom = models.CharField(max_length=100, blank=True, verbose_name="Nom")
    prenom = models.CharField(max_length=100, blank=True, verbose_name="Prenom")
    email = models.EmailField(blank=True, verbose_name="Email")
    telephone = models.CharField(max_length=20, blank=True, verbose_name="Telephone")
    adresse = models.TextField(blank=True, verbose_name="Adresse")
    specialite = models.CharField(max_length=150, blank=True, verbose_name="Specialite")
    grade = models.CharField(max_length=100, blank=True, verbose_name="Grade")
    photo = models.ImageField(upload_to="photos_enseignants/", blank=True, verbose_name="Photo")
    date_recrutement = models.DateTimeField(auto_now_add=True, verbose_name="Date de recrutement")

    class Meta:
        verbose_name = "Enseignant"
        verbose_name_plural = "Enseignants"
        ordering = ["nom", "prenom"]

    def display_nom(self):
        return self.nom or self.utilisateur.first_name or self.utilisateur.username
    display_nom.short_description = "Nom"

    def display_prenom(self):
        return self.prenom or self.utilisateur.last_name or ""
    display_prenom.short_description = "Prénom"

    def display_email(self):
        return self.email or self.utilisateur.email or ""
    display_email.short_description = "Email"

    def __str__(self):
        return f"{self.nom} {self.prenom}".strip() or self.utilisateur.username

class Superviseur(models.Model):
    utilisateur = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="profil_superviseur",
        limit_choices_to={"role": "superviseur"},
        verbose_name="Utilisateur",
    )
    nom = models.CharField(max_length=100, blank=True, verbose_name="Nom")
    prenom = models.CharField(max_length=100, blank=True, verbose_name="Prenom")
    departement = models.CharField(max_length=150, blank=True, verbose_name="Departement")
    fonction = models.CharField(max_length=150, blank=True, verbose_name="Fonction")
    email = models.EmailField(blank=True, verbose_name="Email")

    class Meta:
        verbose_name = "Superviseur"
        verbose_name_plural = "Superviseurs"
        ordering = ["nom", "prenom"]

    def __str__(self):
        return f"{self.nom} {self.prenom}".strip() or self.utilisateur.username

class Classe(models.Model):
    nom = models.CharField(max_length=100, verbose_name="Nom")
    libelle = models.CharField(max_length=200, blank=True, verbose_name="Libelle")
    derogation = models.BooleanField(default=False, verbose_name="Derogation")
    superviseur = models.ForeignKey(
        "Superviseur",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="classes",
        verbose_name="Superviseur",
    )
    """ parcours = models.ForeignKey(
    "Parcours",
    on_delete=models.PROTECT,
    related_name="classes"
) """
    class Meta:
        verbose_name = "Classe"
        verbose_name_plural = "Classes"
        ordering = ["nom"]
        indexes = [models.Index(fields=["nom"])]

    def __str__(self):
        return self.libelle or self.nom


class Etudiant(models.Model):
    SEXE_CHOICES = [("M", "Masculin"), ("F", "Feminin")]

    utilisateur = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="profil_etudiant",
        limit_choices_to={"role": "etudiant"},
        verbose_name="Utilisateur",
    )
    nom = models.CharField(max_length=100, blank=True, verbose_name="Nom")
    prenom = models.CharField(max_length=100, blank=True, verbose_name="Prenom")
    matricule = models.CharField(max_length=50, unique=True, blank=True, null=True, verbose_name="Matricule etudiant")
    date_naissance = models.DateField(blank=True, null=True, verbose_name="Date de naissance")
    lieu_naissance = models.CharField(max_length=100, blank=True, verbose_name="Lieu de naissance")
    sexe = models.CharField(max_length=1, choices=SEXE_CHOICES, blank=True, verbose_name="Sexe")
    email = models.EmailField(blank=True, verbose_name="Email")
    telephone = models.CharField(max_length=20, blank=True, verbose_name="Telephone")
    adresse = models.TextField(blank=True, verbose_name="Adresse")
    photo = models.ImageField(upload_to="photos_etudiants/", blank=True, verbose_name="Photo")
    date_inscription = models.DateTimeField(auto_now_add=True, verbose_name="Date d'inscription")

    class Meta:
        verbose_name = "Etudiant"
        verbose_name_plural = "Etudiants"
        ordering = ["nom", "prenom"]
        indexes = [models.Index(fields=["matricule"]) ]

    def display_nom(self):
        return self.nom or self.utilisateur.first_name or self.utilisateur.username
    display_nom.short_description = "Nom"

    def display_prenom(self):
        return self.prenom or self.utilisateur.last_name or ""
    display_prenom.short_description = "Prénom"

    def display_email(self):
        return self.email or self.utilisateur.email or ""
    display_email.short_description = "Email"

    def __str__(self):
        return f"{self.nom} {self.prenom}".strip() or self.utilisateur.username


class Session(models.Model):
    TYPE_SESSION_CHOICES = [("SO", "Session ordinaire"), ("SR", "Session de rattrapage")]

    libelle = models.CharField(max_length=50, verbose_name="Libelle")
    type_session = models.CharField(max_length=2, choices=TYPE_SESSION_CHOICES, default="SO", verbose_name="Type de session")
    annee_academique = models.ForeignKey(
        AnneeAcademique,
        on_delete=models.CASCADE,
        related_name="sessions",
        null=False,
        blank=False,
        verbose_name="Annee academique",
    )
    semestre = models.ForeignKey(
        Semestre,
        on_delete=models.CASCADE,
        related_name="sessions",
        null=False,
        blank=False,
        verbose_name="Semestre",
    )
    """ parcours = models.ForeignKey(
    "Parcours",
    on_delete=models.PROTECT,
    related_name="sessions",
    null=True,
    blank=True,
) """

    description = models.TextField(blank=True, verbose_name="Description")

    class Meta:
        verbose_name = "Session"
        verbose_name_plural = "Sessions"
        ordering = ["libelle"]
        unique_together = ("libelle", "annee_academique", "semestre", "type_session")
        indexes = [models.Index(fields=["annee_academique", "semestre", "type_session"])]

    @property
    def id_annee(self):
        return self.annee_academique_id
    def __str__(self):
        return self.libelle

    @property
    def id_semestre(self):
        return self.semestre_id

    def __str__(self):
        return self.libelle


class UE(models.Model):
    code_ue = models.CharField(max_length=20, unique=False, verbose_name="Code UE")
    libelle = models.CharField(max_length=200, verbose_name="Libelle")
    """ credits = models.PositiveIntegerField(default=0, verbose_name="Credits")
    coefficient = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("1.00"), verbose_name="Coefficient") """
    classe = models.ForeignKey(
        Classe,
        on_delete=models.CASCADE,
        related_name="ues",
        null=True,
        blank=True,
        verbose_name="Classe",
    ) 
    semestre = models.ForeignKey(
        Semestre,
        on_delete=models.CASCADE,
        related_name="ues",
        null=False,
        blank=False,
        verbose_name="Semestre",
    )
    """ description = models.TextField(blank=True, verbose_name="Description")
    enseignant = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        related_name="ues_enseignees",
        null=True,
        blank=True,
        verbose_name="Enseignant",
    ) """
    class Meta:
        verbose_name = "Unite d'Enseignement"
        verbose_name_plural = "Unites d'Enseignement"
        ordering = ["code_ue"]
        """ unique_together = ("code_ue", "classe", "semestre") """
        indexes = [models.Index(fields=["classe", "semestre"])]
# Les propriétés sont regroupées ensemble
    """  @property
    def id_classe(self):
        return self.classe_id """

    @property
    def id_semestre(self):
        return self.semestre_id

    def __str__(self):
        return f"{self.code_ue} - {self.libelle}"
""" 
    def __str__(self):
        return f"{self.code_ue} - {self.libelle}" """
class Matiere(models.Model):
    nom = models.CharField(max_length=200, default="", verbose_name="Nom")
    coefficient = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("1.00"), verbose_name="Coefficient")
    credits = models.PositiveIntegerField(default=0, verbose_name="Credits")
    code_matiere = models.CharField(max_length=50, blank=True, verbose_name="Code Matière")
    session = models.ForeignKey(
        Session,
        on_delete=models.SET_NULL,
        related_name="matieres",
        verbose_name="Session",
        null=True,
        blank=True,
    )
    ue = models.ForeignKey(
        UE, on_delete=models.CASCADE, 
        related_name="matieres", 
        verbose_name="UE"
    )
    enseignant = models.ForeignKey(
        Enseignant,
        on_delete=models.SET_NULL,
        related_name="matieres",
        null=True,
        blank=True,
        verbose_name="Enseignant",
    )

    class Meta:
        verbose_name = "Matiere"
        verbose_name_plural = "Matieres"
        ordering = ["ue", "nom"]
        unique_together = ("nom", "ue", "session")
        indexes = [models.Index(fields=["ue", "session"]), models.Index(fields=["enseignant"])]

    
    @property
    def id_ue(self):
        return self.ue_id
    def __str__(self):
        return self.nom

    @property
    def id_session(self):
        return self.session_id
    def __str__(self):
        return self.libelle

    @property
    def id_enseignant(self):
        return self.enseignant_id
    def __str__(self):
        return self.nom

    def save(self, *args, **kwargs):
        if not self.code_matiere and self.ue:
            self.code_matiere = self.ue.code_ue
        super().save(*args, **kwargs)

class Note(models.Model):
    STATUT_CHOICES = [(NOTE_VALIDEE, "Validee"), (NOTE_NON_VALIDEE, "Non validee"), (NOTE_ELIMINATOIRE, "Eliminatoire")]

    etudiant = models.ForeignKey(Etudiant, on_delete=models.CASCADE, related_name="notes", verbose_name="Etudiant")
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE, related_name="notes", verbose_name="Matiere")
    session = models.ForeignKey(
        Session,
        on_delete=models.PROTECT,
        related_name="notes",
        verbose_name="Session",
        null=False,
        blank=False,
    )
    note_devoir = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(20)],
        verbose_name="Note devoir",
    )
    note_examen = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(20)],
        verbose_name="Note examen",
    )
    # Calculated final grade for the subject (set in save())
    note_matiere = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name="Note matiere")
    # Whether the grade has been published
    est_publiee = models.BooleanField(default=False, verbose_name="Est publiee")
    date_saisie = models.DateTimeField(auto_now_add=True, verbose_name="Date de saisie")

    statut = models.CharField(max_length=2, choices=STATUT_CHOICES, default=NOTE_NON_VALIDEE, verbose_name="Statut")
    date_modification = models.DateTimeField(auto_now=True, verbose_name="Date de modification")

    class Meta:
        verbose_name = "Note"
        verbose_name_plural = "Notes"
        unique_together = ("etudiant", "matiere", "session")
        ordering = ["-date_modification"]
        indexes = [
            models.Index(fields=["etudiant", "matiere", "session"]),
            models.Index(fields=["statut"]),
            models.Index(fields=["est_publiee"]),
        ]

    @property
    def ue(self):
        return self.matiere.ue

    @property
    def semestre(self):
        return self.matiere.ue.semestre

    def __str__(self):
        return f"Note de {self.etudiant} en {self.matiere} ({self.session}) : {self.note_matiere or 'Pas encore de note'}"

    def calculer_note_matiere(self):
        if self.note_devoir is None or self.note_examen is None or self.session is None:
            return None

        if self.session.type_session == "SR":
            moyenne = (self.note_devoir * Decimal("1") / Decimal("3")) + (
                self.note_examen * Decimal("2") / Decimal("3")
            )
        else:
            moyenne = (self.note_devoir + self.note_examen) / Decimal("2")

        return moyenne.quantize(Decimal("0.01"))

    def save(self, *args, **kwargs):
        self.note_matiere = self.calculer_note_matiere()
        # Calculer le statut: < 6 = NE, 6-10 = NV, >= 10 = V
        if self.note_matiere is not None:
            if self.note_matiere >= Decimal("10"):
                self.statut = NOTE_VALIDEE
            elif self.note_matiere >= Decimal("6"):
                self.statut = NOTE_NON_VALIDEE
            else:
                self.statut = NOTE_ELIMINATOIRE
        else:
            self.statut = NOTE_NON_VALIDEE
        super().save(*args, **kwargs)
        if self.session is not None:
            sync_academic_results_for_note(self)

    def __str__(self):
        return f"{self.etudiant} - {self.matiere}"
    
""" class Parcours(models.Model):
    NIVEAUX = [
        ("LICENCE", "Licence"),
        ("MASTER", "Master"),
        ("DOCTORAT", "Doctorat"),
    ]

    code = models.CharField(
        max_length=20,
        unique=True
    )

    libelle = models.CharField(
        max_length=255
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    niveau = models.CharField(
        max_length=20,
        choices=NIVEAUX
    )

    responsable = models.ForeignKey(
    "Enseignant",
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name="parcours_diriges"
    )

    class Meta:
        db_table = "parcours"
        ordering = ["libelle"]
        verbose_name = "Parcours"
        verbose_name_plural = "Parcours"

    def __str__(self):
        return f"{self.code} - {self.libelle}"
    
 """
""" class Inscription(models.Model):

    STATUTS = [
        ("INSCRIT", "Inscrit"),
        ("SUSPENDU", "Suspendu"),
        ("ABANDON", "Abandon"),
        ("DIPLOME", "Diplômé"),
    ]

    etudiant = models.ForeignKey(
        "Etudiant",
        on_delete=models.CASCADE,
        related_name="inscriptions"
    )

    classe = models.ForeignKey(
        "Classe",
        on_delete=models.PROTECT,
        related_name="inscriptions"
    )

    parcours = models.ForeignKey(
        "Parcours",
        on_delete=models.PROTECT,
        related_name="inscriptions"
    )

    annee_academique = models.ForeignKey(
        "AnneeAcademique",
        on_delete=models.PROTECT,
        related_name="inscriptions"
    )

    date_inscription = models.DateField(
        auto_now_add=True,
        null=True,
        blank=True,
    )

    statut = models.CharField(
        max_length=20,
        choices=STATUTS,
        default="INSCRIT"
    )

    class Meta:
        db_table = "inscription"
        verbose_name = "Inscription"
        verbose_name_plural = "Inscriptions"
        unique_together = (
            "etudiant",
            "annee_academique",
            "parcours",
        )

    def __str__(self):
        return (
            f"{self.etudiant} - "
            f"{self.parcours} - "
            f"{self.annee_academique}."
        )

 """
def sync_academic_results_for_note(note):
    ue = note.matiere.ue
    session = note.session
    if session is None:
        return
    semestre = ue.semestre or session.semestre
    if semestre is None:
        return

    notes_ue = Note.objects.filter(
        etudiant=note.etudiant,
        matiere__ue=ue,
        session=session,
        note_matiere__isnull=False,
    ).select_related("matiere")
    total_coefficients = sum((n.matiere.coefficient or Decimal("0")) for n in notes_ue)
    if not notes_ue.exists():
        moyenne_ue = None
    elif notes_ue.count() == 1 or total_coefficients == 0:
        moyenne_ue = notes_ue.first().note_matiere
    else:
        total_points = sum(n.note_matiere * n.matiere.coefficient for n in notes_ue)
        moyenne_ue = (total_points / total_coefficients).quantize(Decimal("0.01"))

    # Calculer le statut: < 6 = NE, 6-10 = NV, >= 10 = V
    if moyenne_ue is not None:
        if moyenne_ue >= Decimal("10"):
            statut_ue = NOTE_VALIDEE
        elif moyenne_ue >= Decimal("6"):
            statut_ue = NOTE_NON_VALIDEE
        else:
            statut_ue = NOTE_ELIMINATOIRE
    else:
        statut_ue = NOTE_NON_VALIDEE
    ResultatUE.objects.update_or_create(
        etudiant=note.etudiant,
        ue=ue,
        session=session,
        defaults={"moyenne_ue": moyenne_ue, "statut": statut_ue},
    )
    sync_resultat_semestre(note.etudiant, semestre, session)


def sync_resultat_semestre(etudiant, semestre, session):
    resultats_ue = ResultatUE.objects.filter(
        etudiant=etudiant,
        ue__semestre=semestre,
        session=session,
        moyenne_ue__isnull=False,
    )
    count = resultats_ue.count()
    moyenne_generale = None
    if count:
        moyenne_generale = (sum(r.moyenne_ue for r in resultats_ue) / Decimal(count)).quantize(Decimal("0.01"))

    # Vérifier s'il y a une note éliminatoire (< 6) au niveau de l'UE
    has_eliminatoire = ResultatUE.objects.filter(
        etudiant=etudiant,
        ue__semestre=semestre,
        session=session,
        statut=NOTE_ELIMINATOIRE,
    ).exists()
    if has_eliminatoire:
        statut = SEMESTRE_NON_ELIMINATOIRE
    elif moyenne_generale is not None and moyenne_generale >= Decimal("10"):
        statut = NOTE_VALIDEE
    else:
        statut = NOTE_NON_VALIDEE

    ResultatSemestre.objects.update_or_create(
        etudiant=etudiant,
        semestre=semestre,
        session=session,
        defaults={"moyenne_generale": moyenne_generale, "statut": statut},
    )


class ResultatUE(models.Model):
    STATUT_CHOICES = [(NOTE_VALIDEE, "Validee"), (NOTE_NON_VALIDEE, "Non validee"), (NOTE_ELIMINATOIRE, "Eliminatoire")]

    etudiant = models.ForeignKey(Etudiant, on_delete=models.CASCADE, related_name="resultats_ue")
    ue = models.ForeignKey(UE, on_delete=models.CASCADE, related_name="resultats_ue")
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name="resultats_ue")
    moyenne_ue = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(20)])
    statut = models.CharField(max_length=2, choices=STATUT_CHOICES, default=NOTE_NON_VALIDEE)
    date_calcul = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Resultat UE"
        verbose_name_plural = "Resultats UE"
        unique_together = ("etudiant", "ue", "session")
        ordering = ["-date_calcul"]
        indexes = [models.Index(fields=["etudiant", "ue", "session"])]

    @property
    def semestre(self):
        return self.ue.semestre

    def __str__(self):
        return f"{self.etudiant} - {self.ue} ({self.session})"


class ResultatSemestre(models.Model):
    STATUT_CHOICES = [
        (NOTE_VALIDEE, "Valide"),
        (NOTE_NON_VALIDEE, "Non valide"),
        (SEMESTRE_NON_ELIMINATOIRE, "Note eliminatoire"),
    ]

    etudiant = models.ForeignKey(Etudiant, on_delete=models.CASCADE, related_name="resultats_semestres")
    semestre = models.ForeignKey(Semestre, on_delete=models.CASCADE, related_name="resultats_semestres")
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name="resultats_semestres")
    moyenne_generale = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(20)])
    statut = models.CharField(max_length=2, choices=STATUT_CHOICES, default=NOTE_NON_VALIDEE)
    date_calcul = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Resultat semestre"
        verbose_name_plural = "Resultats semestre"
        unique_together = ("etudiant", "semestre", "session")
        ordering = ["-date_calcul"]
        indexes = [models.Index(fields=["etudiant", "semestre", "session"])]

    def __str__(self):
        return f"{self.etudiant} - {self.semestre} ({self.session})"


class Alert(models.Model):
    TYPE_CHOICES = [
        ("NOTE_MODIFIEE", "Note modifiee"),
        ("NOTE_CREEE", "Note creee"),
        ("NOTE_SUPPRIMEE", "Note supprimee"),
    ]

    type_modification = models.CharField(max_length=50, choices=TYPE_CHOICES, verbose_name="Type de modification")
    note = models.ForeignKey(Note, on_delete=models.CASCADE, related_name="alertes", null=True, blank=True, verbose_name="Note")
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE, related_name="alertes", null=True, blank=True, verbose_name="Matiere")
    modifie_par = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name="alertes_crees", verbose_name="Modifie par")
    description = models.TextField(verbose_name="Description")
    date_modification = models.DateTimeField(auto_now_add=True, verbose_name="Date")
    lu = models.BooleanField(default=False, verbose_name="Alerte lue")

    class Meta:
        verbose_name = "Alerte"
        verbose_name_plural = "Alertes"
        ordering = ["-date_modification"]

    def __str__(self):
        cible = self.note or self.matiere
        return f"{self.get_type_modification_display()} - {cible}"


class AdminAuditLog(models.Model):
    ACTION_CHOICES = [
        ("CREATE", "Création"),
        ("UPDATE", "Modification"),
        ("DELETE", "Suppression"),
        ("SET_PASSWORD", "Réinitialisation mot de passe"),
        ("IMPERSONATE", "Impersonation"),
    ]

    actor = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name="admin_audit_actions")
    target_user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name="admin_audit_targets")
    action = models.CharField(max_length=32, choices=ACTION_CHOICES)
    resource_type = models.CharField(max_length=64)
    resource_id = models.CharField(max_length=64, blank=True)
    before_data = models.JSONField(default=dict, blank=True)
    after_data = models.JSONField(default=dict, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Journal d'audit admin"
        verbose_name_plural = "Journaux d'audit admin"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["actor", "created_at"]),
            models.Index(fields=["target_user", "created_at"]),
            models.Index(fields=["resource_type", "created_at"]),
            models.Index(fields=["action", "created_at"]),
        ]

    def __str__(self):
        actor = self.actor.username if self.actor else "system"
        return f"{self.action} {self.resource_type}#{self.resource_id} par {actor}"


def generer_code_inscription():
    import random
    import string

    return "".join(random.choices(string.ascii_uppercase + string.digits, k=8))



class CodeInscription(models.Model):
    code = models.CharField(max_length=8, unique=True, default=generer_code_inscription, verbose_name="Code")
    role = models.CharField(max_length=20, choices=CustomUser.ROLE_CHOICES, verbose_name="Role attribue")
    actif = models.BooleanField(default=True, verbose_name="Actif")
    date_creation = models.DateTimeField(auto_now_add=True, verbose_name="Date de creation")
    date_expiration = models.DateTimeField(null=True, blank=True, verbose_name="Date d'expiration")
    utilise_par = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="codes_utilises",
        verbose_name="Utilise par",
    )
    date_utilisation = models.DateTimeField(null=True, blank=True, verbose_name="Date d'utilisation")

    class Meta:
        verbose_name = "Code d'inscription"
        verbose_name_plural = "Codes d'inscription"
        ordering = ["-date_creation"]

    def __str__(self):
        return f"{self.code} ({self.get_role_display()})"
