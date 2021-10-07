<template>
  <hr
    :class="rootClass"
    :style="rootStyle"
  />
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Divider extends Vue {
  @Prop({ default: 32 }) readonly width!: number
  @Prop({ default: false }) readonly isFull!: boolean

  get rootClass() {
    return [
      'h-[2px]',
      'bg-shade-gray',
      'border-none',
      {
        'w-full': this.isFull,
      },
    ]
  }

  get rootStyle() {
    const style: any = {}
    if (!this.isFull) {
      style.width = `${this.width}px`
    }
    return style
  }
}
</script>
