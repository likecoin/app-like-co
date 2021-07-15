<template>
  <div>
    <img v-if="imgSrc" class="max-w-md" :src="imgSrc">
    <ul>
      <li>{{ fileSHA256 }}</li>
      <li>{{ ipfsHash }}</li>
      <li>{{ iscnId }}</li>
      <li>{{ iscnHash }}</li>
      <li>{{ iscnTimestamp }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';

import { getIPFSURLFromHash } from '~/utils/ipfs';

export default Vue.extend({
  name: 'IscnUploadedInfo',
  props: {
    isImage: {
      type: Boolean,
      required: false,
      default: false,
    },
    fileData: {
      type: String,
      required: false,
      default: '',
    },
    fileSHA256: {
      type: String,
      required: true,
    },
    ipfsHash: {
      type: String,
      required: true,
    },
    iscnId: {
      type: String,
      required: true,
    },
    iscnHash: {
      type: String,
      required: true,
    },
    iscnTimestamp: {
      type: String,
      required: true,
    },
  },
  computed: {
    imgSrc() {
      return this.isImage && (getIPFSURLFromHash(this.ipfsHash) || this.fileData);
    },
  },
})

</script>
