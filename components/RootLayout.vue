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

const bookApiModule = namespace('book-api')


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
  @bookApiModule.Action('restoreAuthSession') restoreSession!: () => void

  @Prop({ default: 'bg-light-gray' }) readonly bgClass!: string

  isOpenChainUpgradeBlockingDialog = false

  async mounted() {
    this.isOpenChainUpgradeBlockingDialog = !!IS_CHAIN_UPGRADING
    await this.restoreSession()
  }

  handleChainUpgradeBlockingDialogClose() {
    this.isOpenChainUpgradeBlockingDialog = false
  }

  handleKeplrWarningClose() {
    this.$router.go(-1)
  }
}
</script>
