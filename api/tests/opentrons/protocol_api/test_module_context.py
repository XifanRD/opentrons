"""Tests for Protocol API module contexts."""
from typing import cast

import pytest
from decoy import Decoy

from opentrons_shared_data.labware.dev_types import LabwareDefinition as LabwareDefDict

from opentrons.hardware_control.modules.types import ModuleType, HeaterShakerModuleModel
from opentrons.broker import Broker
from opentrons.protocols.api_support.types import APIVersion
from opentrons.protocol_api import MAX_SUPPORTED_VERSION, ModuleContext, Labware
from opentrons.protocol_api.core.common import LabwareCore, ModuleCore, ProtocolCore
from opentrons.protocol_api.core.labware import LabwareLoadParams
from opentrons.protocol_api.core.core_map import LoadedCoreMap


@pytest.fixture
def mock_core(decoy: Decoy) -> ModuleCore:
    """Get a mock module implementation core."""
    return decoy.mock(cls=ModuleCore)


@pytest.fixture
def mock_core_map(decoy: Decoy) -> LoadedCoreMap:
    """Get a mock core map."""
    return decoy.mock(cls=LoadedCoreMap)


@pytest.fixture
def mock_protocol_core(decoy: Decoy) -> ProtocolCore:
    """Get a mock protocol implementation core."""
    return decoy.mock(cls=ProtocolCore)


@pytest.fixture
def mock_broker(decoy: Decoy) -> Broker:
    """Get a mock command message broker."""
    return decoy.mock(cls=Broker)


@pytest.fixture
def api_version() -> APIVersion:
    """Set the API version for the test."""
    return MAX_SUPPORTED_VERSION


@pytest.fixture
def subject(
    mock_core: ModuleCore,
    mock_core_map: LoadedCoreMap,
    mock_protocol_core: ProtocolCore,
    mock_broker: Broker,
    api_version: APIVersion,
) -> ModuleContext:
    """Get a generic module context with its dependencies mocked out."""
    return ModuleContext(
        core=mock_core,
        core_map=mock_core_map,
        protocol_core=mock_protocol_core,
        broker=mock_broker,
        api_version=api_version,
    )


def test_get_labware(
    decoy: Decoy,
    mock_core: ModuleCore,
    mock_protocol_core: ProtocolCore,
    mock_core_map: LoadedCoreMap,
    subject: ModuleContext,
) -> None:
    """It should return the labware from the protocol core's loaded equipment object."""
    mock_labware_core = decoy.mock(cls=LabwareCore)
    mock_labware = decoy.mock(cls=Labware)

    decoy.when(mock_protocol_core.get_labware_on_module(mock_core)).then_return(
        mock_labware_core
    )
    decoy.when(mock_core_map.get(mock_labware_core)).then_return(mock_labware)

    assert subject.labware is mock_labware


@pytest.mark.parametrize("api_version", [APIVersion(2, 1234)])
def test_load_labware(
    decoy: Decoy,
    mock_protocol_core: ProtocolCore,
    mock_core_map: LoadedCoreMap,
    mock_core: ModuleCore,
    api_version: APIVersion,
    subject: ModuleContext,
) -> None:
    """It should load labware by load parameters."""
    mock_labware_core = decoy.mock(cls=LabwareCore)

    decoy.when(
        mock_protocol_core.load_labware(
            load_name="infinite tip rack",
            label="it doesn't run out",
            namespace="ideal",
            version=101,
            location=mock_core,
        )
    ).then_return(mock_labware_core)

    decoy.when(mock_labware_core.get_name()).then_return("Full Name")
    decoy.when(mock_labware_core.get_well_columns()).then_return([])

    result = subject.load_labware(
        name="infinite tip rack",
        label="it doesn't run out",
        namespace="ideal",
        version=101,
    )

    assert isinstance(result, Labware)
    assert result.name == "Full Name"
    assert result.api_version == api_version
    decoy.verify(mock_core_map.add(mock_labware_core, result), times=1)


@pytest.mark.parametrize("api_version", [APIVersion(2, 1234)])
def test_load_labware_from_definition(
    decoy: Decoy,
    mock_core: ModuleCore,
    mock_protocol_core: ProtocolCore,
    mock_core_map: LoadedCoreMap,
    api_version: APIVersion,
    subject: ModuleContext,
) -> None:
    """It should be able to load a labware from a definition dictionary."""
    mock_labware_core = decoy.mock(cls=LabwareCore)

    labware_definition_dict = cast(LabwareDefDict, {"labwareDef": True})
    labware_load_params = LabwareLoadParams("you", "are", 1337)

    decoy.when(
        mock_protocol_core.add_labware_definition(labware_definition_dict)
    ).then_return(labware_load_params)

    decoy.when(mock_labware_core.get_name()).then_return("Full Name")
    decoy.when(mock_labware_core.get_well_columns()).then_return([])

    decoy.when(
        mock_protocol_core.load_labware(
            namespace="you",
            load_name="are",
            version=1337,
            label="Some Display Name",
            location=mock_core,
        )
    ).then_return(mock_labware_core)

    result = subject.load_labware_from_definition(
        definition=labware_definition_dict,
        label="Some Display Name",
    )

    assert isinstance(result, Labware)
    assert result.name == "Full Name"
    assert result.api_version == api_version
    decoy.verify(mock_core_map.add(mock_labware_core, result), times=1)


def test_parent(decoy: Decoy, mock_core: ModuleCore, subject: ModuleContext) -> None:
    """Should get the parent slot name."""
    decoy.when(mock_core.get_deck_slot_id()).then_return("bar")
    assert subject.parent == "bar"


def test_module_model(
    decoy: Decoy,
    mock_core: ModuleCore,
    subject: ModuleContext,
) -> None:
    """It should get module's model."""
    decoy.when(mock_core.get_model()).then_return(
        HeaterShakerModuleModel("heaterShakerModuleV1")
    )
    result = subject.model
    assert result == "heaterShakerModuleV1"


def test_module_type(
    decoy: Decoy,
    mock_core: ModuleCore,
    subject: ModuleContext,
) -> None:
    """It should get module's type."""
    decoy.when(mock_core.MODULE_TYPE).then_return(ModuleType("heaterShakerModuleType"))
    result = subject.type
    assert result == "heaterShakerModuleType"
