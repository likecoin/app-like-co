<template>
  <img
    :class="[
      'flex-shrink-0',
      'overflow-hidden',
      'box-border',
      'text-light-gray',
      'bg-current',
      'border-[1px]',
      'border-current',
      'rounded-[50%]',
    ]"
    :src="imageSrc"
    :style="imageStyle"
  />
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class UserAvatar extends Vue {
  @Prop({ default: 40 }) readonly size: any | undefined
  @Prop(String) readonly url!: string

  get imageSrc() {
    return this.getLikeCoResizedImageUrl(this.url, this.size)
  }

  get imageStyle() {
    const borderWidth = `${this.size * 0.05}px`
    const width = `${this.size}px`
    return {
      width,
      height: width,
      borderWidth,
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getLikeCoResizedImageUrl(url: string, size: any) {
    return url.replace(/\?size=\d+/, `?size=${size}`)
  }
}
</script>

