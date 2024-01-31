<template>
  <div
    :class="[
      'flex',
      'justify-end',
      'items-center',
      'w-full',
      'pt-[24px]',
      'gap-[8px]',
      'lg:pt-0',
    ]"
  >
    <div
      v-if="isIscnOwner"
      class="flex justify-center items-center gap-[4px] mr-[8px]"
    >
      <Button preset="plain" text="Edit ISCN" @click="handleEdit">
        <template #prepend>
          <IconEdit />
        </template>
      </Button>
      <div class="h-[20px] w-[2px] bg-medium-gray" />
    </div>
    <Button
      preset="tertiary"
      :text="$t('NFTPortal.button.download.iscn')"
      @click="handleClickDownload"
    >
      <template #prepend>
        <IconDownload />
      </template>
    </Button>
    <Button
      v-if="isShowMintButton && isNftBook"
      preset="secondary"
      class="w-full lg:w-auto"
      :text="$t('NFTPortal.button.mint.book')"
      @click="clickMintNFTBook"
    />
    <Button
      v-if="isShowMintButton && !isNftBook"
      preset="secondary"
      class="w-full lg:w-auto"
      :to="
        localeLocation({
          name: 'nft-iscn-iscnId',
          params: { iscnId: iscnId },
          query: mintQueries,
        })
      "
      :text="$t('NFTPortal.button.mint')"
    />
    <div
      v-if="!!classId"
      class="flex justify-center items-center p-[4px] rounded-[12px] border-like-cyan-light border-[2px]"
    >
      <Button
        preset="tertiary"
        :text="$t('NFTPortal.button.check.nft')"
        :href="likerlandNftUrl"
        target="_blank"
      >
        <template #append>
          <IconArrowRight />
        </template>
      </Button>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class IscnEditBar extends Vue {
  @Prop({ default: false }) readonly isIscnOwner!: boolean
  @Prop({ default: false }) readonly isShowMintButton!: boolean
  @Prop({ default: false }) readonly isNftBook!: boolean
  @Prop(String) readonly iscnId: string | undefined
  @Prop({ default: null }) readonly mintQueries!: any | null
  @Prop(String) readonly classId!: string
  @Prop(String) readonly likerlandNftUrl!: string

  handleClickDownload() {
    this.$emit('click-download', this.iscnId)
  }

  handleEdit() {
    this.$emit('click-edit', this.iscnId)
  }

  handleClickMintNFTBook() {
    this.$emit('click-mint-book', this.iscnId)
  }
}
</script>
