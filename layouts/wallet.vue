<template>
  <RootLayout @connect-wallet-dialog-quit="$router.go(-1)">
    <template v-if="currentAddress">
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

const signerModule = namespace('signer')
const walletModule = namespace('wallet')

@Component
export default class WalletLayout extends Vue {
  @walletModule.State('isShowConnectDialog') isShowConnectWalletDialog!: boolean
  @walletModule.Action('toggleConnectDialog') toggleConnectWalletDialog!: (
    isShow: boolean
  ) => void

  @walletModule.Action toggleAlert!: (
    isShow: boolean,
    error: string,
    severity: string
  ) => void

  @signerModule.Getter('getAddress') currentAddress!: string

  get isHideFooter() {
    return this.$route.path.includes('/nft/purchase/') || this.$route.query.layout === 'popup';
  }

  mounted() {
    if (!this.currentAddress) {
      this.toggleConnectWalletDialog(true)
    }
  }

  @Watch('currentAddress')
  handleWalletAddressChange(walletAddress: string) {
    if (walletAddress) {
      this.toggleConnectWalletDialog(false)
    } else {
      this.$router.replace(this.localeLocation({ name: 'index' })!)
    }
  }
}
</script>
