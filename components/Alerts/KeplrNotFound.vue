<template>
  <Snackbar :open="isOpen" preset="warn" @close="$emit('close')">
    <i18n
      :path="
        isBrowserNotSupported
          ? 'error.not.support.browser'
          : 'error.not.found.keplr'"
      tag="div"
    >
      <Link
        place="keplr"
        :class="['underline', 'text-white', 'font-medium']"
        :text="$t('error.not.found.keplr.name')"
        :href="$t('error.not.found.keplr.link')"
        >{{ $t('error.not.support.browser.app') }}
      </Link>
      <Link
        place="LikerLandApp"
        class="text-white"
        :text="$t('error.not.support.browser.app')"
        href="https://liker.land/getapp"
        :is-inline="true"
        >{{ $t('error.not.support.browser.app') }}
      </Link>
    </i18n>
  </Snackbar>
</template>

<script lang="ts">
import { Vue, Component, ModelSync } from 'vue-property-decorator'

declare const navigator: any

@Component
export default class KeplrNotFound extends Vue {
  @ModelSync('open', 'toggle', { type: Boolean, default: false })
  isOpen!: boolean

  isBrowserNotSupported = false
  
  mounted(){
    this.checkViewModelAndBrowser()
  }

  async checkViewModelAndBrowser() {
    const { userAgent } = navigator
    if (
      !userAgent.match(/chrome|chromium|crios/i) &&
      !userAgent.match(/edg/i) &&
      !(navigator.brave && (await navigator.brave.isBrave()))
    ) {
      this.isBrowserNotSupported = true
    }
  }
}
</script>


