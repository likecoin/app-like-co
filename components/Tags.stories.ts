// eslint-disable-next-line import/no-extraneous-dependencies
import { Story } from '@storybook/vue'

export default {
  title: 'Tag',
}

const ReadOnlyTemplate: Story = (_args: any, { argTypes }: any) => ({
  props: Object.keys(argTypes),
  template: `
    <Tag v-bind="$props" />
    `,
})

const EditableTagTemplate: Story = (_args: any, { _argTypes }: any) => ({
  template: `
    <EditableTag />
    `,
})

export const Default = ReadOnlyTemplate.bind({})
Default.args = { text: 'Tag' }

export const EditableTag = EditableTagTemplate.bind({})

