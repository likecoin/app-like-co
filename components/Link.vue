<template>
  <component
    :is="tag"
    :class="rootClasses"
    :to="to || null"
  > 
    <slot />
  </component>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Link extends Vue {
  // Equivalent to `to` of `<NuxtLink/>`
  @Prop({ default: null }) readonly to: object | null | undefined
  @Prop(String) readonly href: string | undefined

  get tag() {
    if (this.to) return 'NuxtLink'
    if (this.$attrs.href) return 'a'
    return 'a'
  }

  get rootClasses() {
    return [
      'flex',
      'flex-row',
      'items-baseline',
      'text-[16px]',
      'font-normal',
      'text-like-green',
      'leading-[22px]',
      'underline',
      this.href || this.to,
    ]
  }
}
</script>
