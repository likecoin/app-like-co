// eslint-disable-next-line import/no-extraneous-dependencies
import { Story } from '@storybook/vue'

export default {
  title: 'InsertFields',
  argTypes: {
    text: {
      type: {
        name: 'string',
        required: false,
      },
      defaultValue: '',
      description: 'text of button',
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
    placeholder: {
      type: {
        name: 'string',
        required: false,
      },
      defaultValue: '',
      description: 'placehoder of TextField',
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
}

const PrependTemplate = `
  <template #prepend>
    <Button preset="tertiary" size="small" prepend-class="mr-[6px]" append-class="ml-0" >
        <template #prepend>
            <IconPlaceholder />
         </template>
         <template #append>
            <IconArrowDown />
         </template>
    </Button>
  </template>`

const Template: Story = (_args: any, { argTypes, parameters }: any) => ({
  props: Object.keys(argTypes),
  template: `
    <InsertField v-bind="$props">
      ${parameters.prepend ? PrependTemplate : ''}
    </InsertField>
    `,
})

export const Default = Template.bind({})
Default.args = { text: 'text', placeholder: 'say someting' }

export const Prepend = Template.bind({})
Prepend.args = { text: 'Wallet Address', placeholder: 'Wallet address..' }
Prepend.parameters = { prepend: true }
