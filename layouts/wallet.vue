<template>
  <RootLayout>
    <AppHeader />
    <div v-if="!currentAddress">
      <h3>Please connect to your wallet first</h3>
    </div>
    <template v-else>
      <Nuxt />
    </template>
  </RootLayout>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue'
// eslint-disable-next-line import/no-extraneous-dependencies
import { mapGetters } from 'vuex';

export default Vue.extend({
  computed: {
    ...mapGetters('signer', { currentAddress: 'getAddress' }),
  },
})
</script>
