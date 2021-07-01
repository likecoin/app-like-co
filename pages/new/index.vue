<template>
  <div>
    <upload-form
      v-if="state === 'init'"
      @submit="onSubmitUpload"
    />
    <iscn-register-form
      v-else-if="state === 'iscn'"
      :ipfs-hash="ipfsHash"
      :file-data="fileData"
    />
    <iscn-uploaded-info
      v-else-if="state === 'done'"
      :ipfs-hash="ipfsHash"
      :iscn-hash="iscnHash"
      :file-data="fileData"
    />
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';

export default Vue.extend({
  data(): {
      state: string;
      ipfsHash: string;
      iscnHash: string;
      fileData: string | ArrayBuffer | null;
  } {
    return {
      state: 'init',
      ipfsHash: '',
      iscnHash: '',
      fileData: null,
    };
  },
  methods: {
    onSubmitUpload({ ipfsHash, fileData }: { ipfsHash: string, fileData: string | ArrayBuffer | null }) {
      this.ipfsHash = ipfsHash;
      this.fileData = fileData;
      this.state = 'iscn';
    },
  },
})

</script>
