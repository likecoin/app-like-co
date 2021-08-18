<template>
  <RootLayout>
    <AppHeader />
    <Page
      v-if="!currentAddress"
      class="justify-center"
    >
      <Card>
        <Label
          :text="$t('error.not.connect.wallet')"
          align="center"
        />
      </Card>
    </Page>
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
