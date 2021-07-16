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

  get imgSrc() {
    return this.isImage && (getIPFSURLFromHash(this.ipfsHash) || this.fileData);
  }
}

</script>
