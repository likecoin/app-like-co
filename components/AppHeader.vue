<!-- Please remove this file from your project -->
<template>
  <nav class="py-8 flex content-center">
    <div class="flex bg-gray-200 mx-auto p-6 rounded-lg divide-white divide-x-2">
      <nuxt-link class="px-2 text-center" :to="{ name: 'index' }">#DePub</nuxt-link>
      <nuxt-link class="px-2 text-center" :to="{ name: 'works' }">Your publishing</nuxt-link>
      <a class="px-2 text-center" target="_blank" rel="noopener" href="https://stale.like.co">Delegate and vote</a>
    </div>
    <div class="bg-green-300 absolute right-0 rounded-lg mx-2 my-4 p-2">
      <a v-if="currentAddress">{{ currentAddress }}</a>
      <button v-else @click="onClickLoginKeplr">Keplr</button>
    </div>
  </nav>
</template>

<script lang="ts">
import { OfflineSigner } from '@cosmjs/proto-signing'
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

const signerModule = namespace('~/store/signer')
const keplrModule = namespace('~/store/keplr')

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
