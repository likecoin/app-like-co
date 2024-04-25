<template>
  <div>
    <Card class="p-[32px]" :has-padding="false">
      <!-- header -->
      <IscnFormHeader v-if="mode === 'register'" :step="step" :total-step="4" />
      <!-- guide text -->
      <Label
        :text="$t('UploadForm.guide.selectFile')"
        class="text-medium-gray my-[12px]"
      />
      <!-- upload field__upload -->
      <form @submit.prevent="onSubmit">
        <div class="flex gap-[12px]">
          <form
            :class="formClasses"
            @drop.prevent="onFileUpload"
            @dragover.prevent="
              (e) => {
                e.currentTarget.classList.add('bg-shade-gray')
              }"
            @dragleave.prevent="
              (e) => {
                e.currentTarget.classList.remove('bg-shade-gray')
              }"
          >
            <IconUpload />
            <Label
              :text="$t('UploadForm.guide.dropFile')"
              class="my-[16px] text-dark-gray"
            />
            <Button
              type="button"
              preset="tertiary"
              @click="$refs.imageFile.click()"
              >{{ $t('UploadForm.button.selectFile') }}
            </Button>
            <input
              ref="imageFile"
              class="hidden"
              type="file"
              multiple
              @change="onFileUpload"
            />
          </form>
          <!-- uploaded file list -->
          <div v-if="fileRecords.length" class="flex flex-col items-center w-full">
            <table class="w-full">
              <tbody class="w-full">
                <tr
                  v-for="(
                    { isFileImage, fileData, fileName, fileSize, exifInfo },
                    index
                  ) of fileRecords"
                  :key="fileName"
                  class="border-b-shade-gray border-b-[1px] text-dark-gray hover:bg-light-gray transition-colors w-full"
                >
                  <td class="py-[4px]">
                    <Previewer
                      :is-image="isFileImage"
                      :file-data="fileData"
                      size="small"
                    />
                  </td>
                  <td class="py-[4px]">
                    <div
                      :class="[
                        'flex',
                        'flex-col',
                        'items-stretch',
                        'justify-start',
                      ]"
                    >
                      <Label
                        :text="fileName"
                        preset="h6"
                        :class="['font-semibold', 'text-dark-gray']"
                      />
                      <Label
                        :text="`${Math.round(fileSize * 0.001)} KB`"
                        preset="h6"
                        :class="['font-normal', 'text-medium-gray', 'mt-[8px]']"
                      />
                    </div>
                  </td>
                  <td class="py-[4px]">
                    <div class="flex gap-[4px] items-center justify-end ml-[4px]">
                      <div
                        v-if="exifInfo"
                        :class="['cursor-pointer']"
                        @click="handleClickExifInfo(index)"
                      >
                        <IconInfo />
                      </div>
                      <div
                        :class="['cursor-pointer']"
                        @click="handleDeleteFile(index)"
                      >
                        <IconDelete />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <FormField v-if="showAddISCNPageOption">
          <CheckBox v-model="isAddISCNPageToEpub">{{ $t('UploadForm.label.insertISCNPage') }}</CheckBox>
        </FormField>
        <!-- upload field__Submit  -->
        <div class="flex gap-[8px] justify-end text-medium-gray mt-[24px]">
          <NuxtLink
            :class="['text-[12px]', 'underline']"
            :to="localeLocation({ name: 'nft-url' })"
          >
            {{ $t('UploadForm.button.mintUrl') }}
          </NuxtLink>
        </div>
        <!-- Publish btn -->
        <div
          v-if="uploadStatus"
          :class="[
            'flex',
            'flex-col',
            'items-end',
            'mt-[12px]'
          ]"
        >
          <ProgressIndicator />
          <div
            :class="[
              'text-[12px]',
              'mt-[4px]',
            ]"
          >
            {{ formattedUploadStatus }}
          </div>
        </div>
        <div v-else class="flex gap-[8px] justify-end mt-[12px] text-medium-gray">
          <Button v-if="mode === 'register'" preset="outline" @click="onSkipUpload"
            >{{ $t('UploadForm.button.skip') }}
          </Button>
          <Button
            type="submit"
            :preset="submitBtnClasses"
            :is-disabled="!fileRecords.length || isSizeExceeded"
            >{{ $t('UploadForm.button') }}
            <template #append>
              <IconArrowRight />
            </template>
          </Button>
        </div>
      </form>
      <!-- Dialog -->
      <Dialog
        v-model="isOpenFileInfoDialog"
        :has-padding="false"
        preset="custom"
      >
        <MetadataCard
          :class="[
            'w-[616px]',
            'max-h-[75vh]',
            'overflow-y-scroll',
            'scrollbar-hidden',
          ]"
          :img-src="displayImageSrc"
          :all-exif="displayExifInfo"
        />
      </Dialog>
      <Dialog
        v-model="isOpenSignDialog"
        :header-text="$t('IscnRegisterForm.button.uploading')"
        :is-disabled-backdrop-click="true"
        :has-close-button="signDialogError"
        @close="handleSignDialogClose"
      >
        <template #header-prepend>
          <IconStar class="w-[20px]" />
        </template>
        <ProgressIndicator
          class="mx-auto mb-[24px]"
        />
        <div class="text-center text-medium-gray text-[24px] font-500">{{ signDialogMessage }}</div>
        <pre
          v-if="signDialogError"
          :class="[
            'mt-[12px]',
            'p-[8px]',
            'bg-red',
            'bg-opacity-20',
            'rounded-[8px]',
            'text-red',
            'text-[12px]',
            'font-400',
          ]"
        >{{ signDialogError }}</pre>
        <pre
          v-else
          :class="[
            'mt-[12px]',
            'p-[8px]',
            'rounded-[8px]',
            'text-center',
            'text-[12px]',
            'font-400',
          ]"
        >{{ signProgress }} / {{ numberOfSignNeeded }}</pre>
        <Divider class="mt-[12px] mb-[8px]" />
        <span
          v-t="'IscnRegisterForm.signDialog.sign.arweave.uploading'"
          class="whitespace-pre-line"
        />
      </Dialog>
    </Card>
    <AttentionsLedger v-if="mode === 'register'" />
    <Snackbar
      v-model="isSizeExceeded"
      :text="$t('UploadForm.warning',{ size: Math.round(uploadSizeLimit / (1024*1024)) })"
      preset="warn"
    />
    <Snackbar
      v-model="isOpenWarningSnackbar"
      preset="warn"
    >
      {{ errorMsg }}
      <Link
        v-if="error === 'INSUFFICIENT_BALANCE'"
        :class="['text-white','ml-[2px]']"
        nofollow="true"
        href="https://app.osmosis.zone/?from=USDC&to=LIKE"
      >
        {{ $t('IscnRegisterForm.error.buy') }}
      </Link>
    </Snackbar>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import exifr from 'exifr'
