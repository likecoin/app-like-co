<template>
  <div class="container flex flex-col items-center mx-auto">
    <div v-if="!record">
      Loading
    </div>
    <div v-else>
      <ul>
        <li>iscnId: {{ iscnId }}</li>
        <li>recordNotes: {{ record.recordNotes }}</li>
        <li>contentFingerprints: {{ record.contentFingerprints }}</li>
      </ul>
      <ul>
        <li>Type: {{ metadata['@type'] }}</li>
        <li>Title: {{ metadata.title }}</li>
        <li>Description: {{ metadata.description }}</li>
        <li>version: {{ metadata.version }}</li>
        <li>url: {{ metadata.url }}</li>
        <li>keywords: {{ metadata.keywords }}</li>
        <li>usageInfo: {{ metadata.usageInfo }}</li>
      </ul>
      <div>
        Stakeholders:
        <div v-for="s in record.stakeholders" :key=s.entity.id>
          <div>id: {{ s.entity.id }}</div>
          <div>Name: {{ s.entity.name }}</div>
          <div>contributionType: {{ s.contributionType }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';
// eslint-disable-next-line import/no-extraneous-dependencies
import { mapActions, mapGetters } from 'vuex'

export default Vue.extend({
  computed: {
    ...mapGetters('iscn', ['getISCNById']),
    iscnId() {
      return this.$route.params.iscnId;
    },
    record() {
      return this.getISCNById(this.iscnId)?.data;
    },
    metadata() {
      return this.record && (this.record as any).contentMetadata;
    },
  },
  async mounted() {
    if (!this.getISCNById(this.iscnId)) {
      await this.fetchISCNById(this.iscnId);
    }
     if (!this.getISCNById(this.iscnId)) {
      this.$nuxt.error({ statusCode: 404, message: 'iscn id not found' })
     }
  },
  methods: {
    ...mapActions('iscn', ['fetchISCNById']),
  }
})
</script>
