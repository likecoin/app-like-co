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
    <AlertBanner
      :secondary-button-text="$t('migration_alert_banner_button')"
      @click-secondary-button="onClickAlertBanner"
    >
      <div class="flex items-center justify-center gap-[8px]">
        <img
          class="h-[48px]"
          src="~/assets/images/migration_alert.png"
          alt=""
        />
        <p class="text-sm" v-html="migrationBannerText" />
      </div>
    </AlertBanner>
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
import { IS_CHAIN_UPGRADING, BOOK_COM_DOMAIN } from '~/constant'

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


  get migrationBannerText() {
      return this.$t('migration_alert_banner', {
        link: `<a href="${BOOK_COM_DOMAIN}" target="_blank" rel="noopener noreferrer" class="font-semibold text-like-green">
          ${this.$t('migration_target_site_name')}</a>`,
      });
    }

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

  // eslint-disable-next-line class-methods-use-this
  onClickAlertBanner() {
    window.open(BOOK_COM_DOMAIN, '_blank', 'noopener noreferrer')
  }
}
</script>
