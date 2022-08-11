
<template>
  <Snackbar
    :open="isOpenSnackbar"
    preset="warn"
    @close="handleSnackbarClose"
  >
    {{ errorAlert }}
    <Link
      v-if="errorType === 'INSUFFICIENT_BALANCE'"
      :class="['text-white', 'ml-[2px]']"
      href="https://go.crisp.chat/chat/embed/?website_id=5c009125-5863-4059-ba65-43f177ca33f7"
    >
      {{ $t('IscnRegisterForm.error.buy') }}
    </Link>
  </Snackbar>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

const walletModule = namespace('wallet')

export enum ErrorType {
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
}

@Component
export default class SignFaild extends Vue {
  @walletModule.State isOpenSnackbar!: boolean
  @walletModule.State errorType!: string
  @walletModule.State severity!: string
  @walletModule.Action closeSnackbar!: () => void

  get errorAlert() {
    console.log('severity',this.severity)
    switch (this.errorType) {
      case ErrorType.INSUFFICIENT_BALANCE:
        return this.$t('IscnRegisterForm.error.insufficient')
      default:
        return this.errorType
    }
  }

  handleSnackbarClose() {
    this.closeSnackbar()
  }
}
</script>
