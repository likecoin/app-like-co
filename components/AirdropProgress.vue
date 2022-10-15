<template>
  <div
    :class="[
      'flex',

      'flex-col',
      'md:flex-row',
      'md:flex-nowrap',

      'items-center',
      'justify-between',
      'bg-like-cyan-extralight',
      'py-[24px]',
      'px-[56px]',
      'w-full',
      'mt-[56px]',
    ]"
  >
    <Label
      :class="[
        'md:mr-[8px]',
        'mb-[12px]',
        'md:mb-[0]',
        'whitespace-pre-line',
        'text-red',
      ]"
      preset="p5"
      >{{ errorMessage }}
    </Label>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class AirdropProgress extends Vue {

  // Error message from empty or ineligible address
  @Prop(String) readonly errorMessage!: string | undefined
}
</script>
