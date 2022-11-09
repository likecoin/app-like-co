<template>
  <Card :class="['p-[32px]', 'w-full']" :has-padding="false">
    <!-- header -->
    <div :class="['flex', 'justify-between', 'items-center','mb-[32px]']">
      <Label
        class="w-min"
        :text="title"
        tag="div"
        preset="p5"
        valign="middle"
        content-class="font-semibold whitespace-nowrap text-like-green"
        prepend-class="text-like-green"
      >
        <template #prepend>
          <slot name="label-prepend" />
        </template>
      </Label>
      <div v-if="step && totalStep" :class="['flex', 'flex-col', 'items-end']">
        <Stepper :step="step" :total-step="totalStep" />
        <Label
          preset="p6"
          :text="$t('Registration.step', { step: step, total: totalStep })"
          class="text-medium-gray"
        />
      </div>
    </div>
    <!-- guide text -->
    <!-- body -->
    <slot />
  </Card>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class ContentCard extends Vue {
  @Prop(String) readonly title!: string

  @Prop(Number) readonly step!: number

  @Prop(Number) readonly totalStep!: number
}
</script>
