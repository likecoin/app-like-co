<!-- Please remove this file from your project -->
<template>
  <div class="nav">
    <div class="right-header">
      <a v-if="currentAddress">{{ currentAddress }}</a>
      <button v-else @click="onClickLoginKeplr">Keplr</button>
    </div>
  </div>
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

<style scoped>

.nav {
  top:0;
  min-height: 20px;
}

</style>