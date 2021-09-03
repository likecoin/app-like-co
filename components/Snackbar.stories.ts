// eslint-disable-next-line import/no-extraneous-dependencies
import { Story } from '@storybook/vue'

export default {
  title: 'Snackbar',
  argTypes: {
    text: {
      type: {
        name: 'string',
        required: false,
      },
      defaultValue: '',
      description: 'Inner text of the Snackbar',
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
    preset:{
      type: {
        name: 'string',
        required: false,
      },
      defaultValue: 'success',
      description: 'Preset of the Snackbar',
      options: [
        'warn',
        'success',
      ],
      control: {
        type: 'radio',
      },
    },
  },
}

const Template: Story = (_args: any, { argTypes, parameters }: any) => ({
  props: Object.keys(argTypes),
  template: `<Snackbar v-bind="$props">
      <template #prepend>
        <IconPlaceholder/>
      </template>
      ${
        parameters.customSlot
          ? 'The whole world is wonderful, <Link>try it now</Link>'
          : ''
      }
    </Snackbar>
  `,
})

export const Suggestion = Template.bind({})
Suggestion.parameters = { customSlot: true }

export const Error = Template.bind({})
Error.args = {
  text: 'The whole world is an error, please try later',
  preset: 'warn',
}
