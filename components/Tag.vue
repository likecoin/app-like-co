<template>
  <component
    :is="tag"
    :class="[
      'inline-block',
      'bg-shade-gray',
      'py-[6px]',
      'px-[20px]',
      'text-[12px]',
      'rounded-[16px]',
    ]"
    :to="to"
  >
    {{ text }}
  </component>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Tag extends Vue {
  @Prop(String) readonly text: String | undefined
  @Prop(String) readonly to: String | undefined

  get tag(): any {
    return this.to ? 'nuxt-link' : 'div'
  }
}

</script>