import * as React from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import {
  DIRECTION_COLUMN,
  Flex,
  Text,
  SPACING,
  BORDERS,
  TYPOGRAPHY,
  JUSTIFY_SPACE_BETWEEN,
  ALIGN_CENTER,
  PrimaryButton,
} from '@opentrons/components'
import { InputField } from './InputField'
import { GoBackLink } from './GoBackLink'
import { HandleEnter } from './HandleEnter'

import type { WizardTileProps } from './types'

export function MetadataTile(props: WizardTileProps): JSX.Element {
  const { i18n, t } = useTranslation()
  const {
    handleChange,
    handleBlur,
    values,
    goBack,
    proceed,
    errors,
    touched,
  } = props

  const disableProceed =
    values.fields.name == null ||
    values.fields.name === '' ||
    !Boolean(touched?.fields?.name) ||
    errors?.fields?.name != null

  return (
    <HandleEnter onEnter={proceed}>
      <Flex flexDirection={DIRECTION_COLUMN} padding={SPACING.spacing32}>
        <Flex
          flexDirection={DIRECTION_COLUMN}
          height="26rem"
          gridGap={SPACING.spacing24}
        >
          <Text as="h2">
            {t('modal.create_file_wizard.protocol_name_and_description')}
          </Text>

          <Flex flexDirection={DIRECTION_COLUMN} gridGap={SPACING.spacing16}>
            <Text as="h4">
              {t('modal.create_file_wizard.name_your_protocol')}
            </Text>
            <Flex
              flexDirection={DIRECTION_COLUMN}
              width="20rem"
              minHeight="74px" // leave room for error if present
              gridGap={SPACING.spacing4}
            >
              <Text as="p" fontSize={TYPOGRAPHY.fontSizeP}>
                {`${t('modal.create_file_wizard.protocol_name')} *`}
              </Text>
              <InputField
                autoFocus
                name="fields.name"
                value={values.fields.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  touched?.fields?.name &&
                  values.fields.name &&
                  values.fields.name.length > 1
                    ? errors?.fields?.name ?? null
                    : null
                }
              />
            </Flex>
          </Flex>

          <Flex flexDirection={DIRECTION_COLUMN} gridGap={SPACING.spacing16}>
            <Text as="h4">
              {t('modal.create_file_wizard.add_optional_info')}
            </Text>
            <Flex
              flexDirection={DIRECTION_COLUMN}
              width="30rem"
              gridGap={SPACING.spacing4}
            >
              <Text as="p" fontSize={TYPOGRAPHY.fontSizeP}>
                {t('modal.create_file_wizard.description')}
              </Text>
              <DescriptionField
                name="fields.description"
                value={values.fields.description ?? ''}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </Flex>
            <Flex
              flexDirection={DIRECTION_COLUMN}
              width="30rem"
              gridGap={SPACING.spacing4}
            >
              <Text as="p" fontSize={TYPOGRAPHY.fontSizeP}>
                {t('modal.create_file_wizard.organization_or_author')}
              </Text>
              <InputField
                name="fields.organizationOrAuthor"
                value={values.fields.organizationOrAuthor}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </Flex>
          </Flex>
        </Flex>
        <Flex
          alignItems={ALIGN_CENTER}
          justifyContent={JUSTIFY_SPACE_BETWEEN}
          width="100%"
        >
          <GoBackLink onClick={() => goBack()} />
          <PrimaryButton onClick={() => proceed()} disabled={disableProceed}>
            {i18n.format(t('shared.next'), 'capitalize')}
          </PrimaryButton>
        </Flex>
      </Flex>
    </HandleEnter>
  )
}

const DescriptionField = styled.textarea`
  min-height: 5rem;
  width: 100%;
  border: ${BORDERS.lineBorder};
  border-radius: ${BORDERS.radiusSoftCorners};
  padding: ${SPACING.spacing8};
  font-size: ${TYPOGRAPHY.fontSizeP};
  resize: none;
`
