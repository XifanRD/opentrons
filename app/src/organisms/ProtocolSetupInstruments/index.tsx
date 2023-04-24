import {
  COLORS,
  ALIGN_CENTER,
  DIRECTION_COLUMN,
  Flex,
  JUSTIFY_SPACE_BETWEEN,
  SPACING,
  TYPOGRAPHY,
} from '@opentrons/components'
import * as React from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import {
  useAllPipetteOffsetCalibrationsQuery,
  useInstrumentsQuery,
} from '@opentrons/react-api-client'
import { BackButton } from '../../atoms/buttons'
import { ContinueButton } from '../ProtocolSetupModules'
import { useMostRecentCompletedAnalysis } from '../LabwarePositionCheck/useMostRecentCompletedAnalysis'
import { ProtocolInstrumentMountItem } from '../InstrumentMountItem'

import type { SetupScreens } from '../../pages/OnDeviceDisplay/ProtocolSetup'
import type { GripperData, PipetteData } from '@opentrons/api-client'
import type { GripperModel } from '@opentrons/shared-data'

export interface ProtocolSetupInstrumentsProps {
  runId: string
  setSetupScreen: React.Dispatch<React.SetStateAction<SetupScreens>>
}

export function ProtocolSetupInstruments({
  runId,
  setSetupScreen,
}: ProtocolSetupInstrumentsProps): JSX.Element {
  const { t } = useTranslation('protocol_setup')
  const { data: attachedInstruments } = useInstrumentsQuery()
  const {
    data: allPipettesCalibrationData,
  } = useAllPipetteOffsetCalibrationsQuery()
  const mostRecentAnalysis = useMostRecentCompletedAnalysis(runId)

  const usesGripper =
    mostRecentAnalysis?.commands.some(
      c =>
        c.commandType === 'moveLabware' && c.params.strategy === 'usingGripper'
    ) ?? false
  const attachedGripperMatch = usesGripper
    ? (attachedInstruments?.data ?? []).find(
        (i): i is GripperData => i.instrumentType === 'gripper'
      ) ?? null
    : null
  return (
    <Flex
      flexDirection={DIRECTION_COLUMN}
      width="100%"
      gridGap={SPACING.spacing3}
    >
      <Flex justifyContent={JUSTIFY_SPACE_BETWEEN} alignItems={ALIGN_CENTER}>
        <BackButton onClick={() => setSetupScreen('prepare to run')}>
          {t('instruments')}
        </BackButton>
        <Flex gridGap={SPACING.spacingXXL}>
          <ContinueButton onClick={() => setSetupScreen('modules')} />
        </Flex>
      </Flex>
      <Flex
        justifyContent={JUSTIFY_SPACE_BETWEEN}
        alignItems={ALIGN_CENTER}
        paddingX={SPACING.spacing5}
      >
        <ColumnLabel>{t('location')}</ColumnLabel>
        <ColumnLabel>{t('calibration_status')}</ColumnLabel>
      </Flex>
      {(mostRecentAnalysis?.pipettes ?? []).map(loadedPipette => {
        const attachedPipetteMatch =
          (attachedInstruments?.data ?? []).find(
            (i): i is PipetteData =>
              i.instrumentType === 'pipette' &&
              i.mount === loadedPipette.mount &&
              i.instrumentName === loadedPipette.pipetteName
          ) ?? null
        return (
          <ProtocolInstrumentMountItem
            key={loadedPipette.mount}
            mount={loadedPipette.mount}
            speccedName={loadedPipette.pipetteName}
            attachedInstrument={attachedPipetteMatch}
            attachedCalibrationData={
              attachedPipetteMatch != null
                ? allPipettesCalibrationData?.data.find(
                    cal =>
                      cal.mount === attachedPipetteMatch.mount &&
                      cal.pipette === attachedPipetteMatch.instrumentName
                  ) ?? null
                : null
            }
          />
        )
      })}
      {usesGripper ? (
        <ProtocolInstrumentMountItem
          key="extension"
          mount="extension"
          speccedName={attachedGripperMatch?.instrumentModel as GripperModel}
          attachedInstrument={attachedGripperMatch}
          attachedCalibrationData={
            attachedGripperMatch?.data.calibratedOffset ?? null
          }
        />
      ) : null}
    </Flex>
  )
}

const ColumnLabel = styled.p`
  flex: 1;
  font-weight: ${TYPOGRAPHY.fontWeightSemiBold};
  font-size: ${TYPOGRAPHY.fontWeightSemiBold};
  line-height: ${TYPOGRAPHY.lineHeight28};
  color: ${COLORS.darkBlack_seventy};
`
