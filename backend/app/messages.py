"""
Messages d'erreur standardises en francais pour l'API.
Centralise tous les messages pour faciliter la maintenance et la coherence.
"""


class ErrorMessages:
    """Messages d'erreur generaux."""
    INTERNAL_ERROR = "Une erreur interne s'est produite"
    VALIDATION_ERROR = "Donnees invalides"
    NOT_FOUND = "Ressource non trouvee"
    FORBIDDEN = "Acces refuse"
    UNAUTHORIZED = "Authentification requise"
    BAD_REQUEST = "Requete invalide"


class AuthMessages:
    """Messages d'authentification."""
    INVALID_CREDENTIALS = "Email ou mot de passe incorrect"
    TOKEN_EXPIRED = "Votre session a expire, veuillez vous reconnecter"
    TOKEN_INVALID = "Token d'authentification invalide"
    USER_NOT_FOUND = "Utilisateur non trouve"
    EMAIL_ALREADY_EXISTS = "Cette adresse email est deja utilisee"
    PASSWORD_TOO_WEAK = "Le mot de passe doit contenir au moins 6 caracteres"
    ACCOUNT_INACTIVE = "Ce compte est desactive"
    NOT_AUTHENTICATED = "Vous devez etre connecte pour acceder a cette ressource"


class UserMessages:
    """Messages lies aux utilisateurs."""
    NOT_TEACHER = "Seuls les enseignants peuvent effectuer cette action"
    NOT_STUDENT = "Seuls les etudiants peuvent effectuer cette action"
    PROFILE_NOT_FOUND = "Profil utilisateur non trouve"
    PROFILE_UPDATED = "Profil mis a jour avec succes"
    PASSWORD_CHANGED = "Mot de passe modifie avec succes"
    WRONG_PASSWORD = "Mot de passe actuel incorrect"


class ProjectMessages:
    """Messages lies aux projets."""
    NOT_FOUND = "Projet non trouve"
    CREATED = "Projet cree avec succes"
    UPDATED = "Projet mis a jour avec succes"
    DELETED = "Projet supprime avec succes"
    NOT_OWNER = "Vous n'etes pas le proprietaire de ce projet"
    ALREADY_EXISTS = "Un projet avec ce titre existe deja"
    CANNOT_DELETE = "Ce projet ne peut pas etre supprime"
    PREFERENCES_OPEN = "Les preferences sont maintenant ouvertes"
    PREFERENCES_CLOSED = "Les preferences sont maintenant fermees"
    MAX_STUDENTS_REACHED = "Le nombre maximum d'etudiants est atteint"
    INVALID_PROJECT_TYPE = "Type de projet invalide"
    ALREADY_INACTIVE = "Ce projet est deja inactif"


class StudentMessages:
    """Messages lies aux etudiants."""
    NOT_FOUND = "Etudiant non trouve"
    ADDED_TO_PROJECT = "Etudiant ajoute au projet avec succes"
    REMOVED_FROM_PROJECT = "Etudiant retire du projet"
    ALREADY_IN_PROJECT = "L'etudiant fait deja partie de ce projet"
    NOT_IN_PROJECT = "L'etudiant ne fait pas partie de ce projet"
    CSV_IMPORT_SUCCESS = "Etudiants importes avec succes"
    CSV_IMPORT_ERROR = "Erreur lors de l'import CSV"
    INVALID_CSV_FORMAT = "Format CSV invalide"
    EMAIL_SENT = "Email d'invitation envoye"
    DUPLICATE_EMAIL = "Cette adresse email est deja utilisee"


class PreferenceMessages:
    """Messages lies aux preferences."""
    NOT_FOUND = "Preference non trouvee"
    SAVED = "Preferences enregistrees avec succes"
    UPDATED = "Preferences mises a jour"
    PREFERENCES_CLOSED = "Les preferences ne sont plus ouvertes pour ce projet"
    DEADLINE_PASSED = "La date limite pour soumettre vos preferences est depassee"
    ALREADY_SUBMITTED = "Vous avez deja soumis vos preferences"
    CANNOT_MODIFY = "Vous ne pouvez plus modifier vos preferences"


class AssignmentMessages:
    """Messages lies aux affectations."""
    NOT_FOUND = "Affectation non trouvee"
    GENERATED = "Affectations generees avec succes"
    ALREADY_EXISTS = "Des affectations existent deja pour ce projet"
    CLEARED = "Affectations supprimees"
    NO_PREFERENCES = "Aucune preference n'a ete soumise"
    ALGORITHM_ERROR = "Erreur lors de l'execution de l'algorithme"
    PUBLISHED = "Affectations publiees avec succes"
    NOT_PUBLISHED = "Les affectations n'ont pas encore ete publiees"


class GroupMessages:
    """Messages lies aux groupes."""
    CREATED = "Groupe cree avec succes"
    UPDATED = "Groupe mis a jour"
    DELETED = "Groupe supprime"
    MEMBER_ADDED = "Membre ajoute au groupe"
    MEMBER_REMOVED = "Membre retire du groupe"
    GROUP_FULL = "Le groupe est complet"
    INVALID_SIZE = "Taille de groupe invalide"


class DestinationMessages:
    """Messages lies aux destinations (programme d'echange)."""
    NOT_FOUND = "Destination non trouvee"
    CREATED = "Destination creee avec succes"
    UPDATED = "Destination mise a jour"
    DELETED = "Destination supprimee"
    NO_SPOTS_AVAILABLE = "Aucune place disponible pour cette destination"


class FormMessages:
    """Messages lies aux formulaires."""
    NOT_FOUND = "Formulaire non trouve"
    RESPONSE_SAVED = "Reponse enregistree avec succes"
    ALREADY_ANSWERED = "Vous avez deja repondu a ce formulaire"
    QUESTION_REQUIRED = "Cette question est obligatoire"


def format_message(template: str, **kwargs) -> str:
    """
    Formate un message avec des parametres.
    
    Usage:
        message = format_message("Etudiant {name} ajoute au projet {project}", 
                                 name="Jean Dupont", project="Projet A")
    """
    try:
        return template.format(**kwargs)
    except KeyError:
        return template


# Messages de succes communs
class SuccessMessages:
    """Messages de succes."""
    CREATED = "Element cree avec succes"
    UPDATED = "Modifications enregistrees"
    DELETED = "Element supprime avec succes"
    OPERATION_SUCCESS = "Operation effectuee avec succes"
