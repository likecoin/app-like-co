// eslint-disable-next-line import/no-extraneous-dependencies
import { Story } from '@storybook/vue'

export default {
  title: 'Label',
  argTypes: {
    text: {
      type: {
        name: 'string',
        required: false,
      },
      defaultValue: 'Title',
      description: 'Text of label',
      table: {
        type: {
          summary: 'string',
        },
        defaultValue: {
          summary: '',
        },
      },
      control: {
        type: 'text',
      },
    },
  },
  decorators: [() => ({ template: `<div class="flex justify-start"><story/></div>` })],
}

const PrependTemplate = `
  <template #prepend>
    <IconPlaceholder/>
  </template>`

const AppendTemplate = `
  <template #append>
    <IconPlaceholder/>
  </template>`

const Template: Story = (
  _args: any,
  {
    argTypes,
    parameters,
  }: any,
) => ({
  props: Object.keys(argTypes),
  template: `
    <Label v-bind="$props">
      ${parameters.prependSlot ? PrependTemplate : ''}
      ${parameters.customSlot ? 'e=mc<sup>2</sup>' : ''}
      ${parameters.appendSlot ? AppendTemplate : ''}
    </Label>
  `,
})

export const Default = Template.bind({})

export const Customized = Template.bind({})
Customized.parameters = { customSlot: true }

export const Prepend = Template.bind({})
Prepend.parameters = { prependSlot: true }

export const Append = Template.bind({})
Append.parameters = { appendSlot: true }

export const Both = Template.bind({})
Both.parameters = {
  prependSlot: true,
  appendSlot: true,
}
