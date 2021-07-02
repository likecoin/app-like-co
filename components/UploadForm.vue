<template>
  <div class="mx-auto">
    <img class="max-w-md" :src="fileData">
    <form @submit.prevent="onSubmit">
      <input
        v-model="ipfsURL"
        @change="onEnterURL"
      >
      <input
        ref="imageFile"
        accept="image/*"
        type="file"
        @change="onFileUpload"
      >
      <button type=submit>Upload</button>
    </form>
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';
import { digestFileSHA256 } from '~/utils/misc';

export default Vue.extend({
  name: 'UploadForm',
  data(): {
      ipfsURL: string;
      ipfsHash: string;
      fileData: string,
      fileSHA256: string;
    } {
    return {
      ipfsURL: '',
      ipfsHash: '',
      fileData: '',
      fileSHA256: '',
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
        this.fileSHA256 = await digestFileSHA256(files[0]);
      }
    },
    onEnterURL() {
      if (!(this.ipfsURL.startsWith('ipfs://') || this.ipfsURL.startsWith('https://ipfs.io'))) {
        try {
          const parsed = new URL(this.ipfsURL)
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
      });
    },
  }
})

</script>
