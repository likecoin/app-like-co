<template>
  <RootLayout @connect-wallet-dialog-quit="$router.go(-1)">
    <template v-if="currentAddress">
      <AppHeader />
      <Nuxt class="min-h-full" />
      <AppFooter/>
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
  @walletModule.Action('toggleConnectDialog') toggleConnectWalletDialog!: (isShow: boolean) => void

  @signerModule.Getter('getAddress') currentAddress!: string

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
