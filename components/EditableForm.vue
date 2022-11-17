<template>
  <div>
    <div
      :class="[
        'mx-auto',
        'w-full',
        'border-[2px]',
        'border-like-cyan',
        'rounded-[24px]',
        'py-[24px]',
        'px-[32px]',
      ]"
    >
      <div class="flex items-center justify-between">
        <Label v-if="message" :text="message" />
        <Label
          class="text-medium-gray"
          content-class="underline cursor-pointer"
          :text="guideMessage"
          @click.native="isOpenDialog = true"
        >
          <template #prepend>
            <IconEdit />
          </template>
        </Label>
      </div>
    </div>
    <Dialog
      v-model="isOpenDialog"
      :has-padding="false"
      preset="custom"
      @close="messageInput = ''"
    >
      <ContentCard
        class="w-[480px] min-w-full"
        :title="$t('NFTPortal.label.message')"
      >
        <template #label-prepend>
          <IconEdit />
        </template>

        <FormField
          :label="$t('NFTPortal.textfield.label.message')"
          class="mb-[12px]"
        >
          <TextField
            :value="message"
            :error-message="errorMessage"
            :placeholder="placeholder"
            @input="(value) => (messageInput = value)"
          />
        </FormField>

        <Button class="ml-auto" preset="secondary" @click="handleClickConfirm">
          {{ $t('UploadForm.button.confirm') }}
        </Button>
      </ContentCard>
    </Dialog>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class UploadForm extends Vue {
  @Prop(Number) readonly step: number | undefined
  @Prop(String) readonly placeholder: string | undefined

  isOpenDialog: boolean = false
  message: string = ''
  messageInput: string = ''

  get guideMessage() {
    return this.message
      ? this.$t('NFTPortal.textfield.guide.edit')
      : this.$t('NFTPortal.textfield.guide.add')
  }

  get errorMessage() {
    if (this.message.length > 256) {
      return this.$t('IscnRegisterForm.warning.exceeded', {
        current: this.message.length,
        limit: 256,
      })
    }
    return undefined
  }

  handleClickConfirm() {
    this.message = this.messageInput
    this.isOpenDialog = false
    this.$emit('message', this.message)
  }
}
</script>
