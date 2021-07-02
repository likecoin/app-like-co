<!-- Please remove this file from your project -->
<template>
  <nav class="mx-auto flex">
    <div>
    </div>
    <div class="flex-grow items-center justify-between">
    </div>
    <div class="mx-8 my-2">
      <a v-if="currentAddress">{{ currentAddress }}</a>
      <button v-else @click="onClickLoginKeplr">Keplr</button>
    </div>
  </nav>
</template>

<script la ng="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';
// eslint-disable-next-line import/no-extraneous-dependencies
import { mapActions, mapGetters } from 'vuex';

export default Vue.extend({
  name: 'Header',

  computed: {
    ...mapGetters('keplr', {
      keplrWallet: 'getWalletAddress',
      keplrSigner: 'getSigner',
    }),
    ...mapGetters('signer', { currentAddress: 'getAddress' }),
  },

  methods: {
    ...mapActions('keplr', ['initKeplr']),
    ...mapActions('signer', ['updateSignerInfo']),
    async onClickLoginKeplr() {
      await this.initKeplr();
      await this.updateSignerInfo({
        signer: this.keplrSigner,
        address: this.keplrWallet,
      });
    },
  },
})
</script>
