// eslint-disable-next-line import/no-extraneous-dependencies
import { Story } from '@storybook/vue'

export default {
  title: 'ProgressIndicator',
  argTypes: {
    type:{
      type: {
        name: 'string',
        required: false,
      },
      defaultValue: 'intermediate',
      description: 'Type of the indicator',
      table: {
        type: {
          summary: 'string',
        },
        defaultValue: {
          summary: 'intermediate',
        },
      },
      options: [
        'intermediate',
        'determine',
      ],
      control: {
        type: 'radio',
      },
    },
    value: {
      type: {
        name: 'number',
        required: false,
      },
      defaultValue: 50,
      description: 'Progress of the indicator',
      table: {
        type: {
          summary: 'number',
        },
        defaultValue: {
          summary: '0',
        },
      },
      control: {
        type: 'number',
        min: 0,
        max: 100,
      },
    },
  },
  decorators: [() => ({ template: `<div class="flex justify-start"><story/></div>` })],
}

const Template: Story = (
  _args: any,
  {
    argTypes,
  }: any,
) => ({
  props: Object.keys(argTypes),
  template: `
    <ProgressIndicator v-bind="$props" />
  `,
})

export const Default = Template.bind({})
