<template>
  <div class="flex flex-row flex-nowrap w-min mb-[8px]">
    <IconStepDot
      v-for="(item, index) in 4"
      :key="item"
      :color="step === index + 1 ? '#50E3C2' : '#EBEBEB'"
      class="ml-[16px]"
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
