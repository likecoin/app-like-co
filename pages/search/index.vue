<template>
  <div class="container flex flex-col items-center mx-auto">
      <div v-if="!records">
        Loading
      </div>
      <search-results v-else :records="records"/>
    </div>
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
  computed: {
    ...mapGetters('iscn', ['getISCNById']),
    iscnIds(): string[] {
      try {
        const ids = JSON.parse(this.$route.params.iscnIds);
        return ids;
      } catch (err) {
        console.error(err);
      }
      return [];
    },
    records() {
      return (this.iscnIds as string []).map(id => this.getISCNById(id));
    },
  },
  async mounted() {
    const iscnIds: string[] = this.iscnIds as string[] ;
    if (!iscnIds.length) {
      this.$router.push({ name: 'index' });
      return;
    }
    const promises: Promise<parsedISCNRecord[]>[] = [];
    iscnIds.forEach((iscnId) => {
      if (!this.getISCNById(iscnId)) {
        promises.push(this.fetchISCNById(iscnId));
      }
    })
    await Promise.all(promises);
  },
  methods: {
    ...mapActions('iscn', ['fetchISCNById']),
  }
})
</script>
