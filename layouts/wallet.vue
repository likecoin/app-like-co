<template>
  <RootLayout @connect-wallet-dialog-quit="$router.go(-1)">
    <template v-if="sessionWallet">
      <AppHeader />
      <Nuxt class="min-h-full" />
      <AppFooter
        :class="{ hidden: isHideFooter }"
      />
    </template>
    <div
      v-else-if="isSignInLoading"
      class="flex items-center justify-center w-full min-h-screen"
    >
      <Card >
        <Label :text="$t('general.signIn.loading')" />
      </Card>
    </div>
  </RootLayout>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import logTrackerEvent, { setLoggerUser } from '~/utils/logger'


const walletModule = namespace('wallet')
const bookApiModule = namespace('book-api')


@Component
export default class WalletLayout extends Vue {
  @walletModule.Getter('getWalletAddress') walletAddress!: string
  @walletModule.Action('disconnectWallet') disconnectWallet!: () => void
  @walletModule.Action('openConnectWalletModal') openConnectWalletModal!: (params: { language: string, fullPath?: string }) => Promise<any>
  @walletModule.Action('initWallet') initWallet!: (params: { method: any, accounts: any, offlineSigner?: any }) => Promise<any>
  @walletModule.Action('signMessageMemo') signMessageMemo!: (action: string, permissions?: string[]) => Promise<any>
  @walletModule.Getter('getSigner') signer!: any
  @bookApiModule.Getter('getSessionWallet') sessionWallet!: string
  @bookApiModule.Action('restoreSession') restoreSession!: () => void
  @bookApiModule.Action('authenticate') authenticate!: ({ inputWallet, signature }: { inputWallet?: string, signature?: any }) => Promise<any>
  @bookApiModule.Action('clearSession') clearSession!: () => void

  @walletModule.Action toggleAlert!: (
    isShow: boolean,
    error: string,
    severity: string
  ) => void

  isSignInLoading = false

  get isHideFooter() {
    return this.$route.path.includes('/nft/purchase/') || this.$route.query.layout === 'popup';
  }

  async mounted() {
    await this.restoreSession()
    if (!this.sessionWallet) {
      this.isSignInLoading = true
      const connection = await this.openConnectWalletModal({
        language: this.$i18n.locale.split('-')[0],
        fullPath: this.$route.fullPath,
      })
      // Re-login
      try {
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
          await this.initWallet(connection)
          if (!this.walletAddress || !this.signer) return
          const signature = await this.signMessageMemo('authorize', [
            'profile',
            'read:nftbook',
            'write:nftbook',
            'read:nftcollection',
            'write:nftcollection',
          ])
          if (!signature) {
            return
          }
          await this.authenticate({
            inputWallet: this.walletAddress,
            signature,
          })
        }
        else {
          this.$router.go(-1)
        }
      } catch (error) {
        this.disconnectWallet()
        this.clearSession()
        // eslint-disable-next-line no-console
        console.error('handleConnectWalletButtonClick error', error)
      }
      finally {
        this.isSignInLoading = false
      }
    }
  }

  @Watch('walletAddress')
  handleWalletAddressChange(walletAddress: string) {
    if (!walletAddress) {
      this.$router.replace(this.localeLocation({ name: 'index' })!)
    }
  }
}
</script>
