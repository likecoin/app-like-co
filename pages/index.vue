<template>
  <div class="container flex flex-col items-center mx-auto">
    <div class="my-4">
      <form>
        <input v-model="searchISCNText" placeholder="Find ISCN by ID">
        <button class="mx-2">Search</button>
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

export default Vue.extend({
  data() {
    return {
      searchISCNText: '',
    };
  },
})
</script>
