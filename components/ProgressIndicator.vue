<template>
  <svg
    width="154"
    height="16"
    viewBox="0 0 154 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <clipPath id="progress-indicator">
        <rect width="154" height="16" rx="8" />
      </clipPath>
    </defs>
    <rect class="fill-current text-like-cyan-light" width="154" height="16" rx="8" />
    <g clip-path="url(#progress-indicator)">
      <rect
        :class="progressClass"
        x="0"
        :width="progressWidth"
        height="16"
        rx="8"
      />
    </g>
  </svg>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

export enum ProgressIndicatorType {
  Determine = 'determine',
  Intermediate = 'intermediate',
}

@Component
export default class ProgressIndicator extends Vue {
  /**
   * Use for different operations
   */
  @Prop({ default: ProgressIndicatorType.Intermediate })
  readonly type!: ProgressIndicatorType

  /**
   * Define the progress in determine type. Range is 0 - 100.
   */
  @Prop({ default: 0 }) readonly value!: number

  get normalizedProgress() {
    return Math.max(0, Math.min(100, this.value)) / 100
  }

  get progressWidth() {
    if (this.type === ProgressIndicatorType.Determine) {
      return this.normalizedProgress * 156
    }
    return 70
  }

  get progressClass() {
    return [
      'text-like-cyan',
      'fill-current',
      {
        'progress progress--animated': this.type === ProgressIndicatorType.Intermediate,
      },
    ]
  }
}
</script>

<style scoped>
@keyframes progress-indicator-intermediate {
  0% {
    transform: translateX(-100%)
  }
  100% {
    transform: translateX(100%)
  }
}
.progress.progress--animated {
  animation-name: progress-indicator-intermediate;
  animation-duration: 1s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}
</style>
