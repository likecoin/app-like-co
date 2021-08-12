// eslint-disable-next-line import/no-extraneous-dependencies
import { Story } from '@storybook/vue'

export default {
  title: 'Button',
  argTypes: {
    text: {
      type: {
        name: 'string',
        required: false,
      },
      defaultValue: 'Title',
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
    preset: {
      type: {
        name: 'string',
        required: false,
      },
      options: [
        'primary',
        'secondary',
        'tertiary',
        'plain',
        'outline',
      ],
      defaultValue: 'primary',
      description: 'Preset of the button',
      table: {
        type: {
          summary: 'string',
        },
        defaultValue: {
          summary: 'primary',
        },
      },
      control: {
        type: 'radio',
      },
    },
    size: {
      type: {
        name: 'string',
        required: false,
      },
      defaultValue: 'large',
      description: 'Size of button',
      options: [
        'large',
        'small',
        'mini',
      ],
      control: {
        type: 'radio',
      },
    },
    isDisabled: {
      type: {
        name: 'boolean',
        required: false,
      },
      defaultValue: false,
      description: 'Disable interaction if set to true',
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: {
          summary: false,
        },
      },
      control: {
        type: 'boolean',
      },
    },
    circle: {
      type: {
        name: 'boolean',
        required: false,
      },
      defaultValue: false,
      description: 'Make button round',
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: {
          summary: false,
        },
      },
      control: {
        type: 'boolean',
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
    <IconArrowDown/>
  </template>`

const Template: Story = (
  args: any,
  {
    argTypes,
    parameters,
  }: any,
) => ({
  props: Object.keys(argTypes),
  template: `
    <Button v-bind="$props">
      ${parameters.prependSlot ? PrependTemplate : ''}
      ${parameters.customSlot && !args.circle ? 'e=mc<sup>2</sup>' : ''}
      ${parameters.customSlot && args.circle ? '<IconPlaceholder/>' : ''}
      ${parameters.appendSlot ? AppendTemplate : ''}
    </Button>
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

export const Circle = Template.bind({})
Circle.args = { circle: true }
Circle.parameters = { customSlot: true }
