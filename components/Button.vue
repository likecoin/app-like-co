<template>
  <nuxt-link v-if="to" :class="rootClasses">
    <div :class="filterClasses">
      <div v-if="$slots.prepend" :class="prependWrapperClasses">
        <slot name="prepend" />
      </div>
      <div v-if="$slots.default" :class="contentWrapperClasses">
        <slot />
      </div>
      <div v-else :class="contentWrapperClasses">
        {{ text }}
      </div>
      <div v-if="$slots.append" :class="appendWrapperClasses">
        <slot name="append" />
      </div>
    </div>
  </nuxt-link>
  <a v-else :class="rootClasses">
    <div :class="filterClasses">
      <div v-if="$slots.prepend" :class="prependWrapperClasses">
        <slot name="prepend" />
      </div>
      <div v-if="$slots.default" :class="contentWrapperClasses">
        <slot />
      </div>
      <div v-else :class="contentWrapperClasses">
        {{ text }}
      </div>
      <div v-if="$slots.append" :class="appendWrapperClasses">
        <slot name="append" />
      </div>
    </div>
  </a>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Button extends Vue {
  // Preset of the button
  @Prop({ default: 'primary' }) readonly preset!: string

  // Disable interaction if set to true
  @Prop({ default: false }) readonly isDisabled!: boolean

  // Circle style if set to true
  @Prop(Boolean) readonly circle!: boolean

  // Size of the Button
  @Prop({ default: 'large' }) readonly size!: string | undefined

  // Class of the content wrapper
  @Prop(String) readonly contentClass!: string | undefined

  // Class of the prepend wrapper
  @Prop(String) readonly prependClass!: string | undefined

  // Class of the append wrapper
  @Prop(String) readonly appendClass!: string | undefined

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
    switch (this.circle) {
      case true:
        return [
          ...this.rootClassesForPreset,
          this.classForSize,
          'flex',
          'box-border',
          'items-center',
          'justify-center',
          'rounded-[50%]',
          'overflow-hidden',
          'cursor-pointer',
          {
            'cursor-not-allowed bg-shade-gray text-medium-gray':
              this.isDisabled,
          },
        ]

      case false:
        return [
          ...this.rootClassesForPreset,
          this.classForSize,
          'flex',
          'box-border',
          'rounded-[10px]',
          'overflow-hidden',
          'cursor-pointer',
          {
            'cursor-not-allowed bg-shade-gray text-medium-gray':
              this.isDisabled,
          },
        ]

      default:
        return null
    }
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

  get filterClasses(): any {
    switch (this.circle) {
      case true:
        return [
          this.classForSize,
          'flex',
          'items-center',
          'justify-center',
          'transition',
          'duration-200',
          'hover:bg-white',
          'hover:bg-opacity-30',
          'active:bg-opacity-20',
          this.activeClassesForPreset,
          {
            'pointer-events-none': this.isDisabled,
          },
        ]

      case false:
        return [
          'flex',
          'items-center',
          'justify-between',
          'w-full',
          'px-[16px]',
          'py-[10px]',
          'transition',
          'duration-200',
          'hover:bg-white',
          'hover:bg-opacity-30',
          'active:bg-opacity-20',
          this.activeClassesForPreset,
          {
            'pointer-events-none': this.isDisabled,
          },
        ]

      default:
        return null
    }
  }

  get prependWrapperClasses(): any {
    switch (this.circle) {
      case false:
        return [
          'flex-shrink',
          'mr-[12px]',
        ]

      default:
        return null
    }
  }

  get contentWrapperClasses(): any {
    switch (this.circle) {
      case false:
        return [
          'flex',
          'items-center',
          'justify-center',
          'flex-grow',
        ]

      default:
        return 'hidden'
    }
  }

  get appendWrapperClasses(): any {
    return [
      'flex-shrink',
      'ml-[12px]',
      this.appendClass,
    ]
  }
}
</script>
