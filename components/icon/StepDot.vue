<template>
  <svg
    width="8"
    height="8"
    viewBox="0 0 8 8"
    :fill="color"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="4" cy="4" r="4" :fill="color" />
  </svg>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class StepDot extends Vue {
  // Dot color
  @Prop({ default: 'currentColor' }) readonly color: string | undefined
}
</script>

