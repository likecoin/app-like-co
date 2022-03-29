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
      <ProgressIndicator v-if="isLoading" class="mt-[24px]"/>
      <img
        ref="iscnImg"
        class="block w-full mt-[24px] rounded-[8px]"
        :src="imgSrc"
        @load="isLoading = false"
      />
      <FormField class="mt-[8px]" :label="$t('iscn.meta.card.preview')" />
    </template>
    <FormField
      v-for="(item, name) in exifInfo"
      :key="isFromFilterEXIF ? $t(`iscn.exif.label.${name}`) : name"
      class="mb-[8px]"
      :label="isFromFilterEXIF ? $t(`iscn.exif.label.${name}`) : name"
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
  /**
   * Specifies the path to the image
   */
  @Prop(String) readonly imgSrc: String | undefined

  /**
   * The Filtered EXIF, show on the _iscnId page
   */
  @Prop(Object) readonly filteredExif!: Object

  /**
   * All EXIF, which will be displayed on 'view file info'
   */
  @Prop(Object) readonly allExif!: Object

  exifInfo: Object = {}
  isLoading: boolean = true

  get isFromFilterEXIF() {
    return !!this.filteredExif
  }

  get isFromAllEXIF() {
    return !!this.allExif
  }

  @Watch('imgSrc')
  onImgSrcChanged() {
    if (!this.isFromFilterEXIF && !this.isFromAllEXIF) {
      this.$nuxt.$nextTick(this.extractEXIFInfo)
    }
  }

  @Watch('filteredExif')
  onFilteredExifChange() {
    this.exifInfo = this.filteredExif
  }

  mounted() {
    if (this.isFromFilterEXIF) {
      this.exifInfo = this.filteredExif
    } else if (this.isFromAllEXIF) {
      this.exifInfo = this.allExif
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
