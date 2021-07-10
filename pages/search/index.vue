<template>
  <div class="container flex flex-col items-center mx-auto">
    <div v-for="record in records" :key="record.id">
      <div v-if="!record">
        Loading
      </div>
      <div v-else>
        <ul>
          <nuxt-link :to="{ name: 'view-iscnId', params: { iscnId: record.id }}">{{ record.id }}</nuxt-link>
          <li>contentFingerprints: {{ record.data.contentFingerprints }}</li>
        </ul>
        <ul>
          <li>Type: {{ record.data.contentMetadata['@type'] }}</li>
          <li>Title: {{ record.data.contentMetadata.title }}</li>
          <li>Description: {{ record.data.contentMetadata.description }}</li>
          <li>url: {{ record.data.contentMetadata.url }}</li>
          <li>keywords: {{ record.data.contentMetadata.keywords }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';
// eslint-disable-next-line import/no-extraneous-dependencies
import { mapActions, mapGetters } from 'vuex';

import { parsedISCNRecord } from '~/utils/cosmos/iscn';

export default Vue.extend({
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
