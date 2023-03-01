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

    <AlertsChainUpgrading
      v-model="isOpenChainUpgradeBlockingDialog"
      @close="isOpenChainUpgradeBlockingDialog"
    />

<DialogContainer>
      <Dialog />
    </DialogContainer>

  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing'
import { IS_CHAIN_UPGRADING } from '~/constant'
import { setLoggerUser } from '~/utils/logger'

const walletModule = namespace('wallet')
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
  @walletModule.Getter('getWalletAddress') walletAddress!: string
  @walletModule.Getter('getSigner') signer!: OfflineSigner | null
  @walletModule.Getter('getType') loginMethod!: string
  @walletModule.Action('restoreSession') restoreSession!: () => Promise<any>

  @uiModule.Action('init') initUIStore!: () => void

  @Prop({ default: 'bg-light-gray' }) readonly bgClass!: string

  isOpenChainUpgradeBlockingDialog = false

  async mounted() {
    this.initUIStore()
    await this.restoreSession()
    if (this.walletAddress) {
      await setLoggerUser(this, {
        wallet: this.walletAddress,
        method: this.loginMethod,
      })
    }
    this.isOpenChainUpgradeBlockingDialog = !!IS_CHAIN_UPGRADING
  }

  handleChainUpgradeBlockingDialogClose() {
    this.isOpenChainUpgradeBlockingDialog = false
  }

  handleKeplrWarningClose() {
    this.$router.go(-1)
  }
}
</script>
