<template>
  <div class="flex-col items-center justify-center mb-[32px]">
    <Label
      class="mx-auto w-min text-like-green"
      :text="$t('NFTPortal.label.message.preview')"
      tag="div"
      preset="p5"
      valign="middle"
      align="center"
      content-class="whitespace-nowrap"
    >
      <template #prepend>
        <IconEye />
      </template>
    </Label>
    <div class="w-full mx-auto max-w-[80%]">
      <EditableForm
        class="my-[18px]"
        :placeholder="$t('NFTPortal.placeholder.message')"
        @message="(value) => $emit('message-change', value)"
      />
      <div class="flex justify-end">
        <UserAvatar :url="avatar" :size="42" />
        <div class="flex-col justify-start ml-[16px]">
          <div class="text-[12px] text-medium-gray">
            {{ $t('NFTPortal.label.creator') }}
          </div>
          <Label class="text-like-green" preset="h5">{{
            displayName | ellipsis
          }}</Label>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

import { getAddressLikerIdMinApi } from '~/constant/api'

import { ellipsis } from '~/utils/ui'

@Component({
  filters: { ellipsis },
})
export default class UploadForm extends Vue {
  @Prop(String) readonly address!: string

  userInfo: any = undefined
  avatar: string = ''
  displayName: string = this.address

  async mounted() {
    try {
      const { data } = await this.$axios.get(
        getAddressLikerIdMinApi(this.address),
      )
      if (data) {
        this.avatar = data?.avatar
        this.displayName = data?.displayName || this.address
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
    }
  }
}
</script>
