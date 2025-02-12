import * as React from 'react'
import { TabbedButton } from './'
import type { Story, Meta } from '@storybook/react'

export default {
  title: 'ODD/Atoms/Buttons/TabbedButton',
  argTypes: { onClick: { action: 'clicked' } },
} as Meta

const TabbedButtonTemplate: Story<
  React.ComponentProps<typeof TabbedButton>
> = args => <TabbedButton {...args} />
export const Tabbed = TabbedButtonTemplate.bind({})
Tabbed.args = {
  isSelected: true,
  children: 'Button text',
  disabled: false,
  title: 'tabbed button',
}
