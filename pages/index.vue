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

import { queryISCNByAll } from '~/utils/cosmos/iscn/query';

export default Vue.extend({
  data() {
    return {
      searchISCNText: '',
      isNotFound: false,
    };
  },
  methods: {
    async onSearchISCN() {
      this.isNotFound = false;
      const { searchISCNText } = this;
      const res = await queryISCNByAll(searchISCNText);
      console.log(res);
      if (!res.length) {
        this.isNotFound = true;
      } else if (res.length > 1) {
        // this.$router.push({ name: 'view', params: { iscnRecord: res }});
      } else {
        // this.$router.push({ name: 'search', params: { iscnRecords: res }});
      }
    }
  },
})
</script>
