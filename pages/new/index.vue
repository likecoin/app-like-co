<template>
  <div class="container mx-auto">
    <upload-form
      v-if="state === 'init'"
      @submit="onSubmitUpload"
    />
    <iscn-register-form
      v-else-if="state === 'iscn'"
      :ipfs-hash="ipfsHash"
      :file-data="fileData"
      :file-s-h-a256="fileSHA256"
      @txBroadcasted="onISCNTxInfo"
    />
    <iscn-uploaded-info
      v-else-if="state === 'done'"
      :ipfs-hash="ipfsHash"
      :file-data="fileData"
      :file-s-h-a256="fileSHA256"
      :iscn-id="iscnId"
      :iscn-hash="iscnTxHash"
      :iscn-timestamp="iscnTimestamp"
    />
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';
// eslint-disable-next-line import/no-extraneous-dependencies
import { mapGetters } from 'vuex';

export default Vue.extend({
  layout: 'wallet',
  data(): {
      state: string;
      ipfsHash: string;
      fileSHA256: string;
      fileData: string;
      iscnId: string;
      iscnTxHash: string;
      iscnTimestamp: string;
  } {
    return {
      state: 'init',
      ipfsHash: '',
      fileSHA256: '',
      fileData: '',
      iscnId: '',
      iscnTxHash: '',
      iscnTimestamp: '',
    };
  },
  computed: {
    ...mapGetters('signer', { currentAddress: 'getAddress' }),
  },
  methods: {
    onSubmitUpload({ ipfsHash, fileData, fileSHA256 }: { ipfsHash: string, fileData: string, fileSHA256: string }) {
      this.ipfsHash = ipfsHash;
      this.fileData = fileData;
      this.fileSHA256 = fileSHA256;
      this.state = 'iscn';
    },
    onISCNTxInfo({ txHash, iscnId, timestamp }: { txHash: string, iscnId: string, timestamp: string }) {
      this.iscnTxHash = txHash;
      this.iscnId = iscnId;
      this.iscnTimestamp = timestamp;
      this.state = 'done';
    },
  },
})

</script>
