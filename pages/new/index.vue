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
      :file-blob="fileBlob"
      :is-image="isImage"
      :exif-info="exifInfo"
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
      isImage: boolean;
      fileBlob: Blob | null;
      exifInfo: any;
  } {
    return {
      state: 'init',
      ipfsHash: '',
      fileSHA256: '',
      fileData: '',
      iscnId: '',
      iscnTxHash: '',
      iscnTimestamp: '',
      isImage: false,
      fileBlob: null,
      exifInfo: null,
    };
  },
  computed: {
    ...mapGetters('signer', { currentAddress: 'getAddress' }),
  },
  methods: {
    onSubmitUpload({
      ipfsHash,
      fileData,
      fileSHA256,
      isImage,
      fileBlob,
      exifInfo,
    }: {
      ipfsHash: string,
      fileData: string,
      fileSHA256: string,
      isImage: boolean;
      fileBlob: Blob | null;
      exifInfo: any;
    }) {
      this.ipfsHash = ipfsHash;
      this.fileData = fileData;
      this.fileSHA256 = fileSHA256;
      this.isImage = isImage;
      this.fileBlob = fileBlob;
      this.exifInfo = exifInfo;
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
