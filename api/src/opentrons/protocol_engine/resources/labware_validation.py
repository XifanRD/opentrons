"""Validation file for labware role and location checking functions."""

from opentrons_shared_data.labware.labware_definition import LabwareRole
from opentrons.protocols.models import LabwareDefinition


def validate_definition_is_labware(definition: LabwareDefinition) -> bool:
    """Validate that one of the definition's allowed roles is `labware`.

    An empty `allowedRoles` is equivalent to `labware` being the only allowed role.
    """
    return not definition.allowedRoles or LabwareRole.labware in definition.allowedRoles


def validate_definition_is_adapter(definition: LabwareDefinition) -> bool:
    """Validate that one of the definition's allowed roles is `adapter`."""
    return LabwareRole.adapter in definition.allowedRoles


def validate_labware_can_be_stacked(
    top_labware_definition: LabwareDefinition, below_labware_load_name: str
) -> bool:
    """Validate that the labware being loaded onto is in the above labware's stackingOffsetWithLabware definition."""
    return below_labware_load_name in top_labware_definition.stackingOffsetWithLabware
