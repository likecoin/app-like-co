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
      <Dialog
        :open="isOpenChainUpgradeBlockingDialog"
        :has-close-button="false"
        :header-text="$t('ChainUpgrade.header')"
        @close="handleChainUpgradeBlockingDialogClose"
      >
        <div
          :class="[
            'text-left',
            'whitespace-pre-line',
            'leading-8',
            'pt-[18px]',
            'pb-[24px]',
          ]"
        >
          <i18n path="ChainUpgrade" tag="div">
            <template #announcement>
              <a
                v-t="`announcement`"
                :class="['underline', 'text-like-green', 'font-medium']"
                href="https://blog.like.co/likecoin-chain-upgrade-laichikok-overview/"
                target="_blank"
              />
            </template>
          </i18n>
        </div>
      </Dialog>
    </DialogContainer>

    <DialogContainer>
      <ConnectWalletDialog
        :is-opened="isShowConnectWalletDialog"
        @quit="handleConnectWalletDialogQuit"
        @close="handleConnectWalletDialogClose"
      />
      <ConnectLikerIdDialog @quit="toggleConnectWalletDialog(true)" />
    </DialogContainer>
    <Snackbar
      :open="isShowKeplrWarning"
      preset="warn"
      @close="handleKeplrWarningClose"
    >
      <i18n path="error.not.found.keplr" tag="div">
        <template #keplr>
          <a
            v-t="$t('error.not.found.keplr.name')"
            :class="['underline', 'text-white', 'font-medium']"
            :href="$t('error.not.found.keplr.link')"
            target="_blank"
          />
        </template>
      </i18n>
    </Snackbar>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing'
import { IS_CHAIN_UPGRADING } from '~/constant'

const walletModule = namespace('wallet')
const signerModule = namespace('signer')
const uiModule = namespace('ui')

@Component({
  head() {
    const isDesktopViewMode: boolean =
      this.$store.getters['ui/isDesktopViewMode']
    const contentWidth = isDesktopViewMode
      ? 'width=1024, initial-scale=1, minimum-scale=1'
      : 'width=device-width'

    return {
      htmlAttrs: {
        class: this.$props.bgClass,
      },
      meta: [{ hid: 'viewport', name: 'viewport', content: contentWidth }],
    }
  },
})
export default class RootLayout extends Vue {
  @walletModule.State('isShowConnectDialog') isShowConnectWalletDialog!: boolean
  @walletModule.State isShowKeplrWarning!: boolean
  @walletModule.Getter('getWalletAddress') walletAddress!: string
  @walletModule.Getter('getSigner') signer!: OfflineSigner | null
  @walletModule.Action initIfNecessary!: () => Promise<boolean>
  @walletModule.Action('reset') resetWallet!: () => void
  @walletModule.Action('toggleConnectDialog') toggleConnectWalletDialog!: (
    isShow: boolean
  ) => void

  @walletModule.Action('toggleKeplrWarning') toggleKeplrWarningSnackbar!: (
    isShow: boolean
  ) => void

  @signerModule.Action updateSignerInfo!: (arg0: {
    signer: OfflineSigner | null
    address: string
  }) => void

  @uiModule.Action('init') initUIStore!: () => void

  @Prop({ default: 'bg-light-gray' }) readonly bgClass!: string

  isOpenChainUpgradeBlockingDialog = false

  async mounted() {
    this.initUIStore();
    const isInited = await this.initIfNecessary();
    if (isInited) {
      this.updateSignerInfo({
        address: this.walletAddress,
        signer: this.signer,
      })
    }
    this.isOpenChainUpgradeBlockingDialog = !!IS_CHAIN_UPGRADING
  }

  handleChainUpgradeBlockingDialogClose() {
    this.isOpenChainUpgradeBlockingDialog = false
  }

  handleConnectWalletDialogClose() {
    this.toggleConnectWalletDialog(false)
  }

  handleConnectWalletDialogQuit() {
    this.handleConnectWalletDialogClose()
    this.$emit('connect-wallet-dialog-quit')
  }

  handleKeplrWarningClose() {
    this.toggleKeplrWarningSnackbar(false)
  }
}
</script>
