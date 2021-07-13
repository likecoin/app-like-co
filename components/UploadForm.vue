<template>
  <div class="mx-auto">
    <img v-if="isImage" class="max-w-md" :src="fileData">
    <div v-if="exifInfo">{{ exifInfo }}</div>
    <form @submit.prevent="onSubmit">
      <input
        v-if="!fileData"
        v-model="ipfsURL"
        placeholder="Use existing IPFS content"
        @change="onEnterURL"
      >
      <input
        ref="imageFile"
        accept="image/*"
        type="file"
        @change="onFileUpload"
      >
      <button class="block" type=submit>Upload</button>
    </form>
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';
import exifr from 'exifr';
import Hash from 'ipfs-only-hash';
import { fileToArrayBuffer, digestFileSHA256, readImageType } from '~/utils/misc';

export default Vue.extend({
  name: 'UploadForm',
  data(): {
      isImage: boolean;
      ipfsURL: string;
      ipfsHash: string;
      fileData: string,
      fileSHA256: string;
      fileBlob: Blob | null;
      exifInfo: any;
    } {
    return {
      isImage: false,
      ipfsURL: '',
      ipfsHash: '',
      fileData: '',
      fileSHA256: '',
      fileBlob: null,
      exifInfo: null,
    };
  },
  methods: {
    async onFileUpload(event: Event) {
      if (!event.target) return;
      const { files } = event.target as HTMLInputElement;
      if (files && files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (!e.target) return;
          this.fileData = e.target.result as string;

        };
        reader.readAsDataURL(files[0]);
        const fileBytes = await fileToArrayBuffer(files[0]) as ArrayBuffer;
        if (fileBytes) {
          const [fileSHA256, imageType, ipfsHash] = await Promise.all([
            digestFileSHA256(fileBytes),
            readImageType(fileBytes),
            Hash.of(Buffer.from(fileBytes))
          ])
          this.ipfsHash = ipfsHash;
          this.fileSHA256 = fileSHA256;
          this.isImage = !!imageType;
          if (this.isImage) {
            this.exifInfo = await exifr.parse(files[0])
          } else {
            this.exifInfo = null;
          }
        }
      }
    },
    onEnterURL() {
      if (!(this.ipfsURL.startsWith('ipfs://') || this.ipfsURL.startsWith('https://ipfs.io'))) {
        try {
          // const parsed = new URL(this.ipfsURL)
          // TODO: parse IPFS url
        } catch (e) {

        }
      } else {
        throw new Error('not ipfs url')
      }
    },
    onSubmit() {
      this.$emit('submit', {
        ipfsHash: this.ipfsHash,
        fileData: this.fileData,
        fileSHA256: this.fileSHA256,
        fileBlob: this.fileBlob,
        isImage: this.isImage,
        exifInfo: this.exifInfo,
      });
    },
  }
})

</script>
