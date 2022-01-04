<template>
  <RootLayout>
    <AppHeader />
    <Page
      v-if="!currentAddress"
      class="justify-center"
    >
      <ConnectWalletDialog
        :is-opened="true"
        @quit="$router.go(-1)"
      />
      <ConnectLikerIdDialog />
    </Page>
    <template v-else>
      <Nuxt class="min-h-full" />
      <AppFooter/>
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
