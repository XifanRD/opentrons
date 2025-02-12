import * as React from 'react'
import {
  getModuleType,
  HEATERSHAKER_MODULE_TYPE,
  MAGNETIC_BLOCK_TYPE,
  ModuleDefinition,
  OT2_STANDARD_DECKID,
  TEMPERATURE_MODULE_TYPE,
  THERMOCYCLER_MODULE_TYPE,
} from '@opentrons/shared-data'
import {
  C_DARK_GRAY,
  C_MED_LIGHT_GRAY,
  SPACING_1,
  JUSTIFY_CENTER,
  DISPLAY_FLEX,
  FONT_WEIGHT_SEMIBOLD,
  DIRECTION_COLUMN,
  ALIGN_CENTER,
} from '../../styles'
import { RobotCoordsForeignObject } from '../Deck'
import { Thermocycler } from './Thermocycler'
import { ModuleFromDef } from './ModuleFromDef'
import { HeaterShaker } from './HeaterShaker'
import { Temperature } from './Temperature'

export * from './Thermocycler'
export * from './ModuleFromDef'

const LABWARE_OFFSET_DISPLAY_THRESHOLD = 2

// multiply two matrices together (dot product)
function multiplyMatrices(a: number[][], b: number[][]): number[][] {
  const transposedB = b[0].map((_val, index) => b.map(row => row[index]))
  return a.map(rowA =>
    transposedB.map(rowB =>
      rowA.reduce((acc, valA, colIndexA) => acc + valA * rowB[colIndexA], 0)
    )
  )
}

interface Props {
  x: number
  y: number
  def: ModuleDefinition
  orientation?: 'left' | 'right'
  innerProps?:
    | React.ComponentProps<typeof Thermocycler>
    | React.ComponentProps<typeof ModuleFromDef>
    | React.ComponentProps<typeof HeaterShaker>
    | React.ComponentProps<typeof Temperature>
    | {}
  statusInfo?: React.ReactNode // contents of small status rectangle, not displayed if absent
  children?: React.ReactNode // contents to be rendered on top of the labware mating surface of the module
  targetSlotId?: string
  targetDeckId?: string
}

const statusInfoWrapperProps = {
  display: DISPLAY_FLEX,
  alignItems: ALIGN_CENTER,
}
const statusInfoFlexProps = {
  flexDirection: DIRECTION_COLUMN,
  justifyContent: JUSTIFY_CENTER,
  backgroundColor: C_MED_LIGHT_GRAY,
  padding: SPACING_1,
  fontSize: '0.5rem', // NOTE: this text is rendered into an SVG foreignObject, so sizing is non-standard
  fontWeight: FONT_WEIGHT_SEMIBOLD,
  paddingBottom: SPACING_1,
}

