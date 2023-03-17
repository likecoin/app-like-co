<template>
  <RootLayout @connect-wallet-dialog-quit="$router.go(-1)">
    <template v-if="walletAddress">
      <AppHeader />
      <Nuxt class="min-h-full" />
      <AppFooter
        :class="{ hidden: isHideFooter }"
      />
    </template>
  </RootLayout>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import logTrackerEvent, { setLoggerUser } from '~/utils/logger'


const walletModule = namespace('wallet')

@Component
export default class WalletLayout extends Vue {
  @walletModule.Getter('getWalletAddress') walletAddress!: string
  @walletModule.Action('openConnectWalletModal') openConnectWalletModal!: (params: { language: string }) => Promise<any>
  @walletModule.Action('initWallet') initWallet!: (params: { method: any, accounts: any, offlineSigner?: any }) => Promise<any>
  @walletModule.Action('restoreSessionIfNecessary') restoreSessionIfNecessary!: () => Promise<any>


  @walletModule.Action toggleAlert!: (
    isShow: boolean,
    error: string,
    severity: string
  ) => void

  get isHideFooter() {
    return this.$route.path.includes('/nft/purchase/') || this.$route.query.layout === 'popup';
  }

  async mounted() {
    await this.restoreSessionIfNecessary()
    if (!this.walletAddress) {
      const connection = await this.openConnectWalletModal({
        language: this.$i18n.locale.split('-')[0],
      })
      // Re-login
      if (connection) {
        const { method, accounts } = connection
        logTrackerEvent(
          this,
          'user',
          `connected_wallet_${method}`,
          'connected_wallet',
          1,
        )
        setLoggerUser(this, {
          wallet: accounts[0].address,
          method,
        })
        return this.initWallet(connection)
      }
      return this.$router.go(-1)
    }
    return true
  }

  @Watch('walletAddress')
  handleWalletAddressChange(walletAddress: string) {
    if (!walletAddress) {
      this.$router.replace(this.localeLocation({ name: 'index' })!)
    }
  }
}
</script>