import Hash from 'ipfs-only-hash'
import BigNumber from 'bignumber.js'
import ePub from 'epubjs';

import { OfflineSigner } from '@cosmjs/proto-signing'

import { IS_CHAIN_UPGRADING, UPLOAD_FILESIZE_MAX } from '~/constant'
import { logTrackerEvent } from '~/utils/logger'
import { estimateBundlrFilePrice, uploadSingleFileToBundlr } from '~/utils/arweave/v2'
import {
  fileToArrayBuffer,
  digestFileSHA256,
  readImageType,
} from '~/utils/misc'
import { DEFAULT_TRANSFER_FEE, sendLIKE } from '~/utils/cosmos/sign';
import { getAccountBalance } from '~/utils/cosmos'
import { injectISCNQRCodePageEpub } from '~/utils/epub/iscn'
import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type'

const iscnModule = namespace('iscn')
const walletModule = namespace('wallet')
type UploadStatus = '' | 'loading' | 'signing' | 'uploading';

const MODE = {
  REGISTER: 'register',
  EDIT: 'edit',
}

const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]

@Component
export default class IscnUploadForm extends Vue {
  @Prop(Number) readonly step: number | undefined
  @Prop({ default: MODE.REGISTER }) readonly mode: string | undefined
  @Prop(String) readonly iscnId: string | undefined

  @iscnModule.Getter getISCNById!: (arg0: string) => ISCNRecordWithID
  @walletModule.Getter('getSigner') signer!: OfflineSigner | null
  @walletModule.Action('initIfNecessary') initIfNecessary!: () => Promise<any>
  @walletModule.Getter('getWalletAddress') address!: string

