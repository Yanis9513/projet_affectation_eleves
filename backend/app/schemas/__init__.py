from .destination_schemas import (
    DestinationBase,
    DestinationCreate,
    DestinationUpdate,
    DestinationResponse,
    DestinationPreferenceCreate,
    DestinationPreferenceResponse,
    DestinationPreferencesSubmit
)

from .project_schemas import (
    ProjectBase,
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectWithStudents,
    StudentInProject,
    StudentInProjectCreate,
    StudentUploadRequest,
    StudentUploadResponse,
    ProjectTypeEnum
)

from .preference_schemas import (
    PreferenceCreate,
    PreferenceResponse,
    MessageResponse
)

__all__ = [
    # Destination schemas
    "DestinationBase",
    "DestinationCreate",
    "DestinationUpdate",
    "DestinationResponse",
    "DestinationPreferenceCreate",
    "DestinationPreferenceResponse",
    "DestinationPreferencesSubmit",
    # Project schemas
    "ProjectBase",
    "ProjectCreate",
    "ProjectUpdate",
    "ProjectResponse",
    "ProjectWithStudents",
    "StudentInProject",
    "StudentInProjectCreate",
    "StudentUploadRequest",
    "StudentUploadResponse",
    "ProjectTypeEnum",
    # Preference schemas
    "PreferenceCreate",
    "PreferenceResponse",
    "MessageResponse"
]
