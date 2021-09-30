<template>
  <svg
    width="154"
    height="16"
    viewBox="0 0 154 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <clipPath :id="clipPathID">
        <rect width="154" height="16" rx="8" />
      </clipPath>
    </defs>
    <rect
      :class="[
        'fill-current',
        'text-like-cyan-light',
      ]"
      width="154"
      height="16"
      rx="8"
    />
    <g :clip-path="`url(#${clipPathID})`">
      <rect v-bind="progressProps">
        <template v-if="isIntermediate">
          <animate
            attributeName="width"
            values="100;40"
            dur="2s"
            repeatCount="indefinite"
          />
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="translate"
            values="-100 0;170 0"
            dur="1s"
            repeatCount="indefinite"
          />
        </template>
      </rect>
      <rect
        v-if="isIntermediate"
        v-bind="progressProps"
      >
        <animate
          attributeName="width"
          values="140;80"
          dur="4s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="translate"
          values="-140 0;308 0"
          dur="2s"
          repeatCount="indefinite"
        />
      </rect>
    </g>
  </svg>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { v4 as uuidv4 } from 'uuid'

export enum ProgressIndicatorType {
  Determine = 'determine',
  Intermediate = 'intermediate',
}

@Component
export default class ProgressIndicator extends Vue {
  /**
   * Use for different operations
   */
  @Prop({ default: ProgressIndicatorType.Intermediate }) readonly type!: ProgressIndicatorType

  /**
   * Define the progress in determine type. Range is 0 - 100.
   */
  @Prop({ default: 0 }) readonly value!: number

  uid = uuidv4()

  get clipPathID() {
    return `progress-indicator-${this.uid}`
  }

  get isIntermediate() {
    return this.type === ProgressIndicatorType.Intermediate
  }

  get normalizedProgress() {
    return Math.max(0, Math.min(100, this.value)) / 100
  }

  get progressWidth() {
    if (this.isIntermediate) {
      return 70
    }
    return this.normalizedProgress * 154 + 16
  }

  get progressProps() {
    return {
      class: [
        'text-like-cyan',
        'fill-current',
      ],
      x: -16,
      width: this.progressWidth,
      height: 16,
      rx: 8,
    }
  }
}
</script>