  isImage: boolean = false
  ipfsURL: string = ''
  ipfsHash: string = ''
  fileData: string = ''
  fileSHA256: string = ''
  fileBlob: Blob | null = null
  exifInfo: any = null
  fileName: string = ''
  fileSize: number = 0
  fileType: string = ''

  displayImageSrc: string = ''
  displayExifInfo: any = null

  fileRecords: any[] = []

  isOpenFileInfoDialog = false
  isOpenSignDialog = false
  isOpenWarningSnackbar = false
  isSizeExceeded = false
  isAddISCNPageToEpub = false

  uploadSizeLimit: number = UPLOAD_FILESIZE_MAX
  uploadStatus: UploadStatus = '';
  arweaveFeeTargetAddress: string = ''
  arweaveFee = new BigNumber(0)
  arweaveFeeMap: Record<string, string> = {}
  sentArweaveTransactionInfo = new Map<
    string, { transactionHash?: string, arweaveId?: string }
  >()

  likerId: string = ''
  error: string = ''
  shouldShowAlert = false
  errorMessage = ''

  signDialogError = ''
  balance = new BigNumber(0)
  numberOfSignNeeded = 0
  signProgress = 0

  epubMetadataList: any[] = []
  modifiedEpubMap: any = {}

  get formClasses() {
    return [
      'flex',
      'w-full',
      'h-[196px]',
      { 'max-w-[320px]': this.fileRecords.length},
      'flex-col',
      'justify-center',
      {
        'bg-transparent': this.isSizeExceeded,
      },
      'items-center',
      'justify-between',
      'p-[32px]',
      'mb-[12px]',
      'border-[2px]',
      'border-dashed',
      'border-shade-gray',
      'rounded-[12px]',
      'text-medium-gray',
    ]
  }

  get submitBtnClasses() {
    return this.fileRecords.length ? 'secondary' : 'outline'
  }

  get size() {
    return `${Math.round(this.fileSize * 0.001)} KB`
  }

  get arweaveFeePlusGas() {
    if (this.arweaveFee.lte(0)) return this.arweaveFee;
    const gasAmount = new BigNumber(DEFAULT_TRANSFER_FEE.amount[0].amount).shiftedBy(-9);
    return this.arweaveFee.plus(gasAmount);
  }

  get signDialogMessage() {
    return this.$t('IscnRegisterForm.signDialog.closeWarning')
  }

  get formattedUploadStatus() {
    switch (this.uploadStatus) {
      case 'loading':
        return this.$t('IscnRegisterForm.button.loading')

      case 'signing':
        return this.$t('IscnRegisterForm.button.signing')

      case 'uploading':
        return this.$t('IscnRegisterForm.button.uploading')

      default:
        return this.$t('IscnRegisterForm.button.register')
    }
  }

  get errorMsg() {
    switch (this.error) {
      case 'INSUFFICIENT_BALANCE':
        return this.$t('IscnRegisterForm.error.insufficient_with_like', { like: this.arweaveFee })
      case 'MISSING_SIGNER':
        return this.$t('IscnRegisterForm.error.missingSigner')
      default:
        return this.error
    }
  }

  get showAddISCNPageOption() {
    return this.mode === MODE.EDIT && this.fileRecords.some(file => file.fileType === 'application/epub+zip')
  }

  get modifiedFileRecords() {
    if (!this.isAddISCNPageToEpub || this.mode !== MODE.EDIT) return this.fileRecords
    return this.fileRecords.map((record) => {
      if (record.fileType === 'application/epub+zip') {
        const modifiedEpubRecord = this.modifiedEpubMap[record.ipfsHash]
        if (modifiedEpubRecord) {
          return modifiedEpubRecord
        }
      }
      return record
    })
  }

  get iscnData() {
    if (!this.iscnId) return null
    return this.getISCNById(this.iscnId)?.data
  }

  @Watch('error')
  showWarning(errormsg: any) {
    if (errormsg) this.isOpenWarningSnackbar = true
  }

