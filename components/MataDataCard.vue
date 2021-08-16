<template>
  <div class="bg-white max-w-[280px] py-[32px] px-[24px] rounded-[24px]">
    <div class="w-min">
      <Label
        text="File Info"
        tag="div"
        preset="p5"
        valign="middle"
        content-class="font-semibold whitespace-nowrap text-like-green"
        prepend-class="text-like-green"
      >
        <template #prepend>
          <IconInfo />
        </template>
      </Label>
    </div>
    <div class="mt-[24px]">
      <div class="rounded-[8px] overflow-hidden">
        <img v-if="imgSrc" class="w-full" :src="imgSrc" />
      </div>
      <FormField v-if="imgSrc" class="mt-[8px]" label="File Preview" />
    </div>
    <div v-for="(item, name) in data" :key="item.key">
      <FormField
        class="mb-[8px]"
        :label="name"
        direction="row"
        label-classes="min-w-[98px]"
      >
        {{ item }}
      </FormField>
    </div>
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class MataDataCard extends Vue {
  @Prop(String) readonly imgSrc: String | undefined
  @Prop(Object) readonly data: Object | undefined
}
</script>