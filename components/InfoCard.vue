<template>
  <div
    :class="[
      'w-full',
      'p-[32px]',
      'mb-[16px]',
      'bg-white',
      'rounded-[24px]',
    ]"
  >
    <div
      :class="[
        'flex',
        'flex-row',
        'justify-between',
        'mb-[28px]',
      ]"
    >
      <Label
        class="w-min"
        :text="labelText"
        tag="div"
        preset="p5"
        valign="middle"
        content-class="font-semibold whitespace-nowrap text-like-green"
        prepend-class="text-like-green"
      >
        <template #prepend>
          <slot name="icon" />
        </template>
      </Label>
      <Label
        v-if="timeStamp"
        class="w-min"
        :text="timeStamp"
        tag="div"
        preset="p6"
        valign="middle"
        content-class="font-normal whitespace-nowrap text-medium-gray"
      />
    </div>
    <div>
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class InfoCard extends Vue {
  @Prop(String) readonly labelText: String | undefined
  @Prop(String) readonly timeStamp: String | undefined
}
</script>
