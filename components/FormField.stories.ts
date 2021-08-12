// eslint-disable-next-line import/no-extraneous-dependencies
import { Story } from '@storybook/vue'

export default {
  title: 'FormField',
  argTypes: {
    label: {
      type: {
        name: 'string',
        required: false,
      },
      defaultValue: 'Label',
      description: 'Label text of FormField',
      table: {
        type: {
          summary: 'string',
        },
        defaultValue: {
          summary: 'Label',
        },
      },
      control: {
        type: 'text',
      },
    },
  },
  decorators: [() => ({ template: '<div class="w-[400px]"><story/></div>' })],
}

const TextTamplate = `
    The quick brown fox jumps over the lazy dog
  `

const CompoundTamplate = `
    <div class="font-normal text-[16px] leading-[22px]">
      The quick brown fox jumps over the lazy dog
    </div>
    <div class="font-semibold">
      The quick brown fox jumps over the lazy dog
    </div>
  `

const LinkTamplate = `
    <Link to="/">
      The quick brown fox jumps over the lazy dog 
      <IconNorthEast class="ml-[4px]" />
    </Link>  
  `

const TextFieldTamplate = `
    <TextField :size="40" placeholder="https://" />
  `

const ReadOnlyTagsTamplate = `
    <Tag-readonly text="Tag" />
    <Tag-readonly text="Tag" />
    <Tag-readonly text="Tag" />
  `

const TagListTamplate = `
    <Tag-input />
  `

const Template: Story = (args: any, { argTypes, parameters }: any) => ({
  props: Object.keys(argTypes),
  template: `
    <FormField v-bind="$props">
      ${args.contentType === 'normal' ? TextTamplate : ''}
      ${args.contentType === 'strong' ? TextTamplate : ''}
      ${
        args.contentType === 'custom' && parameters.customCompound
          ? CompoundTamplate
          : ''
      }
      ${
        args.contentType === 'custom' && parameters.customHyperlink
          ? LinkTamplate
          : ''
      }
      ${
        args.contentType === 'custom' && parameters.customTextField
          ? TextFieldTamplate
          : ''
      }
      ${
        args.contentType === 'custom' && parameters.customTags
          ? ReadOnlyTagsTamplate
          : ''
      }
      ${
        args.contentType === 'custom' && parameters.customTagList
          ? TagListTamplate
          : ''
      }
    </FormField>
  `,
})

export const Row = Template.bind({})
Row.args = {
  direction: 'row',
  contentType: 'normal',
}

export const DefaultText = Template.bind({})
DefaultText.args = {
  contentType: 'normal',
}

export const BoldText = Template.bind({})
BoldText.args = {
  contentType: 'strong',
}

export const Compound = Template.bind({})
Compound.parameters = { customCompound: true }
Compound.args = {
  contentType: 'custom',
}

export const Hyperlinks = Template.bind({})
Hyperlinks.parameters = { customHyperlink: true }
Hyperlinks.args = {
  to: '/',
  contentType: 'custom',
}

export const InputField = Template.bind({})
InputField.parameters = { customTextField: true }
InputField.args = {
  label: 'URL',
  contentType: 'custom',
}

export const Tags = Template.bind({})
Tags.parameters = { customTags: true }
Tags.args = {
  label: 'Tags',
  contentType: 'custom',
}

export const TagList = Template.bind({})
TagList.parameters = { customTagList: true }
TagList.args = {
  label: 'Tags',
  contentType: 'custom',
}
