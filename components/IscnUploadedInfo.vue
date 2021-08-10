<template>
  <div>
    <img v-if="imgSrc" class="max-w-md" :src="imgSrc">
    <ul>
      <li>{{ fileSHA256 }}</li>
      <li v-if="arweaveId">
        <a
          :href="`https://arweave.net/${arweaveId}`"
          target="_blank"
        >{{ arweaveUrl }}</a>
      </li>
      <li v-if="ipfsHash">
        <a
          :href="`https://ipfs.io/ipfs/${ipfsHash}`"
          target="_blank"
        >{{ ipfsUrl }}</a>
      </li>
      <li>{{ iscnId }}</li>
      <li>{{ iscnHash }}</li>
      <li>{{ iscnTimestamp }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

import { getIPFSURLFromHash } from '~/utils/ipfs';

@Component
export default class IscnUploadedInfo extends Vue{
  @Prop({ default: false }) readonly isImage!: boolean
  @Prop({ default: null }) readonly fileData: string|null|undefined
  @Prop(String) readonly fileSHA256!: string
  @Prop(String) readonly ipfsHash!: string
  @Prop(String) readonly iscnId!: string
  @Prop(String) readonly iscnHash!: string
  @Prop(String) readonly iscnTimestamp!: string
  @Prop(String) readonly arweaveId!: string

  get imgSrc() {
    return this.isImage && (getIPFSURLFromHash(this.ipfsHash) || this.fileData);
  }

  get ipfsUrl() {
    return `ipfs://${this.ipfsHash}`;
  }

  get arweaveUrl() {
    return `arweave://${this.arweaveId}`;
  }

}

</script>
