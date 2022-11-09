<template>
  <ContentCard
    class="max-w-[600px]"
    :title="$t('NFTPortal.label.message')"
    :step="3"
    :total-step="4"
  >
    <template #label-prepend>
      <IconAddToISCN class="w-[20px]" />
    </template>
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
          @message="(value) => (message = value)"
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
    <div class="flex flex-col ml-auto">
      <div v-if="isLoading" class="flex flex-col items-end justify-center">
        <ProgressIndicator />
        <Label
          class="text-[8px] text-medium-gray text-center mt-[8px]"
          align="center"
          >{{ loadingText }}</Label
        >
      </div>
      <Button
        v-else
        class="ml-auto"
        preset="outline"
        :text="buttonText"
        @click="$emit('post-mint-info', message)"
      >
        <template #append>
          <IconArrowRight />
        </template>
      </Button>
    </div>
  </ContentCard>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

import { getAddressLikerIdMinApi } from '~/constant/api'

@Component({
  filters: {
    ellipsis(value: any) {
      const len: number = value.length
      const dots = '...'
      if (!value) return ''
      if (value.length > 20) {
        return value.substring(0, 8) + dots + value.substring(len - 3, len)
      }
      return value
    },
  },
})
export default class UploadForm extends Vue {
  @Prop(String) readonly address!: string

  @Prop({ default: false }) readonly isLoading!: boolean | false

  @Prop(String) readonly loadingText!: string

  message: string = ''
  userInfo: any = undefined
  avatar: string = ''
  displayName: string = this.address

  get buttonText() {
    return this.message
      ? this.$t('NFTPortal.button.next')
      : this.$t('NFTPortal.button.skip')
  }

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
