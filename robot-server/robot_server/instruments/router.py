"""Instruments routes."""
from typing import Optional, Dict, Iterator, TYPE_CHECKING, cast

from fastapi import APIRouter, status, Depends

from opentrons.hardware_control.instruments.ot3.instrument_calibration import (
    PipetteOffsetByPipetteMount,
)
from opentrons.protocol_engine.errors import HardwareNotSupportedError

from robot_server.hardware import get_hardware
from robot_server.service.json_api import (
    SimpleMultiBody,
    PydanticResponse,
    MultiBodyMeta,
)

from opentrons.types import Mount, MountType
from opentrons.protocol_engine.types import Vec3f
from opentrons.protocol_engine.resources.ot3_validation import ensure_ot3_hardware
from opentrons.hardware_control import (
    HardwareControlAPI,
)
from opentrons.hardware_control.types import (
    OT3Mount,
    SubSystem as HWSubSystem,
)
from opentrons.hardware_control.dev_types import PipetteDict, GripperDict
from opentrons_shared_data.gripper.gripper_definition import GripperModelStr

from .instrument_models import (
    PipetteData,
    Pipette,
    InstrumentCalibrationData,
    GripperData,
    Gripper,
    AttachedItem,
    BadGripper,
    BadPipette,
)

from robot_server.subsystems.models import SubSystem
from robot_server.subsystems.router import status_route_for, update_route_for

if TYPE_CHECKING:
    from opentrons.hardware_control.ot3api import OT3API

instruments_router = APIRouter()


def _pipette_dict_to_pipette_res(
    pipette_dict: PipetteDict,
    pipette_offset: Optional[PipetteOffsetByPipetteMount],
    mount: Mount,
) -> Pipette:
    """Convert PipetteDict to Pipette response model."""
    if pipette_dict:
        calibration_data = pipette_offset
        return Pipette.construct(
            ok=True,
            mount=MountType.from_hw_mount(mount).value,
            instrumentName=pipette_dict["name"],
            instrumentModel=pipette_dict["model"],
            serialNumber=pipette_dict["pipette_id"],
            subsystem=SubSystem.from_hw(HWSubSystem.of_mount(mount)),
            data=PipetteData(
                channels=pipette_dict["channels"],
                min_volume=pipette_dict["min_volume"],
                max_volume=pipette_dict["max_volume"],
                calibratedOffset=InstrumentCalibrationData.construct(
                    offset=Vec3f(
                        x=calibration_data.offset.x,
                        y=calibration_data.offset.y,
                        z=calibration_data.offset.z,
                    ),
                    source=calibration_data.source,
                    last_modified=calibration_data.last_modified,
                )
                if calibration_data
                else None,
            ),
        )


def _gripper_dict_to_gripper_res(gripper_dict: GripperDict) -> Gripper:
    """Convert GripperDict to Gripper response model."""
    calibration_data = gripper_dict["calibration_offset"]
    return Gripper.construct(
        ok=True,
        mount=MountType.EXTENSION.value,
        instrumentModel=GripperModelStr(str(gripper_dict["model"])),
        serialNumber=gripper_dict["gripper_id"],
        subsystem=SubSystem.from_hw(HWSubSystem.of_mount(OT3Mount.GRIPPER)),
        data=GripperData(
            jawState=gripper_dict["state"].name.lower(),
            calibratedOffset=InstrumentCalibrationData.construct(
                offset=Vec3f(
                    x=calibration_data.offset.x,
                    y=calibration_data.offset.y,
                    z=calibration_data.offset.z,
                ),
                source=calibration_data.source,
                last_modified=calibration_data.last_modified,
            ),
        ),
    )


def _bad_gripper_response() -> BadGripper:
    return BadGripper(
        instrumentType="gripper",
        subsystem=SubSystem.gripper,
        status=status_route_for(SubSystem.gripper),
        update=update_route_for(SubSystem.gripper),
        ok=False,
    )


