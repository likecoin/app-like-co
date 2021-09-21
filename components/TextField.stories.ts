// eslint-disable-next-line import/no-extraneous-dependencies
import { Story } from '@storybook/vue'

export default {
  title: 'TextField',
  argTypes: {
    placeholder: {
      name: 'placeholder',
      type: { name: 'string', required: false },
      defaultValue: 'Say Something',
      description: 'Placeholder text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
      control: {
        type: 'text',
      },
    },
    size: {
      name: 'size',
      type: { name: 'number', required: false },
      options: [
        44,
        40,
      ],
      defaultValue: 44,
      description: 'Size of TextField, including height and font-weight',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: 44 },
      },
      control: {
        type: 'radio',
      },
    },
    errorMessage: {
      name: 'errorMessage',
      type: { name: 'string', required: false },
      defaultValue: '',
      description:
        'Provide the text that is displayed when the control is in warning state',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '' },
      },
      control: {
        type: 'text',
      },
    },
  },
  decorators: [() => ({ template: '<div class="w-[300px]"><story/></div>' })],
}

const Template: Story = (_args: any, { argTypes }: any) => ({
  props: Object.keys(argTypes),
  template: `<TextField v-bind="$props" />`,
})

export const Default = Template.bind({})
export const Error = Template.bind({})
Error.args = { errorMessage: 'This is an error message.' }
