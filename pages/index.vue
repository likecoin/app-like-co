<template>
  <div class="container flex flex-col items-center mx-auto">
    <div class="my-4">
      <form @submit.prevent="onSearchISCN">
        <input v-model="searchISCNText" placeholder="Find ISCN by ID">
        <button class="mx-2">Search</button>
        <div v-if="isNotFound">No ISCN record found</div>
      </form>
    </div>
    <div class="my-4">
      <nuxt-link :to="{ name: 'new' }">Register iscn</nuxt-link>
    </div>
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';
// eslint-disable-next-line import/no-extraneous-dependencies
import { mapActions } from 'vuex'

import { parsedISCNRecord } from '~/utils/cosmos/iscn'

export default Vue.extend({
  data() {
    return {
      searchISCNText: '',
      isNotFound: false,
    };
  },
  methods: {
    ...mapActions('iscn', ['queryISCNByKeyword']),
    async onSearchISCN() {
      this.isNotFound = false;
      const { searchISCNText } = this;
      const res: parsedISCNRecord[] = await this.queryISCNByKeyword(searchISCNText);
      if (!res.length) {
        this.isNotFound = true;
      } else if (res.length > 1) {
        const iscnIds = res.map((r) => r.id);
        this.$router.push({ name: 'search', params: { iscnIds: JSON.stringify(iscnIds) }});
      } else {
        const iscnId = res[0].id;
        this.$router.push({ name: 'view-iscnId', params: { iscnId }});
      }
    }
  },
})
</script>
