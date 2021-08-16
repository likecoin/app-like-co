<template>
  <div class="bg-white max-w-[280px] py-[32px] px-[24px] rounded-[24px]">
    <Label
      class="w-min"
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
    <div v-if="imgSrc">
      <img
        ref="iscnImg"
        class="block w-full mt-[24px] rounded-[8px]"
        :src="imgSrc"
      />
      <FormField class="mt-[8px]" :label="$t('iscn.meta.card.preview')" />
    </div>
    <FormField
      v-for="(item, name) in exifInfo"
      :key="item.key"
      class="mb-[8px]"
      :label="name"
      direction="row"
      label-classes="min-w-[98px]"
    >
      {{ item }}
    </FormField>
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

  async extractEXIFInfo() {
    const imgElement = this.$refs.iscnImg
    if (imgElement)
      this.exifInfo = await exifr.parse(imgElement as HTMLImageElement)
  }

  mounted() {
    this.extractEXIFInfo()
  }

  @Watch('imgSrc')
  onImgSrcChanged() {
    this.$nuxt.$nextTick(this.extractEXIFInfo)
  }
}
</script>
