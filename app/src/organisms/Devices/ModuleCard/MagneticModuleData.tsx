import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  C_BLUE,
  C_SKY_BLUE,
  FONT_SIZE_CAPTION,
  Text,
} from '@opentrons/components'
import {
  MAGNETIC_MODULE_V1,
  MAGNETIC_MODULE_V2,
} from '@opentrons/shared-data/js/constants'
import { StatusLabel } from '../../../atoms/StatusLabel'

interface MagModuleProps {
  moduleStatus: string
  moduleHeight: number
  moduleModel: typeof MAGNETIC_MODULE_V1 | typeof MAGNETIC_MODULE_V2
}

export const MagneticModuleData = (
  props: MagModuleProps
): JSX.Element | null => {
  const { moduleStatus, moduleHeight, moduleModel } = props
  const { t } = useTranslation('device_details')

  return (
    //    TODO Immediately: iconColor should be animated
    <>
      <StatusLabel
        status={moduleStatus}
        backgroundColor={C_SKY_BLUE}
        iconColor={C_BLUE}
      />
      <Text fontSize={FONT_SIZE_CAPTION}>
        {t(
          moduleModel === MAGNETIC_MODULE_V2
            ? 'magdeck_gen2_height'
            : 'magdeck_gen1_height',
          {
            height: moduleHeight,
          }
        )}
      </Text>
    </>
  )
}