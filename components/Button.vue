<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :class="rootClasses"
    v-on="$listeners"
  >
    <Label
      :class="labelClass"
      :text="text"
      :content-class="contentClass"
      :prepend-class="prependClass"
      :append-class="appendClass"
    >
      <template
        v-if="shouldShowPrepend"
        #prepend
      >
        <slot name="prepend" />
      </template>
      <slot />
      <template
        v-if="shouldShowAppend"
        #append
      >
        <slot name="append" />
      </template>
    </Label>
  </NuxtLink>
  <a
    v-else
    :class="rootClasses"
    v-on="$listeners"
  >
    <Label
      :class="labelClass"
      :text="text"
      :content-class="contentClass"
      :prepend-class="prependClass"
      :append-class="appendClass"
    >
      <template
        v-if="shouldShowPrepend"
        #prepend
      >
        <slot name="prepend" />
      </template>
      <slot />
      <template
        v-if="shouldShowAppend"
        #append
      >
        <slot name="append" />
      </template>
    </Label>
  </a>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Button extends Vue {
  // Preset of the button
  @Prop({ default: 'primary' }) readonly preset!: string

  // Text of the button
  @Prop(String) readonly text!: string

  // Disable interaction if set to true
  @Prop({ default: false }) readonly isDisabled!: boolean

  // Circle style if set to true
  @Prop(Boolean) readonly circle!: boolean

  // Size of the Button
  @Prop({ default: 'large' }) readonly size!: string | undefined

  // Class of the content wrapper
  @Prop([
    String,
    Array,
  ]) readonly contentClass!: string | [] | undefined

  // Class of the prepend wrapper
  @Prop([
    String,
    Array,
  ]) readonly prependClass!: string | [] | undefined

  // Class of the append wrapper
  @Prop([
    String,
    Array,
  ]) readonly appendClass!: string | [] | undefined

  // Equivalent to `to` of `<NuxtLink/>`
  @Prop({ default: null }) readonly to: object | null | undefined

  get rootClassesForPreset(): any {
    switch (this.preset) {
      case 'primary':
        return [
          'bg-like-green',
          'text-like-cyan-light',
        ]

      case 'secondary':
        return [
          'bg-like-cyan-light',
          'text-like-green',
        ]

      case 'tertiary':
        return [
          'bg-shade-gray',
          this.circle ? 'text-like-green' : 'text-dark-gray',
        ]

      case 'plain':
        return ['bg-transparent']

      case 'outline':
        return [
          'bg-transparent',
          this.isDisabled ? null : 'border-medium-gray border-2',
          this.circle ? 'text-like-green' : 'text-dark-gray',
          'active:border-opacity-0',
          'hover:border-opacity-0',
        ]

      default:
        return null
    }
  }

  get classForSize(): any {
    switch (this.size) {
      case 'large':
        return this.circle ? 'h-64px w-[64px]' : 'h-44px'

      case 'small':
        return this.circle ? 'h-48px w-[48px]' : 'h-40px'

      default:
        return null
    }
  }

  get rootClasses(): any {
    const isCircle = !!this.circle
    return [
      ...this.rootClassesForPreset,
      this.classForSize,
      'flex',
      'box-border',
      'overflow-hidden',
      'cursor-pointer',
      isCircle ? 'rounded-[50%]' : 'rounded-[10px]',
      {
        'items-center': isCircle,
        'justify-center': isCircle,
        'cursor-not-allowed bg-shade-gray text-medium-gray':
              this.isDisabled,
      },
    ]
  }

  get activeClassesForPreset(): any {
    switch (this.preset) {
      case 'primary':
        return 'active:bg-black'

      case 'secondary':
        return 'active:bg-like-green'

      default:
        return 'active:bg-dark-gray'
    }
  }

  get labelClass(): any {
    const isCircle = !!this.circle
    return [
      isCircle ? 'justify-center' : 'justify-between',
      'transition',
      'duration-200',
      'hover:bg-white',
      'hover:bg-opacity-30',
      'active:bg-opacity-20',
      this.activeClassesForPreset,
      {
        'px-[16px]': !isCircle,
        'py-[10px]': !isCircle,
        'w-full': !isCircle,
        'pointer-events-none': this.isDisabled,
        [this.classForSize]: isCircle,
      },
    ]
  }

  get prependWrapperClasses(): any {
    return this.circle ? null : [
      'flex-shrink',
      'mr-[12px]',
    ]
  }

  get appendWrapperClasses(): any {
    return this.appendClass
  }

  get shouldShowPrepend() {
    return !!this.$slots.prepend && !this.circle
  }

  get shouldShowAppend() {
    return !!this.$slots.append && !this.circle
  }
}
</script>
