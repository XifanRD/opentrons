import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  DIRECTION_COLUMN,
  Flex,
  BORDERS,
  COLORS,
  JUSTIFY_SPACE_BETWEEN,
  SPACING,
  TYPOGRAPHY,
  JUSTIFY_CENTER,
} from '@opentrons/components'
import {
  SINGLE_MOUNT_PIPETTES,
  NINETY_SIX_CHANNEL,
} from '@opentrons/shared-data'
import { PipetteWizardFlows } from '../../organisms/PipetteWizardFlows'
import { GripperWizardFlows } from '../../organisms/GripperWizardFlows'
import { StyledText } from '../../atoms/text'
import { MediumButton } from '../../atoms/buttons/OnDeviceDisplay'
import { FLOWS } from '../PipetteWizardFlows/constants'
import { GRIPPER_FLOW_TYPES } from '../GripperWizardFlows/constants'

import type { InstrumentData } from '@opentrons/api-client'
import type { PipetteMount } from '@opentrons/shared-data'
import type { StyleProps } from '@opentrons/components'

interface InstrumentInfoProps {
  instrument: InstrumentData
}
export const InstrumentInfo = (props: InstrumentInfoProps): JSX.Element => {
  const { t } = useTranslation('instruments_dashboard')
  const { instrument } = props
  const [wizardProps, setWizardProps] = React.useState<
    | React.ComponentProps<typeof GripperWizardFlows>
    | React.ComponentProps<typeof PipetteWizardFlows>
    | null
  >(null)
  const sharedPipetteWizardProps = {
    mount: instrument.mount as PipetteMount,
    selectedPipette:
      instrument.instrumentModel === 'p1000_96'
        ? NINETY_SIX_CHANNEL
        : SINGLE_MOUNT_PIPETTES,
    setSelectedPipette: () => {},
    closeFlow: () => {
      setWizardProps(null)
    },
  }
  const sharedGripperWizardProps = {
    attachedGripper: instrument,
    closeFlow: () => {
      setWizardProps(null)
    },
  }
  const handleDetach: React.MouseEventHandler = () => {
    setWizardProps(
      instrument.mount === 'extension'
        ? { ...sharedGripperWizardProps, flowType: GRIPPER_FLOW_TYPES.DETACH }
        : { ...sharedPipetteWizardProps, flowType: FLOWS.DETACH }
    )
  }
  const handleRecalibrate: React.MouseEventHandler = () => {
    setWizardProps(
      instrument.mount === 'extension'
        ? {
            ...sharedGripperWizardProps,
            flowType: GRIPPER_FLOW_TYPES.RECALIBRATE,
          }
        : { ...sharedPipetteWizardProps, flowType: FLOWS.CALIBRATE }
    )
  }

  return (
    <Flex
      flexDirection={DIRECTION_COLUMN}
      justifyContent={JUSTIFY_SPACE_BETWEEN}
      height="100%"
    >
      <Flex
        flexDirection={DIRECTION_COLUMN}
        gridGap={SPACING.spacing3}
        marginTop={SPACING.spacing5}
      >
        <InfoItem label={t('last_calibrated')} value="TODO" />
        <InfoItem label={t('firmware_version')} value="TODO" />
        <InfoItem label={t('serial_number')} value={instrument.serialNumber} />
      </Flex>
      <Flex gridGap={SPACING.spacing3}>
        <MediumButton
          buttonType="secondary"
          flex="1"
          onClick={handleDetach}
          buttonText={t('detach')}
          textTransform={TYPOGRAPHY.textTransformCapitalize}
          justifyContent={JUSTIFY_CENTER}
        />
        <MediumButton
          buttonType="primary"
          flex="1"
          onClick={handleRecalibrate}
          buttonText={t('recalibrate')}
          textTransform={TYPOGRAPHY.textTransformCapitalize}
          justifyContent={JUSTIFY_CENTER}
        />
      </Flex>
      {wizardProps != null && 'mount' in wizardProps ? (
        <PipetteWizardFlows {...wizardProps} />
      ) : null}
      {wizardProps != null && !('mount' in wizardProps) ? (
        <GripperWizardFlows {...wizardProps} />
      ) : null}
    </Flex>
  )
}

interface InfoItemProps extends StyleProps {
  label: string
  value: string
}
function InfoItem(props: InfoItemProps): JSX.Element {
  return (
    <Flex
      borderRadius={BORDERS.size_three}
      backgroundColor={COLORS.lightGreyPressed}
      padding={`${SPACING.spacing4} ${SPACING.spacing5}`}
      justifyContent={JUSTIFY_SPACE_BETWEEN}
      lineHeight={TYPOGRAPHY.lineHeight36}
      {...props}
    >
      <StyledText
        as="h4"
        fontWeight={TYPOGRAPHY.fontWeightSemiBold}
        fontSize={TYPOGRAPHY.fontSize28}
        textTransform={TYPOGRAPHY.textTransformCapitalize}
      >
        {props.label}
      </StyledText>
      <StyledText
        as="h4"
        color={COLORS.darkBlack_seventy}
        fontSize={TYPOGRAPHY.fontSize28}
        fontWeight={TYPOGRAPHY.fontWeightRegular}
      >
        {props.value}
      </StyledText>
    </Flex>
  )
}