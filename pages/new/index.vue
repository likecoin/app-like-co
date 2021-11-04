<template>
  <div
    :class="[
      'mx-auto',
      'mt-[40px]',
      'w-min',
      'mb-[100px]',
    ]"
  >
    <div
      :class="[
        'flex',
        'justify-between',
        'items-center',
        'mb-[4px]',
      ]"
    >
      <Button
        class="text-dark-gray"
        :to="localeLocation({ name: 'index' })"
        preset="plain"
        tag="div"
        :text="$t('UploadForm.button.back')"
      >
        <template #prepend>
          <IconArrowLeft />
        </template>
      </Button>
    </div>
    <Page>
      <IscnUploadForm
        v-if="state === 'init'"
        :step="step"
        @submit="onSubmitUpload"
      />
      <IscnRegisterForm
        v-else-if="state === 'iscn'"
        :ipfs-hash="ipfsHash"
        :arweave-id="arweaveId"
        :file-data="fileData"
        :file-type="fileType"
        :file-size="fileSize"
        :file-s-h-a256="fileSHA256"
        :file-blob="fileBlob"
        :is-image="isImage"
        :exif-info="exifInfo"
        :step="step"
        @arweaveUploaded="onArweaveIdUpdate"
        @txBroadcasted="onISCNTxInfo"
        @handleSubmit="isSubmit = true"
        @handleQuit="isSubmit = false"
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
        :step="step"
      />
    </Page>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

const signerModule = namespace('signer')

export enum State {
  init = 'init',
  iscn = 'iscn',
  done = 'done',
}

@Component({
  layout: 'wallet',
})
export default class NewIndexPage extends Vue {
  @signerModule.Getter('getAddress') currentAddress!: string

  state = 'init'
  ipfsHash = ''
  arweaveId = ''
  fileSHA256 = ''
  fileData = ''
  fileType = ''
  fileSize = ''
  iscnId = ''
  iscnTxHash = ''
  iscnTimestamp = ''
  isImage = false
  fileBlob: Blob | null = null
  exifInfo: any = null
  isSubmit: boolean = false

  get step(): any {
    switch (this.state) {
      case State.init:
        return 1

      case State.iscn:
        return this.isSubmit ? 3 : 2

      case State.done:
        return 4

      default:
        return undefined
    }
  }

  onSubmitUpload({
    ipfsHash,
    arweaveId,
    fileData,
    fileSHA256,
    isImage,
    fileBlob,
    exifInfo,
    fileType,
    fileSize,
  }: {
    ipfsHash: string
    arweaveId: string
    fileData: string
    fileSHA256: string
    isImage: boolean
    fileBlob: Blob | null
    exifInfo: any
    fileType: string
    fileSize: string
  }) {
    this.ipfsHash = ipfsHash
    this.arweaveId = arweaveId
    this.fileData = fileData
    this.fileSHA256 = fileSHA256
    this.isImage = isImage
    this.fileBlob = fileBlob
    this.exifInfo = exifInfo
    this.fileType = fileType
    this.fileSize = fileSize
    this.state = 'iscn'
  }

  onArweaveIdUpdate({ arweaveId }: { arweaveId: string }) {
    this.arweaveId = arweaveId
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
