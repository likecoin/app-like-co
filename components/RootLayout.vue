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

@Component({
  head() {
    return {
      htmlAttrs: {
        class: this.$props.bgClass,
      },
    }
  },
})
export default class RootLayout extends Vue {
  @walletModule.Action('restoreSessionIfNecessary') restoreSessionIfNecessary!: () => Promise<any>

  @Prop({ default: 'bg-light-gray' }) readonly bgClass!: string

  isOpenChainUpgradeBlockingDialog = false

  async mounted() {
    this.isOpenChainUpgradeBlockingDialog = !!IS_CHAIN_UPGRADING
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
