<template>
  <div class="bg-white max-w-[280px] py-[32px] px-[24px] rounded-[24px]">
    <div class="w-min">
      <Label
        :text="$t('iscn.meta.card.title')"
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
    <div v-if="imgSrc" class="mt-[24px]">
      <div class="rounded-[8px] overflow-hidden">
        <img ref="iscnImg" class="w-full" :src="imgSrc" />
      </div>
      <FormField v-if="imgSrc" class="mt-[8px]" label="File Preview" />
    </div>
    <div v-for="(item, name) in exifInfo" :key="item.key">
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
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import exifr from 'exifr'

@Component
export default class MetadataCard extends Vue {
  @Prop(String) readonly imgSrc: String | undefined
  @Prop(Object) readonly data: Object | undefined
  exifInfo = {}

  async getExifInfo() {
    const imgElement = this.$refs.iscnImg
    if (imgElement)
      this.exifInfo = await exifr.parse(imgElement as HTMLImageElement)
  }

  mounted() {
    this.getExifInfo()
  }

  @Watch('imgSrc')
  onImgSrcChanged() {
    this.$nuxt.$nextTick(() => {
      this.getExifInfo()
    })
  }
}
</script>