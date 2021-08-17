<template>
  <div>
    <nuxt-link
      v-if="to"
      :to="to"
      :class="[
        'flex',
        'flex-row',
        'items-baseline',
        'text-[16px]',
        'font-normal',
        'text-like-green',
        'leading-[22px]',
        'underline',
      ]"
    >
      <slot />
    </nuxt-link>
    <a
      v-else
      :href="href"
      :class="[
        'flex',
        'flex-row',
        'items-baseline',
        'text-[16px]',
        'font-normal',
        'text-like-green',
        'leading-[22px]',
        'underline',
      ]"
    >
      <slot />
    </a>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Link extends Vue {
  // Equivalent to `to` of `<NuxtLink/>`
  @Prop({ default: null }) readonly to: object | null | undefined
  @Prop(String) readonly href: string | undefined
}
</script>