<template>
  <div class="flex flex-row flex-nowrap w-min mb-[8px]">
    <IconStepDot
      v-for="(item, index) in totalStep"
      :key="item"
      :class="[
        'ml-[16px]',
        step === index + 1 ? 'text-like-cyan' : 'text-shade-gray',
      ]"
    />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Stepper extends Vue {
  @Prop(Number) readonly step: number | undefined
  @Prop(Number) readonly totalStep: number | undefined
}
</script>
