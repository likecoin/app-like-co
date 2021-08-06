// eslint-disable-next-line import/no-extraneous-dependencies
import { Story } from '@storybook/vue'
import ArrowDown from './icons/ArrowDown.vue'
import IconPlaceholder from './icons/IconPlaceholder.vue'

export default {
  title: 'Button',
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
  },
  decorators: [() => ({ template: '<div class="w-[200px]"><story/></div>' })],
}

const PrependTemplate = `
  <template #prepend>
    <IconPlaceholder/>
  </template>`

const AppendTemplate = `
  <template #append>
    <ArrowDown/>
  </template>`

const CustomTemplate = `
  <template #default>
     e=mc<sup>2</sup>
  </template>`

const Template: Story = (
  args: any,
  {
    argTypes: {
      prependSlot: _prependSlot,
      appendSlot: _appendSlot,
      customSlot: _customSlot,
      ...argTypes
    },
  }: any,
) => ({
  components: {
    IconPlaceholder,
    ArrowDown,
  },
  props: Object.keys(argTypes),
  template: `
    <Button v-bind="$props">
      ${args.prependSlot ? PrependTemplate : ''}
      ${args.customSlot ? CustomTemplate : args.text}
      ${args.appendSlot ? AppendTemplate : ''}
    </Button>
  `,
})

export const Default = Template.bind({})
Default.args = {
  text: 'Title',
}

export const Customize = Template.bind({})
Customize.args = {
  customSlot: true,
}

export const Prepend = Template.bind({})
Prepend.args = {
  ...Default.args,
  prependSlot: true,
}

export const Both = Template.bind({})
Both.args = {
  ...Default.args,
  prependSlot: true,
  appendSlot: true,
}

export const Append = Template.bind({})
Append.args = {
  ...Default.args,
  appendSlot: true,
}

export const Circle = Template.bind({})
Circle.args = {
  circle: true,
  prependSlot: true,
}
