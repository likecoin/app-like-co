<template>
  <component
    :is="tag"
    :class="rootClasses"
    :to="to || null"
    :href="href || null"
    :target="href ? '_blank' : null"
    :rel="rel"
  >
    <slot />
    <IconNorthEast v-if="href" class="ml-[4px]" />
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
    return 'a'
  }

  get rel() {
    if (this.href) return 'noopener noreferrer'
    return null
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
