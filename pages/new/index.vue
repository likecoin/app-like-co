<template>
  <Page
    :class="[
      'w-full',
      'max-w-[640px]',
      'mt-[40px]',
      'mx-auto',
      'mb-[100px]',
    ]"
  >
    <div
      :class="[
        'flex',
        'justify-start',
        'mb-[4px]',
        'w-full'
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
    <IscnUploadForm
      v-if="state === 'init'"
      :step="step"
      @submit="onSubmitUpload"
    />
    <IscnRegisterForm
      v-else-if="state === 'iscn'"
      :file-records="formattedFileRecords"

      :ipfs-hash="urlIpfsHash"
      :arweave-id="arweaveId"

      :is-upload-only="isUploadOnly"
      :step="step"
      @arweaveUploaded="onArweaveIdUpdate"
      @txBroadcasted="onISCNTxInfo"
      @fileUploaded="fileUploaded"
      @handleSubmit="isSubmit = true"
      @handleQuit="isSubmit = false"
    />
    <template v-else-if="state === 'done'">
      <IscnUploadedInfo
        v-if="iscnId"
        :owner="currentAddress"
        :iscn-id="iscnId"
        :iscn-hash="iscnTxHash"
        :record="record"
        :exif-info="exifInfo"
        :step="step"
      >
        <template #card-footer>
          <div
            :class="[
              'flex',
              'justify-center',
            ]"
          >
            <Button
              :class="[
                'mt-[16px]',
                'mb-[28px]',
              ]"
              preset="secondary"
              :text="$t('IscnUploaded.button.new')"
              @click="handleCreateAnotherButtonClick"
            >
              <template #prepend>
                <IconAddToISCN class="w-[20px]" />
              </template>
            </Button>
          </div>
        </template>
      </IscnUploadedInfo>
      <FileUploadedInfo
        v-else
        :ipfs-hash="ipfsHash"
        :arweave-id="arweaveId"
        :step="step"
      />
    </template>
  </Page>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type'
import { logTrackerEvent } from '~/utils/logger';

const walletModule = namespace('wallet')
const iscnModule = namespace('iscn')

export enum State {
  init = 'init',
  iscn = 'iscn',
  done = 'done',
}

@Component({
  layout: 'wallet',
})
export default class NewIndexPage extends Vue {
  @walletModule.Getter('getWalletAddress') currentAddress!: string
  @iscnModule.Action queryISCNByAddress!: (
    arg0: string
  ) => ISCNRecordWithID[] | PromiseLike<ISCNRecordWithID[]>

  state = 'init'
  urlIpfsHash = this.$route.query.ipfs_hash || ''
  arweaveId = this.$route.query.arweave_id || ''
  isUploadOnly = this.$route.query.upload_only === '1'
  fileSHA256 = ''
  fileData = ''
  fileType = ''
  fileSize = ''
  iscnId = ''
  iscnTxHash = ''
  iscnTimestamp = ''
  isFileImage = false
  fileBlob: Blob | null = null
  exifInfo: any | null = null
  isSubmit = false
  record: ISCNRecordWithID | null = null

  uploadFileRecords: any[] = []
  urlFileRecords: any[] = []

  get shouldSkipToMintNFT(): boolean {
    return this.$route.query.mint === '1'
  }

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

  get formattedFileRecords() {
     if (this.uploadFileRecords.length) {
      return this.uploadFileRecords
     }
     if (this.urlFileRecords.length) {
      return this.urlFileRecords
     }
     return[]
  }

  async mounted() {
    if ((this.urlIpfsHash || this.arweaveId) && this.shouldSkipToMintNFT) {
      this.state = 'iscn';
      let url;
      if (this.arweaveId) url = `https://arweave.net/${this.arweaveId}`;
      else if (this.urlIpfsHash) url = `https://ipfs.io/ipfs/${this.urlIpfsHash}`;
      if (url) {
        const { data, headers } = await this.$axios.get(url, { responseType: 'blob' })
        this.urlFileRecords.push({
        fileBlob:data as Blob,
        ipfsHash:this.urlIpfsHash,
        arweaveId: this.arweaveId,
        isFileImage:headers['content-type'].startsWith('image'),
        fileType:headers['content-type'],
        fileSize:headers['content-length'],
        fileData:`data:${this.fileType};base64,${Buffer.from(await data.arrayBuffer(), 'binary').toString('base64')}`,
        })
      }
    }
  }

  onSubmitUpload(fileRecords: any[] | []) {
    if (fileRecords && fileRecords.length) {
      this.uploadFileRecords.push(...fileRecords)
    }
    this.state = 'iscn'
    logTrackerEvent(this, 'ISCNCreate', 'ISCNConfirmFile', '', 1);
  }

  onArweaveIdUpdate({ arweaveId }: { arweaveId: string }) {
    this.arweaveId = arweaveId
    logTrackerEvent(this, 'ISCNCreate', 'ISCNFileUploadToARSuccess', arweaveId, 1);
  }

  onFileOnlyUpload() {
    this.state = 'done'
  }

  async onISCNTxInfo({
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
    const records = await this.queryISCNByAddress(this.currentAddress)
    this.record = records ? records[records.length - 1] : null
    logTrackerEvent(this, 'ISCNCreate', 'ISCNTxSuccess', this.iscnId, 1);
    if (this.shouldSkipToMintNFT) {
      this.$router.push(
        this.localeLocation({
          name: 'nft-iscn-iscnId',
          params: { iscnId },
        })!,
      )
    }
  }

  handleCreateAnotherButtonClick() {
    this.state = 'init'
    this.urlIpfsHash = ''
    this.arweaveId = ''
    this.fileSHA256 = ''
    this.fileData = ''
    this.fileType = ''
    this.fileSize = ''
    this.iscnId = ''
    this.iscnTxHash = ''
    this.iscnTimestamp = ''
    this.isFileImage = false
    this.fileBlob = null
    this.exifInfo = null
    this.isSubmit = false
    logTrackerEvent(this, 'ISCNCreate', 'CreateAnother', this.currentAddress, 1);
  }
}
</script>
