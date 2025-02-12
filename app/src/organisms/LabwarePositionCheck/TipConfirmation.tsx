import * as React from 'react'
import {
  Flex,
  DIRECTION_COLUMN,
  PrimaryButton,
  SecondaryButton,
  JUSTIFY_SPACE_BETWEEN,
  SPACING,
  ALIGN_CENTER,
  COLORS,
} from '@opentrons/components'
import { useTranslation } from 'react-i18next'

import { NeedHelpLink } from '../CalibrationPanels'
import { StyledText } from '../../atoms/text'
import { useSelector } from 'react-redux'
import { getIsOnDevice } from '../../redux/config'
import { SimpleWizardBody } from '../../molecules/SimpleWizardBody'
import { SmallButton } from '../../atoms/buttons'
import { i18n } from '../../i18n'

const LPC_HELP_LINK_URL =
  'https://support.opentrons.com/s/article/How-Labware-Offsets-work-on-the-OT-2'

interface TipConfirmationProps {
  invalidateTip: () => void
  confirmTip: () => void
}

export function TipConfirmation(props: TipConfirmationProps): JSX.Element {
  const { invalidateTip, confirmTip } = props
  const { t } = useTranslation('shared')
  const isOnDevice = useSelector(getIsOnDevice)
  return isOnDevice ? (
    <SimpleWizardBody
      isSuccess={false}
      iconColor={COLORS.warningEnabled}
      header={t('did_pipette_pick_up_tip')}
    >
      <Flex alignItems={ALIGN_CENTER} gridGap={SPACING.spacing8}>
        <SmallButton
          buttonText={i18n.format(t('try_again'), 'capitalize')}
          buttonType="secondary"
          onClick={invalidateTip}
        />
        <SmallButton
          buttonText={i18n.format(t('yes'), 'capitalize')}
          buttonType="primary"
          onClick={confirmTip}
        />
      </Flex>
    </SimpleWizardBody>
  ) : (
    <Flex
      flexDirection={DIRECTION_COLUMN}
      justifyContent={JUSTIFY_SPACE_BETWEEN}
      padding={SPACING.spacing32}
      minHeight="29.5rem"
    >
      <StyledText as="h1" marginBottom={SPACING.spacing16}>
        {t('did_pipette_pick_up_tip')}
      </StyledText>
      <Flex
        width="100%"
        justifyContent={JUSTIFY_SPACE_BETWEEN}
        marginTop={SPACING.spacing16}
      >
        <NeedHelpLink href={LPC_HELP_LINK_URL} />
        <Flex gridGap={SPACING.spacing8}>
          <SecondaryButton onClick={invalidateTip}>
            {i18n.format(t('try_again'), 'capitalize')}
          </SecondaryButton>
          <PrimaryButton onClick={confirmTip}>
            {i18n.format(t('yes'), 'capitalize')}
          </PrimaryButton>
        </Flex>
      </Flex>
    </Flex>
  )
}