  @Watch('modifiedFileRecords')
  async estimateArFee(fileRecords: any) {
    if (fileRecords.length) {
      this.uploadStatus = 'loading'
      await this.estimateArweaveFee();
      this.uploadStatus = ''
    } else {
      this.arweaveFee = new BigNumber(0)
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async getFileInfo(file: Blob) {
    const fileBytes = (await fileToArrayBuffer(
      file,
    )) as unknown as ArrayBuffer
    if (fileBytes) {
      const [
        fileSHA256,
        imageType,
        ipfsHash,
        // eslint-disable-next-line no-await-in-loop
      ] = await Promise.all([
        digestFileSHA256(fileBytes),
        readImageType(fileBytes),
        Hash.of(Buffer.from(fileBytes)),
      ])
      return {
        fileBytes,
        fileSHA256,
        imageType,
        ipfsHash,
      }
    }
    return null
  }

  async onFileUpload(event: DragEvent) {
    logTrackerEvent(this, 'ISCNCreate', 'SelectFile', '', 1)
    this.isSizeExceeded = false
    let files = null
    if (event.dataTransfer) {
      ;({ files } = event.dataTransfer)
    } else if (event.target) {
      ;({ files } = event.target as HTMLInputElement)
    }
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.classList.remove('bg-shade-gray')
    }

    if (files && files.length) {
      // eslint-disable-next-line no-restricted-syntax
      for (const file of Array.from(files)) {
        const reader = new FileReader()
        let fileRecord: any = {}

        if (file.size < UPLOAD_FILESIZE_MAX) {
          reader.onload = (e) => {
            if (!e.target) return
            fileRecord.fileData = e.target.result as string
          }
          reader.readAsDataURL(file)

          // eslint-disable-next-line no-await-in-loop
          const info = await this.getFileInfo(file)
          if (info) {
            const {
              fileBytes,
              fileSHA256,
              imageType,
              ipfsHash,
            } = info
            fileRecord = {
              ...fileRecord,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              ipfsHash,
              fileSHA256,
              isFileImage: !!imageType,
              fileBlob: file,
              exifInfo: null, // default value, to be potentially updated below
            }

            if (imageType) {
              try {
                // eslint-disable-next-line no-await-in-loop
                const exif = await exifr.parse(file)
                if (exif) {
                  fileRecord.exifInfo = exif
                }
              } catch (err) {
                // eslint-disable-next-line no-console
                console.error(err)
              }
            }
            if (file.type === 'application/epub+zip') {
              // eslint-disable-next-line no-await-in-loop
              await this.processEPub({ ipfsHash, buffer: fileBytes, file })
            }
          }
        } else {
          this.isSizeExceeded = true
        }
        this.fileRecords.push(fileRecord)
      }
    }
  }

  async processEPub({ ipfsHash, buffer, file }: { ipfsHash: string, buffer: ArrayBuffer; file: File }) {
    try {
      const book = ePub(buffer)
      await book.ready
      if (this.mode === MODE.EDIT) {
        const modifiedEpub = await injectISCNQRCodePageEpub(buffer, book, this.iscnId || '', this.iscnData)

        // eslint-disable-next-line no-await-in-loop
        const info = await this.getFileInfo(modifiedEpub)
        if (info) {
          const {
            fileSHA256: modifiedEpubSHA256,
            ipfsHash: modifiedEpubIpfsHash,
          } = info

          const modifiedEpubRecord: any = {
            fileName: file.name,
            fileSize: modifiedEpub.size,
            fileType: modifiedEpub.type,
            fileBlob: modifiedEpub,
            ipfsHash: modifiedEpubIpfsHash,
            fileSHA256: modifiedEpubSHA256,
            isFileImage: false,
          }

          const epubReader = new FileReader()
          epubReader.onload = (e) => {
            if (!e.target) return
            modifiedEpubRecord.fileData = e.target.result as string
            Vue.set(this.modifiedEpubMap, ipfsHash, modifiedEpubRecord)
          }
          epubReader.readAsDataURL(modifiedEpub)
        }
      }

      const epubMetadata: any = {}

      // Get metadata
      const { metadata } = book.packaging
      if (metadata) {
        epubMetadata.epubFileName = file.name
        epubMetadata.title = metadata.title
        epubMetadata.author = metadata.creator
        epubMetadata.language = this.formatLanguage(metadata.language)
        epubMetadata.description = metadata.description
      }

      // Get tags
      const opfFilePath = await (book.path as any).path
      const opfContent = await book.archive.getText(opfFilePath)
      const parser = new DOMParser()
      const opfDocument = parser.parseFromString(opfContent, 'application/xml')
      const dcSubjectElements = opfDocument.querySelectorAll(
        'dc\\:subject, subject',
      )
      const subjects: string[] = []
      dcSubjectElements.forEach((element) => {
        const subject = element.textContent
        if (subject) {
          subjects.push(subject)
        }
      })
      epubMetadata.tags = subjects

      // Get cover file
      const coverUrl = await book.coverUrl()
      if (coverUrl) {
        const response = await fetch(coverUrl)
        const blobData = await response.blob()
        if (blobData) {
          const coverFile = new File(
            [blobData],
            `${metadata.title}_cover.jpeg`,
            {
              type: 'image/jpeg',
            },
          )

          // eslint-disable-next-line no-await-in-loop
          const coverInfo = await this.getFileInfo(coverFile)
          if (coverInfo) {
            const {
              fileSHA256,
              imageType,
              ipfsHash: ipfsThumbnailHash,
            } = coverInfo

            epubMetadata.thumbnailIpfsHash = ipfsThumbnailHash

            const coverFileRecord: any = {
              fileName: coverFile.name,
              fileSize: coverFile.size,
              fileType: coverFile.type,
              fileBlob: coverFile,
              ipfsHash: ipfsThumbnailHash,
              fileSHA256,
              isFileImage: !!imageType,
            }
            const coverReader = new FileReader()
            coverReader.onload = (e) => {
              if (!e.target) return
              coverFileRecord.fileData = e.target.result as string
              this.fileRecords.push(coverFileRecord)
            }
            coverReader.readAsDataURL(coverFile)
          }
        }
      }
      this.epubMetadataList.push(epubMetadata)
    } catch (err) {
      console.error(err)
    }
  }

  // eslint-disable-next-line class-methods-use-this
  formatLanguage(language: string) {
    let formattedLanguage = '';
    if (language) {
      if (language.toLowerCase().startsWith('en')) {
        formattedLanguage = 'en'
      } else if (language.toLowerCase().startsWith('zh')) {
        formattedLanguage = 'zh'
      } else {
        formattedLanguage = language
      }
    }
    return formattedLanguage
  }

  onEnterURL() {
    if (
      !(
        this.ipfsURL.startsWith('ipfs://') ||
        this.ipfsURL.startsWith('https://ipfs.io')
      )
    ) {
      try {
        // const parsed = new URL(this.ipfsURL)
        // TODO: parse IPFS url
      } catch (e) {}
    } else {
      throw new Error('not ipfs url')
    }
  }

  onSkipUpload() {
    this.$emit('submit', {})
  }

  handleDeleteFile(index: number) {
    const deletedFile = this.fileRecords[index];
    if (this.modifiedEpubMap[deletedFile.ipfsHash]) {
      delete this.modifiedEpubMap[deletedFile.ipfsHash]
    }
    this.fileRecords.splice(index, 1);

    const indexToDelete = this.epubMetadataList.findIndex(item => item.thumbnailIpfsHash === deletedFile.ipfsHashList);
    if (indexToDelete !== -1) {
      this.epubMetadataList.splice(indexToDelete, 1);
    }
  }

  handleClickExifInfo(index: number) {
    this.isOpenFileInfoDialog = true
    this.displayImageSrc = this.fileRecords[index].fileData
    this.displayExifInfo = this.fileRecords[index].exifInfo
  }

  async estimateArweaveFee(): Promise<void> {
    try {
      const results = await Promise.all(
        this.modifiedFileRecords.map(async (record) => {
          const priceResult = await estimateBundlrFilePrice({
            fileSize: record.fileBlob?.size || 0,
            ipfsHash: record.ipfsHash,
          })
          return {
            ...priceResult,
            ipfsHash: record.ipfsHash,
          }
        }),
      )

      let totalFee = new BigNumber(0);
      results.forEach(result => {
        const { address, arweaveId, LIKE, ipfsHash } = result;
        if (LIKE) {
          totalFee = totalFee.plus(new BigNumber(LIKE));
          this.arweaveFeeMap[ipfsHash] = LIKE;
        }
        if (arweaveId) {
          this.sentArweaveTransactionInfo.set(ipfsHash, { transactionHash: '', arweaveId });
          const metadata = this.epubMetadataList.find((data: any) => data.thumbnailIpfsHash === ipfsHash)
          if (metadata) {
            metadata.thumbnailArweaveId = arweaveId;
          }
        }
        if (!this.arweaveFeeTargetAddress) {
          this.arweaveFeeTargetAddress = address;
        }
    });

      this.arweaveFee = totalFee;

    } catch (err) {
      // TODO: Handle error
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }

  async sendArweaveFeeTx(record: any): Promise<string> {
    logTrackerEvent(this, 'ISCNCreate', 'SendArFeeTx', '', 1);
    if (this.sentArweaveTransactionInfo.has(record.ipfsHash)) {
      const transactionInfo = this.sentArweaveTransactionInfo.get(record.ipfsHash);
      if (transactionInfo && transactionInfo.transactionHash) {
        return transactionInfo.transactionHash;
      }
    }

    await this.initIfNecessary()
    if (!this.signer) throw new Error('SIGNER_NOT_INITED');
    if (!this.arweaveFeeTargetAddress) throw new Error('TARGET_ADDRESS_NOT_SET');
    if (!this.arweaveFeeMap[record.ipfsHash]) throw new Error('ARWEAVE_FEE_NOT_SET');
    this.uploadStatus = 'signing';
    const memo = JSON.stringify({ ipfs: record.ipfsHash, fileSize: record.fileBlob?.size || 0 });
    try {
      const { transactionHash } = await sendLIKE(this.address, this.arweaveFeeTargetAddress, this.arweaveFeeMap[record.ipfsHash], this.signer, memo);
      if (transactionHash) {
        const existingData = this.sentArweaveTransactionInfo.get(record.ipfsHash) || {};
        this.sentArweaveTransactionInfo.set(record.ipfsHash, { ...existingData, transactionHash });
        return transactionHash;
      }

    } catch (err) {
      this.signDialogError = (err as Error).toString()
      // TODO: Handle error
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      this.uploadStatus = 'uploading';
    }
    return '';
  }

  async submitToArweave(record: any): Promise<void> {
    const existingData = this.sentArweaveTransactionInfo.get(record.ipfsHash) || {};
    const { transactionHash, arweaveId: uploadArweaveId } = existingData;
    if (uploadArweaveId) return
    const tempRecord = {...record}
    logTrackerEvent(this, 'ISCNCreate', 'SubmitToArweave', '', 1);
    if (!tempRecord.fileBlob) return;
    this.isOpenSignDialog = true;

    tempRecord.transactionHash = transactionHash
    if (!tempRecord.transactionHash) {
      tempRecord.transactionHash = await this.sendArweaveFeeTx(tempRecord);
      if (!tempRecord.transactionHash) {
        throw new Error('TRANSACTION_NOT_SENT')
      }
    }

    try {
      const arrayBuffer = await tempRecord.fileBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const arweaveId = await uploadSingleFileToBundlr(buffer, {
        fileSize: tempRecord.fileBlob?.size || 0,
        ipfsHash: tempRecord.ipfsHash,
        fileType: tempRecord.fileType as string,
        txHash: tempRecord.transactionHash,
      });
      if (arweaveId) {
        const uploadedData = this.sentArweaveTransactionInfo.get(record.ipfsHash) || {};
        this.sentArweaveTransactionInfo.set(record.ipfsHash, { ...uploadedData, arweaveId });
        if (tempRecord.fileName.includes('cover.jpeg')) {
          const metadata = this.epubMetadataList.find((file: any) => file.thumbnailIpfsHash === record.ipfsHash)
          if (metadata) {
            metadata.thumbnailArweaveId = arweaveId
          }
        }
        this.$emit('arweaveUploaded', { arweaveId })
        this.isOpenSignDialog = false
      } else {
        this.isOpenWarningSnackbar = true
        this.error = this.$t('IscnRegisterForm.error.arweave') as string
        throw new Error(this.error)
      }
    } catch (err) {
      // TODO: Handle error
      // eslint-disable-next-line no-console
      throw new Error(err as string)
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async uploadFileAndGetArweaveId(file: any, txHash: string) {
    const arrayBuffer = await file.fileBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    return uploadSingleFileToBundlr(buffer, {
      fileSize: file.fileBlob?.size || 0,
      ipfsHash: file.ipfsHash,
      fileType: file.fileType,
      txHash,
    })
  }

  async setEbookCoverFromImages() {
    if (this.epubMetadataList?.find(epubMetadata => epubMetadata.thumbnailArweaveId)) {
      return;
    }

    for (let i = 0; i < this.fileRecords.length; i += 1) {
      const file = this.fileRecords[i]
      if (IMAGE_MIME_TYPES.includes(file.fileType)) {
        const existingData =
          this.sentArweaveTransactionInfo.get(file.ipfsHash) || {}
        if (existingData.arweaveId) {
          this.epubMetadataList.push({
            thumbnailIpfsHash: file.ipfsHash,
            thumbnailArweaveId: existingData.arweaveId,
          })
          break
        }
        let { transactionHash } = existingData
        if (!transactionHash) {
          // eslint-disable-next-line no-await-in-loop
          transactionHash = await this.sendArweaveFeeTx(file)
        }
        // eslint-disable-next-line no-await-in-loop
        const arweaveId = await this.uploadFileAndGetArweaveId(
          file,
          transactionHash,
        )

        if (arweaveId) {
          this.epubMetadataList.push({
            thumbnailIpfsHash: file.ipfsHash,
            thumbnailArweaveId: arweaveId,
          })
          this.sentArweaveTransactionInfo.set(file.ipfsHash, {
            transactionHash,
            arweaveId,
          })
          break
        }
      }
    }
  }

  async onSubmit() {
    if (IS_CHAIN_UPGRADING) return
    logTrackerEvent(this, 'ISCNCreate', 'ClickUpload', '', 1);
    this.uploadStatus = 'uploading'
    this.error = ''
    this.signDialogError = ''

    const balance = await getAccountBalance(this.address);
    this.balance = new BigNumber(balance);
    if (this.balance.lt(this.arweaveFee)) {
      this.error = 'INSUFFICIENT_BALANCE'
      this.isOpenWarningSnackbar = true
      this.uploadStatus = ''
      return
    }
    if (!this.modifiedFileRecords.some(file => file.fileBlob)) {
      this.error = 'NO_FILE_TO_UPLOAD'
      this.isOpenWarningSnackbar = true
      this.uploadStatus = ''
      return
    }

    try {
      this.uploadStatus = 'uploading';

      if (
        this.fileRecords.find((file) => file.fileType === 'application/pdf') &&
        !this.fileRecords.find((file) => file.fileType === 'application/epub+zip')
      ) {
        await this.setEbookCoverFromImages()
      }

      // eslint-disable-next-line no-restricted-syntax
      this.numberOfSignNeeded = this.modifiedFileRecords.length;
      this.signProgress = 0;
      for (let i = 0; i < this.modifiedFileRecords.length; i += 1) {
        const record = this.modifiedFileRecords[i];
        this.signProgress = i + 1;
        // eslint-disable-next-line no-await-in-loop
        await this.submitToArweave(record);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      this.isOpenWarningSnackbar = true
      this.error = (error as Error).toString()
      this.uploadStatus = '';
      return
    } finally {
      this.uploadStatus = '';
    }

    const uploadArweaveIdList = Array.from(this.sentArweaveTransactionInfo.values()).map(entry => entry.arweaveId);
    this.modifiedFileRecords.forEach((record: any, index:number) => {
      if (this.sentArweaveTransactionInfo.has(record.ipfsHash)) {
        const arweaveId = this.sentArweaveTransactionInfo.get(
          record.ipfsHash,
        )?.arweaveId
        if (arweaveId) {
          this.modifiedFileRecords[index].arweaveId = arweaveId
        }
      }
    })
    this.$emit('submit', { fileRecords: this.modifiedFileRecords, arweaveIds: uploadArweaveIdList, epubMetadata: this.epubMetadataList[0] })
  }

  handleSignDialogClose() {
    logTrackerEvent(this, 'ISCNCreate', 'CloseSignDialog', '', 1);
    this.isOpenSignDialog = false
  }
}
</script>
