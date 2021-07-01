<template>
  <div>
    <img :src="fileData">
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
    </form>
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';

export default Vue.extend({
  name: 'UploadForm',
  data(): {
      ipfsURL: string;
      ipfsHash: string;
      fileData: string | ArrayBuffer | null,
    } {
    return {
      ipfsURL: '',
      ipfsHash: '',
      fileData: null,
    };
  },
  methods: {
    onFileUpload(event: Event) {
      if (!event.target) return;
      const { files } = event.target as HTMLInputElement;
      if (files && files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (!e.target) return;
          this.fileData = e.target.result;

        };
        reader.readAsDataURL(files[0]);
      }
    },
    onEnterURL() {
      if (!(this.ipfsURL.startsWith('ipfs://') || this.ipfsURL.startsWith('https://ipfs.io'))) {
        try {
          const parsed = new URL(this.ipfsURL)
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
      });
    },
  }
})

</script>
