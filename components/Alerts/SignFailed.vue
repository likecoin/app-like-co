
<template>
  <Snackbar :open="isOpenSnackbar" preset="warn" @close="handleSnackbarClose">
    <i18n :path="errorAlert" tag="div" class="flex items-center flex-nowrap">
      <Link
        place="buy"
        :class="['text-white', 'ml-[2px]']"
        nofollow="true"
        href="https://go.crisp.chat/chat/embed/?website_id=5c009125-5863-4059-ba65-43f177ca33f7"
      >
        {{ $t('IscnRegisterForm.error.buy') }}
      </Link>
      <div
        place="login"
        class="flex flex-nowrap items-center gap-[4px] ml-[8px] text-white underline font-bold cursor-pointer"
        @click="handleReLogin"
      >
        {{ $t('IscnRegisterForm.error.reLogIn') }}
        <IconSignIn />
      </div>
    </i18n>
  </Snackbar>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

import logTrackerEvent, { setLoggerUser } from '~/utils/logger'

const walletModule = namespace('wallet')

export enum ErrorType {
  INSUFFICIENT_BALANCE = 'Error: INSUFFICIENT_BALANCE',
  USER_NOT_ISCN_OWNER = 'Error: USER_NOT_ISCN_OWNER',
}

@Component
export default class SignFailed extends Vue {
  @walletModule.State isOpenSnackbar!: boolean
  @walletModule.State errorType!: string
  @walletModule.Action closeSnackbar!: () => void
  @walletModule.Action('disconnectWallet') disconnectWallet!: () => void
  @walletModule.Action('openConnectWalletModal')
  openConnectWalletModal!: (params: { language: string, fullPath?: string }) => Promise<any>

  @walletModule.Action('initWallet') initWallet!: (params: {
    method: any
    accounts: any
    offlineSigner?: any
  }) => Promise<any>

  get errorAlert() {
    switch (this.errorType) {
      case ErrorType.INSUFFICIENT_BALANCE:
        return 'IscnRegisterForm.error.insufficient_with_buy'

      case ErrorType.USER_NOT_ISCN_OWNER:
        return 'IscnRegisterForm.error.notIscnOwner'
      default:
        return this.errorType
    }
  }

  handleSnackbarClose() {
    this.closeSnackbar()
  }

  async handleReLogin() {
    const { currentRoute } = this.$router
    const { path, query, hash, params } = currentRoute
    await this.disconnectWallet()
    const connection = await this.openConnectWalletModal({
      language: this.$i18n.locale.split('-')[0],
      fullPath: this.$route.fullPath,
    })
    if (connection) {
      const { method, accounts } = connection
      logTrackerEvent(
        this,
        'user',
        `connected_wallet_${method}`,
        're-connected_wallet',
        1,
      )
      setLoggerUser(this, {
        wallet: accounts[0].address,
        method,
      })
      this.$router.push({ path, query, hash, params })
    }
    this.handleSnackbarClose()
  }
}
</script>
