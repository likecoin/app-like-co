<template>
  <div>
    <img class="max-w-md" :src="fileData">
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

export default Vue.extend({
  name: 'IscnUploadedInfo',
  props: {
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
})

</script>
