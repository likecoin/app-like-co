<template>
  <div
    :class="[
      'flex',
      'justify-center',
      'items-center',
      'gap-[8px]',
    ]"
  >
    <div
      v-if="isIscnOwner"
      class="flex justify-center items-center gap-[4px] mr-[8px]"
    >
      <Button preset="plain" :text="$t('IscnEditInfo.button.edit')" @click="handleEdit">
        <template #prepend>
          <IconEdit />
        </template>
      </Button>
      <div class="h-[20px] w-[2px] bg-medium-gray" />
    </div>
    <Button
      class="flex flex-shrink-0"
      preset="tertiary"
      :text="$t('NFTPortal.button.download.iscn')"
      @click="handleClickDownload"
    >
      <template #prepend>
        <IconDownload />
      </template>
    </Button>
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
import { extractIscnIdPrefix } from '~/utils/ui'

@Component
export default class IscnEditBar extends Vue {
  @Prop({ default: false }) readonly isIscnOwner!: boolean
  @Prop(String) readonly iscnId: string | undefined
  @Prop(String) readonly classId!: string
  @Prop(String) readonly likerlandNftUrl!: string

   get mintQueries() {
    return this.$route.query;
  }

  handleClickDownload() {
    this.$emit('click-download', this.iscnId)
  }

  handleEdit() {
    const iscnIdPrefix = extractIscnIdPrefix(this.iscnId)
    this.$emit('click-edit', iscnIdPrefix)
  }
}
</script>
