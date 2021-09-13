<template>
  <div class="flex flex-col">
    <component
      :is="tag"
      v-bind="$attrs"
      :class="rootClasses"
      :value="value"
      :placeholder="placeholder"
      @input="$emit('input', $event.target.value)"
      @blur="$emit('delete-empty-field')"
    />
    <span :class="errorMsgClasses">{{ errorMessage }}</span>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class TextField extends Vue {
  @Prop(String) readonly value!: string | undefined
  @Prop(String) readonly placeholder!: string | undefined
  @Prop({ default: 44 }) readonly size!: number
  @Prop(String) readonly errorMessage!: string | undefined
  @Prop({ default: false }) readonly isDisabled!: boolean
  @Prop({ default: false }) readonly isTextarea!: boolean

  static presetClasses: Array<string> = [
    'py-[12px]',
    'px-[16px]',
    'w-full',
    'min-w-[200px]',
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

  get rootClasses(): any {
    return [
      TextField.presetClasses,
      this.isTextarea? 'h-[62px] font-semibold resize-none': this.sizeClasses,
      this.errorClasses,
      {
        'pointer-events-none': this.isDisabled,
      },
    ]
  }

  get sizeClasses(): any {
    switch (this.size) {
      case 44:
        return [
          'h-44px', 
          'font-semibold',
        ]

      case 40:
        return [
          'h-40px',
          'font-normal',
        ]

      default:
        return []
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
}
</script>
