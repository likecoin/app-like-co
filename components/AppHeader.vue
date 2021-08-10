<!-- Please remove this file from your project -->
<template>
  <nav class="flex content-center py-8">
    <div class="flex p-6 mx-auto bg-gray-200 divide-x-2 divide-white rounded-lg">
      <nuxt-link
        class="px-2 text-center"
        :to="{ name: 'index' }"
      >{{ $t('AppHeader.tabBar.button.depub') }}</nuxt-link>
      <nuxt-link
        class="px-2 text-center"
        :to="{ name: 'works-index' }"
      >{{ $t('AppHeader.tabBar.button.publishing') }}</nuxt-link>
      <a
        class="px-2 text-center"
        target="_blank"
        rel="noopener"
        href="https://stake.like.co"
      >{{ $t('AppHeader.tabBar.button.stake') }}</a>
    </div>
    <div class="absolute right-0 p-2 mx-2 my-4 bg-green-300 rounded-lg">
      <a v-if="currentAddress">{{ currentAddress }}</a>
      <button v-else @click="onClickLoginKeplr">{{ $t('AppHeader.login.button') }}</button>
    </div>
  </nav>
</template>

<script lang="ts">
import { OfflineSigner } from '@cosmjs/proto-signing'
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

const signerModule = namespace('signer')
const keplrModule = namespace('keplr')

@Component
export default class AppHeader extends Vue{
  @signerModule.Getter('getAddress') currentAddress!: string
  @signerModule.Action updateSignerInfo!: (arg0: { signer: OfflineSigner|null; address: string }) => void
  @keplrModule.Getter('getWalletAddress') keplrWallet!: string
  @keplrModule.Getter('getSigner') keplrSigner!: OfflineSigner | null
  @keplrModule.Action initKeplr!: () => Promise<boolean>

  async onClickLoginKeplr() {
    await this.initKeplr()
    await this.updateSignerInfo({
      signer: this.keplrSigner,
      address: this.keplrWallet,
    })
  }
}
</script>
