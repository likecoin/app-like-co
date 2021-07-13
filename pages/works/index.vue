<template>
  <div class="container flex flex-col items-center mx-auto">
    <div v-if="!records">
      Loading
    </div>
    <search-results v-else :records="records"/>
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';
// eslint-disable-next-line import/no-extraneous-dependencies
import { mapActions, mapGetters } from 'vuex';
import SearchResults from '~/components/SearchResults.vue';

import { parsedISCNRecord } from '~/utils/cosmos/iscn';

export default Vue.extend({
  components: { SearchResults },
  layout: 'wallet',
  data(): {
    records: parsedISCNRecord[],
  } {
    return {
      records: [],
    };
  },
  computed: {
    ...mapGetters('signer', { currentAddress: 'getAddress' }),
  },
  watch: {
    currentAddress() {
      this.refreshWorks();
    }
  },
  mounted() {
    this.refreshWorks();
  },
  methods: {
    ...mapActions('iscn', ['queryISCNByAddress']),
    async refreshWorks() {
      if (!this.currentAddress) {
        this.records = [];
        return;
      }
      this.records = await this.queryISCNByAddress(this.currentAddress);
    }
  },
})
</script>
