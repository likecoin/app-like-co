<template>
  <div class="flex flex-col">
    <input :class="rootClasses" :placeholder="placeholder" />
    <span :class="errorMsgClasses">{{ errorMessage }}</span>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class TextField extends Vue {
  @Prop(String) readonly placeholder!: string | undefined
  @Prop({ default: 44 }) readonly size!: number
  @Prop(String) readonly errorMessage!: string | undefined
  @Prop({ default: false }) readonly isDisabled!: boolean

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

  get rootClasses(): any {
    return [
      TextField.presetClasses,
      ...this.sizeClasses,
      this.errorClasses,
      {
        'pointer-events-none': this.isDisabled,
      },
    ]
  }

  get sizeClasses(): any {
    switch (this.size) {
      case 44:
        return ['h-44px', 'font-semibold']

      case 40:
        return ['h-40px', 'font-normal']

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
