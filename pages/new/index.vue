<template>
  <Page>
    <UploadForm
      v-if="state === 'init'"
      @submit="onSubmitUpload"
    />
    <IscnRegisterForm
      v-else-if="state === 'iscn'"
      :ipfs-hash="ipfsHash"
      :arweave-id="arweaveId"
      :file-data="fileData"
      :file-s-h-a256="fileSHA256"
      :file-blob="fileBlob"
      :is-image="isImage"
      :exif-info="exifInfo"
      @arweaveUploaded="onArweaveIdUpdate"
      @txBroadcasted="onISCNTxInfo"
      @quit="handleQuitRegistration"
    />
    <IscnUploadedInfo
      v-else-if="state === 'done'"
      :is-image="isImage"
      :ipfs-hash="ipfsHash"
      :arweave-id="arweaveId"
      :file-data="fileData"
      :file-s-h-a256="fileSHA256"
      :iscn-id="iscnId"
      :iscn-hash="iscnTxHash"
      :exif-info="exifInfo"
      :iscn-timestamp="iscnTimestamp"
    />
  </Page>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

const signerModule = namespace('signer')

@Component({
  layout: 'wallet',
})
export default class NewIndexPage extends Vue {
  state = 'init';
  ipfsHash = '';
  arweaveId = '';
  fileSHA256 = '';
  fileData = '';
  iscnId = '';
  iscnTxHash = '';
  iscnTimestamp = '';
  isImage = false;
  fileBlob: Blob | null = null;
  exifInfo: any = null;

  @signerModule.Getter('getAddress') currentAddress!: string

  onSubmitUpload({
    ipfsHash,
    arweaveId,
    fileData,
    fileSHA256,
    isImage,
    fileBlob,
    exifInfo,
  }: {
    ipfsHash: string;
    arweaveId: string;
    fileData: string;
    fileSHA256: string;
    isImage: boolean;
    fileBlob: Blob | null;
    exifInfo: any;
  }) {
    this.ipfsHash = ipfsHash;
    this.arweaveId = arweaveId;
    this.fileData = fileData;
    this.fileSHA256 = fileSHA256;
    this.isImage = isImage;
    this.fileBlob = fileBlob;
    this.exifInfo = exifInfo;
    this.state = 'iscn';
  }

  handleQuitRegistration() {
    this.state = 'init';
    this.ipfsHash = '';
    this.arweaveId = '';
    this.fileSHA256 = '';
    this.fileData = '';
    this.iscnId = '';
    this.iscnTxHash = '';
    this.iscnTimestamp = '';
    this.isImage = false;
    this.fileBlob = null;
    this.exifInfo = null;
  }

  onArweaveIdUpdate({ arweaveId }: { arweaveId: string }) {
    this.arweaveId = arweaveId;
  }

  onISCNTxInfo({
    txHash,
    iscnId,
    timestamp,
  }: {
    txHash: string
    iscnId: string
    timestamp: string
  }) {
    this.iscnTxHash = txHash
    this.iscnId = iscnId
    this.iscnTimestamp = timestamp
    this.state = 'done'
  }
}
</script>
