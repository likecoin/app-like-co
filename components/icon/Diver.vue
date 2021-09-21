<template>
  <svg
    :width="diverWidth"
    height="2"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <line y1="1" :x2="diverWidth" y2="1" stroke="#EBEBEB" stroke-width="2" />
  </svg>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Selector extends Vue {
  @Prop({ default: 100 }) readonly width: number | undefined

  get diverWidth() {
    return `${this.width}%`
  }
}
</script>
