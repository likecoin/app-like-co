<template>
  <div class="container mx-auto">
    <input v-model=searchISCNText >
    <nuxt-link :to="{ name: 'new' }">Register iscn</nuxt-link>
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
