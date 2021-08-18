<template>
  <div class="flex flex-row flex-nowrap w-min mb-[8px]">
    <IconStepDot
      v-for="(item, index) in 4"
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
  @Prop(String) readonly step: string | undefined
}
</script>
