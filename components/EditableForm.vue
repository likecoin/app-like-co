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
      @close="tempMessage = ''"
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
            :error-message="validateField(message, 256, true)"
            :placeholder="placeholder"
            @input="(value) => (tempMessage = value)"
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
  tempMessage: string = ''

  get guideMessage() {
    return this.message
      ? this.$t('NFTPortal.textfield.guide.edit')
      : this.$t('NFTPortal.textfield.guide.add')
  }

  validateField(val: any, limit: number, least: number = 0) {
    if (val && val.length > limit) {
      return this.$t('IscnRegisterForm.warning.exceeded', {
        current: val.length,
        limit,
      })
    }
    if (val && least > 0 && val.length < least) {
      return this.$t('IscnRegisterForm.warning.shortage', {
        least,
      })
    }
    return undefined
  }

  handleClickConfirm() {
    this.message = this.tempMessage
    this.isOpenDialog = false
    this.$emit('message', this.message)
  }
}
</script>