def _bad_pipette_response(subsystem: SubSystem) -> BadPipette:
    return BadPipette(
        instrumentType="pipette",
        subsystem=subsystem,
        status=status_route_for(subsystem),
        update=update_route_for(subsystem),
        ok=False,
    )


def _get_gripper_instrument_data(
    hardware: "OT3API",
    attached_gripper: Optional[GripperDict],
) -> Optional[AttachedItem]:
    subsys = HWSubSystem.of_mount(OT3Mount.GRIPPER)
    status = hardware.attached_subsystems.get(subsys)
    if status and (status.fw_update_needed or not status.ok):
        return _bad_gripper_response()
    if attached_gripper:
        return _gripper_dict_to_gripper_res(gripper_dict=attached_gripper)
    return None


def _get_pipette_instrument_data(
    hardware: "OT3API",
    attached_pipettes: Dict[Mount, PipetteDict],
    mount: Mount,
) -> Optional[AttachedItem]:
    pipette_dict = attached_pipettes.get(mount)
    subsys = HWSubSystem.of_mount(mount)
    status = hardware.attached_subsystems.get(subsys)
    if status and (status.fw_update_needed or not status.ok):
        return _bad_pipette_response(SubSystem.from_hw(subsys))
    if pipette_dict:
        offset = cast(
            Optional[PipetteOffsetByPipetteMount],
            hardware.get_instrument_offset(OT3Mount.from_mount(mount)),
        )
        return _pipette_dict_to_pipette_res(
            pipette_dict=pipette_dict, mount=mount, pipette_offset=offset
        )
    return None


def _get_instrument_data(
    hardware: "OT3API",
) -> Iterator[AttachedItem]:
    attached_pipettes = hardware.attached_pipettes
    attached_gripper = hardware.attached_gripper
    for info in (
        _get_pipette_instrument_data(hardware, attached_pipettes, Mount.LEFT),
        _get_pipette_instrument_data(hardware, attached_pipettes, Mount.RIGHT),
        _get_gripper_instrument_data(hardware, attached_gripper),
    ):
        if info:
            yield info


async def _get_attached_instruments_ot3(
    hardware: "OT3API",
) -> PydanticResponse[SimpleMultiBody[AttachedItem]]:
    # OT3
    await hardware.cache_instruments()
    response_data = list(_get_instrument_data(hardware))
    return await PydanticResponse.create(
        content=SimpleMultiBody.construct(
            data=response_data,
            meta=MultiBodyMeta(cursor=0, totalLength=len(response_data)),
        ),
        status_code=status.HTTP_200_OK,
    )


async def _get_attached_instruments_ot2(
    hardware: HardwareControlAPI,
) -> PydanticResponse[SimpleMultiBody[AttachedItem]]:
    pipettes = hardware.attached_instruments
    response_data = [
        _pipette_dict_to_pipette_res(
            pipette_dict=pipette_dict,
            mount=mount,
            pipette_offset=None,
        )
        for mount, pipette_dict in pipettes.items()
        if pipette_dict
    ]
    return await PydanticResponse.create(
        content=SimpleMultiBody.construct(
            data=response_data,
            meta=MultiBodyMeta(cursor=0, totalLength=len(response_data)),
        ),
        status_code=status.HTTP_200_OK,
    )


@instruments_router.get(
    path="/instruments",
    summary="Get attached instruments.",
    description="Get a list of all instruments (pipettes & gripper) currently attached"
    " to the robot.",
    responses={status.HTTP_200_OK: {"model": SimpleMultiBody[AttachedItem]}},
)
async def get_attached_instruments(
    hardware: HardwareControlAPI = Depends(get_hardware),
) -> PydanticResponse[SimpleMultiBody[AttachedItem]]:
    """Get a list of all attached instruments."""
    try:
        # TODO (spp, 2023-01-06): revise according to
        #  https://opentrons.atlassian.net/browse/RET-1295
        ot3_hardware = ensure_ot3_hardware(hardware_api=hardware)
        return await _get_attached_instruments_ot3(ot3_hardware)
    except HardwareNotSupportedError:
        # OT2
        pass
    return await _get_attached_instruments_ot2(hardware)