export const Module = (props: Props): JSX.Element => {
  const {
    def,
    x,
    y,
    orientation = 'left',
    innerProps = {},
    statusInfo,
    children,
    targetSlotId,
    targetDeckId = OT2_STANDARD_DECKID,
  } = props
  const moduleType = getModuleType(def.model)

  const { x: labwareOffsetX, y: labwareOffsetY } = def.labwareOffset
  const {
    x: translateX,
    y: translateY,
    z: translateZ,
  } = def.cornerOffsetFromSlot
  const {
    xDimension,
    yDimension,
    footprintXDimension,
    footprintYDimension,
    labwareInterfaceXDimension,
    labwareInterfaceYDimension,
  } = def.dimensions

  // apply translation to position module in viewport
  const positionTransform = `translate(${x}, ${y})`

  // apply translation to compensate for the offset of the overall module's
  // left-bottom-front corner, from the footprint's left-bottom-front corner (slot interface)
  let offsetTransform = `translate(${translateX}, ${translateY})`

  let nestedLabwareOffsetX = labwareOffsetX
  let nestedLabwareOffsetY = labwareOffsetY

  // additional transforms to apply to vectors in certain deck/slot combinations
  const transformsForDeckBySlot = def?.slotTransforms?.[targetDeckId]
  const slotTransformsForDeckSlot =
    targetSlotId != null &&
    transformsForDeckBySlot != null &&
    targetSlotId in transformsForDeckBySlot
      ? transformsForDeckBySlot[targetSlotId]
      : null
  const deckSpecificTransforms = slotTransformsForDeckSlot ?? {}
  if (deckSpecificTransforms?.cornerOffsetFromSlot != null) {
    const [
      [slotTranslateX],
      [slotTranslateY],
    ] = multiplyMatrices(deckSpecificTransforms.cornerOffsetFromSlot, [
      [translateX],
      [translateY],
      [translateZ],
      [1],
    ])
    offsetTransform = `translate(${slotTranslateX}, ${slotTranslateY})`
  }
  if (deckSpecificTransforms?.labwareOffset != null) {
    const [
      [slotLabwareOffsetX],
      [slotLabwareOffsetY],
    ] = multiplyMatrices(deckSpecificTransforms.labwareOffset, [
      [labwareOffsetX],
      [labwareOffsetY],
      [1],
      [1],
    ])
    nestedLabwareOffsetX = slotLabwareOffsetX
    nestedLabwareOffsetY = slotLabwareOffsetY
  }

  // find coordinates of center of footprint, fallback to overall center if not defined
  const rotationCenterX = (footprintXDimension ?? xDimension) / 2
  const rotationCenterY = (footprintYDimension ?? yDimension) / 2

  const orientationTransform =
    orientation === 'left'
      ? 'rotate(0, 0, 0)'
      : `rotate(180, ${rotationCenterX}, ${rotationCenterY})`

  // labwareOffset values are more accurate than our SVG renderings, so ignore any deviations under a certain threshold
  const clampedLabwareOffsetX =
    Math.abs(nestedLabwareOffsetX) > LABWARE_OFFSET_DISPLAY_THRESHOLD
      ? nestedLabwareOffsetX
      : 0
  const clampedLabwareOffsetY =
    Math.abs(nestedLabwareOffsetY) > LABWARE_OFFSET_DISPLAY_THRESHOLD
      ? nestedLabwareOffsetY
      : 0
  // transform to be applied to children which render within the labware interfacing surface of the module
  const childrenTransform = `translate(${clampedLabwareOffsetX}, ${clampedLabwareOffsetY})`

  const renderStatusInfo = (): JSX.Element | null => {
    if (statusInfo == null) return null
    const statusWidth = (labwareInterfaceXDimension ?? xDimension) / 2
    return (
      <RobotCoordsForeignObject
        x={
          orientation === 'left'
            ? labwareOffsetX - statusWidth
            : labwareOffsetX + (labwareInterfaceXDimension ?? xDimension)
        }
        y={labwareOffsetY}
        height={labwareInterfaceYDimension ?? yDimension}
        width={statusWidth}
        foreignObjectProps={statusInfoWrapperProps}
        flexProps={statusInfoFlexProps}
      >
        {statusInfo}
      </RobotCoordsForeignObject>
    )
  }

  const magneticBlockLayerBlockList = ['Module_Title', 'Well_Labels', 'Wells']

  let moduleViz: JSX.Element = (
    <ModuleFromDef
      layerBlocklist={
        moduleType === MAGNETIC_BLOCK_TYPE
          ? magneticBlockLayerBlockList
          : undefined
      }
      {...(innerProps as React.ComponentProps<typeof ModuleFromDef>)}
      def={def}
    />
  )
  if (moduleType === THERMOCYCLER_MODULE_TYPE) {
    moduleViz = (
      <Thermocycler
        {...(innerProps as React.ComponentProps<typeof Thermocycler>)}
      />
    )
  } else if (moduleType === HEATERSHAKER_MODULE_TYPE) {
    moduleViz = (
      <HeaterShaker
        {...(innerProps as React.ComponentProps<typeof HeaterShaker>)}
      />
    )
  } else if (moduleType === TEMPERATURE_MODULE_TYPE) {
    moduleViz = (
      <Temperature
        {...(innerProps as React.ComponentProps<typeof Temperature>)}
      />
    )
  }
  return (
    <g transform={positionTransform} data-test={`Module_${moduleType}`}>
      <g transform={orientationTransform}>
        <g transform={offsetTransform} style={{ fill: C_DARK_GRAY }}>
          {moduleViz}
        </g>
      </g>
      {renderStatusInfo()}
      {children != null ? (
        <g transform={childrenTransform}>{children}</g>
      ) : null}
    </g>
  )
}
