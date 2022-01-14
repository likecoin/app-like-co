<template>
  <div
    :class="[
      'flex',
      'flex-col',
      'min-h-screen',
      'text-dark-gray',
      bgClass,
    ]"
  >
    <slot />
    <DialogContainer>
      <ConnectWalletDialog
        :is-opened="isShowConnectWalletDialog"
        @quit="handleConnectWalletDialogQuit"
        @close="handleConnectWalletDialogClose"
      />
      <ConnectLikerIdDialog @quit="toggleConnectWalletDialog(true)" />
    </DialogContainer>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing'

const walletModule = namespace('wallet')
const signerModule = namespace('signer')

@Component({
  head() {
    const isDesktopViewMode = this.$store.getters['ui/isDesktopViewMode']
    console.log(isDesktopViewMode)
    // TODO: Inject proper viewport
    return {
      htmlAttrs: {
        class: this.$props.bgClass,
      },
    }
  },
})
export default class RootLayout extends Vue {
  @walletModule.State('isShowConnectDialog') isShowConnectWalletDialog!: boolean
  @walletModule.Getter('getWalletAddress') walletAddress!: string
  @walletModule.Getter('getSigner') signer!: OfflineSigner | null
  @walletModule.Action initIfNecessary!: () => Promise<boolean>
  @walletModule.Action('reset') resetWallet!: () => void
  @walletModule.Action('toggleConnectDialog') toggleConnectWalletDialog!: (isShow: boolean) => void

  @signerModule.Action updateSignerInfo!: (arg0: {
    signer: OfflineSigner | null
    address: string
  }) => void

  @Prop({ default: 'bg-light-gray' }) readonly bgClass!: string

  async mounted() {
    const isInited = await this.initIfNecessary();
    if (isInited) {
      this.updateSignerInfo({
        address: this.walletAddress,
        signer: this.signer,
      })
    }
  }

  handleConnectWalletDialogClose() {
    this.toggleConnectWalletDialog(false)
  }

  handleConnectWalletDialogQuit() {
    this.handleConnectWalletDialogClose()
    this.$emit('connect-wallet-dialog-quit')
  }
}
</script>
