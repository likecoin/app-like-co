// eslint-disable-next-line import/no-extraneous-dependencies
import { Story } from '@storybook/vue'

export default {
  title: 'Tag',
}

const ReadOnlyTemplate: Story = (_args: any, { argTypes }: any) => ({
  props: Object.keys(argTypes),
  template: `
    <Tag-readonly v-bind="$props" />
    `,
})

const InputTemplate: Story = (_args: any, { _argTypes }: any) => ({
  template: `
    <Tag-input />
    `,
})

export const ReadOnly = ReadOnlyTemplate.bind({})
ReadOnly.args = { text: 'Tag' }

export const Input = InputTemplate.bind({})

