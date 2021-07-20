<template>
  <div>
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
import Vue, { PropType } from 'vue';

import { parsedISCNRecord } from '~/utils/cosmos/iscn';

export default Vue.extend({
  props: {
    records: {
      type: Array as PropType<Array<parsedISCNRecord>>,
      required: true,
    },
  },
})
</script>

