<template>
  <div class="flex flex-col">
    <component
      :is="tag"
      :key="`${keyIndex}`"
      ref="input"
      v-bind="inputProps"
      @input="$emit('input', $event.target.value)"
      @blur="handleBlur"
    ><template v-if="isTextarea && value">{{ value }}</template></component>
    <span :class="errorMsgClasses">{{ errorMessage }}</span>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class TextField extends Vue {
  @Prop([String, Number]) readonly value!: string | number | undefined
  @Prop(String) readonly placeholder!: string | undefined
  @Prop({ default: 44 }) readonly size!: number
  @Prop(String) readonly errorMessage!: string | undefined
  @Prop({ default: false }) readonly isDisabled!: boolean
  @Prop({ default: false }) readonly isTextarea!: boolean

  keyIndex = 0

  static presetClasses: Array<string> = [
    'py-[12px]',
    'px-[16px]',
    'w-full',
    'bg-shade-gray',
    'rounded-[12px]',
    'border-2',
    'border-shade-gray',
    'outline-none',
    'text-[16px]',
    'focus:border-like-cyan',
    'hover:border-like-cyan-light',
  ]

  get tag(): any {
    if (this.isTextarea) return 'textarea'
    return 'input'
  }

  get inputProps() {
    const props: any = {
      class: this.rootClasses,
      placeholder: this.placeholder,
      ...this.$attrs,
    }
    if (this.isTextarea) {
      props.rows = 4
    } else {
      props.value = this.value
    }
    return props
  }

  get rootClasses(): any {
    return [
      TextField.presetClasses,
      this.isTextarea ? 'font-semibold resize-none' : this.sizeClasses,
      this.errorClasses,
      {
        'pointer-events-none': this.isDisabled,
      },
    ]
  }

  get sizeClasses(): any {
    switch (this.size) {
      case 40:
        return [
          'h-40px',
          'min-w-[100px]',
          'font-normal',
        ]

      case 44:
      default:
        return [
          'h-44px',
          'min-w-[200px]',
          'font-semibold',
        ]
    }
  }

  get errorClasses(): any {
    return {
      'border-[red] focus:border-red hover:border-red': this.errorMessage,
    }
  }

  get errorMsgClasses(): any {
    return { 'pl-[8px] text-[red] text-[10px]': this.errorMessage }
  }

  @Watch('value')
  onValueChange(value: string) {
    if (this.isTextarea) return

    // NOTE: Workaround for the issue that the input value is not updated when the value prop is changed.
    const inputValue = (this.$refs.input as any).value
    if (inputValue.toString() !== value.toString()) {
      (this.$refs.input as any).value = value
    }
  }

  handleBlur() {
    // NOTE: Update the key to re-render the input element to sync with value prop
    this.keyIndex = (this.keyIndex + 1) % 2
    this.$emit('blur')
  }
}
</script>
