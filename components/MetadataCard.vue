<template>
  <Card>
    <Label
      :text="$t('iscn.meta.card.title')"
      tag="div"
      preset="p5"
      valign="middle"
      :class="[{ 'mb-[12px]': !imgSrc }]"
      content-class="font-semibold whitespace-nowrap text-like-green"
      prepend-class="text-like-green"
    >
      <template #prepend>
        <IconInfo />
      </template>
    </Label>
    <template v-if="imgSrc">
      <img
        ref="iscnImg"
        class="block w-full mt-[24px] rounded-[8px]"
        :src="imgSrc"
      />
      <FormField class="mt-[8px]" :label="$t('iscn.meta.card.preview')" />
    </template>
    <FormField
      v-for="(item, name) in exifInfo"
      :key="isFromData ? $t(`iscn.exif.label.${name}`) : name"
      class="mb-[8px]"
      :label="isFromData ? $t(`iscn.exif.label.${name}`) : name"
      direction="row"
      label-classes="min-w-[98px]"
    >
      {{ item }}
    </FormField>
  </Card>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import exifr from 'exifr'

@Component
export default class MetadataCard extends Vue {
  @Prop(String) readonly imgSrc: String | undefined
  @Prop(Object) readonly data!: Object

  exifInfo: Object = {}
  isFromData: boolean = false

  @Watch('imgSrc')
  onImgSrcChanged() {
    this.$nuxt.$nextTick(this.extractEXIFInfo)
  }

  @Watch('data')
  onDataChange() {
    if (this.data) this.exifInfo = this.data
  }

  mounted() {
    if (this.data) {
      this.exifInfo = this.data
      this.isFromData = true
    } else this.extractEXIFInfo()
  }

  async extractEXIFInfo() {
    const imgElement = this.$refs.iscnImg
    if (imgElement) {
      this.exifInfo = await exifr.parse(imgElement as HTMLImageElement)
    }
  }
}
</script>
