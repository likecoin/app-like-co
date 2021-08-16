<template>
  <div class="bg-white max-w-[648px] p-[32px] mb-[16px] rounded-[24px]">
    <div class="flex flex-row justify-between mb-[28px]">
      <div class="w-min">
        <Label
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
      </div>
      <div v-if="timeStamp" class="w-min">
        <Label
          :text="timeStamp"
          tag="div"
          preset="p6"
          valign="middle"
          content-class="font-normal whitespace-nowrap text-medium-gray"
        />
      </div>
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