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
import { IS_CHAIN_UPGRADING } from '~/constant'

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
  @walletModule.Action('restoreSessionIfNecessary') restoreSessionIfNecessary!: () => Promise<any>

  @uiModule.Action('init') initUIStore!: () => void

  @Prop({ default: 'bg-light-gray' }) readonly bgClass!: string

  isOpenChainUpgradeBlockingDialog = false

  async mounted() {
    this.isOpenChainUpgradeBlockingDialog = !!IS_CHAIN_UPGRADING
    this.initUIStore()
    await this.restoreSessionIfNecessary()
  }

  handleChainUpgradeBlockingDialogClose() {
    this.isOpenChainUpgradeBlockingDialog = false
  }

  handleKeplrWarningClose() {
    this.$router.go(-1)
  }
}
</script>
