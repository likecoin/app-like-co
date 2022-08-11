<template>
  <div>
      <Card class="p-[32px]" :has-padding="false">
        <!-- header -->
        <IscnFormHeader :step="step" :total-step="4"/>
        <!-- guide text -->
        <Label
          :text="$t('UploadForm.guide.selectFile')"
          class="text-medium-gray my-[12px]"
        />
        <!-- upload field__upload -->
        <form @submit.prevent="onSubmit">
          <form
            v-if="!ipfsHash"
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
              @change="onFileUpload"
            />
          </form>
          <!-- upload field__Submit  -->
          <div v-else :class="formClasses">
            <div class="flex">
              <Previewer
                :is-image="isImage"
                :file-data="fileData"
              />
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
                  :class="[
                    'font-semibold',
                    'text-dark-gray',
                  ]"
                />
                <Label
                  :text="size"
                  :class="[
                    'font-normal',
                    'text-medium-gray',
                    'my-[8px]',
                  ]"
                />
                <Button
                  v-if="exifInfo"
                  class="w-min"
                  type="button"
                  :text="$t('UploadForm.view.file.button')"
                  preset="outline"
                  @click="isOpenFileInfoDialog = true"
                >
                  <template #prepend>
                    <IconInfo />
                  </template>
                </Button>
              </div>
            </div>
            <div
              :class="[
                'mr-[24px]',
                'cursor-pointer',
              ]"
              @click="handleInitFile"
            >
              <IconDelete />
            </div>
          </div>
          <!-- Publish btn -->
          <div class="flex flex-row justify-end pt-[24px] text-medium-gray">
            <Button
              type="submit"
              :preset="submitBtnClasses"
              :is-disabled="!ipfsHash"
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
            :img-src="fileData"
            :all-exif="exifInfo"
          />
        </Dialog>
      </Card>
    <AttentionsLedger />
    <Snackbar
      v-model="isSizeExceeded"
      :text="$t('UploadForm.warning')"
      preset="warn"
    />
  </div>
</template>

<script lang="ts">
import exifr from 'exifr'
import Hash from 'ipfs-only-hash'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { logTrackerEvent } from '~/utils/logger'
import { IS_CHAIN_UPGRADING } from '~/constant'

import {
  fileToArrayBuffer,
  digestFileSHA256,
  readImageType,
} from '~/utils/misc'

@Component
export default class UploadForm extends Vue {
  @Prop(Number) readonly step: number | undefined

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

  isOpenFileInfoDialog = false
  isSizeExceeded = false

  get formClasses() {
    return [
      'flex',
      'w-[584px]',
      {
        'flex-row justify-start': this.ipfsHash,
        'h-[196px] flex-col justify-center': !this.ipfsHash,
        'bg-transparent' : this.isSizeExceeded,
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

  // eslint-disable-next-line class-methods-use-this

  get submitBtnClasses() {
    return this.ipfsHash ? 'secondary' : 'outline'
  }

  get size() {
    return `${Math.round(this.fileSize * 0.001)} KB`
  }

  async onFileUpload(event: DragEvent) {
    logTrackerEvent(this, 'ISCNCreate', 'SelectFile', '', 1);
    let files = null
    if (event.dataTransfer) {
      ;({ files } = event.dataTransfer)
    } else if (event.target) {
      ;({ files } = event.target as HTMLInputElement)
    }

    if (files && files[0]) {
      const reader = new FileReader()
      if (files[0].size < 20000000) {
        this.fileName = files[0].name
        this.fileSize = files[0].size
        this.fileType = `${files[0].type}`
        reader.onload = (e) => {
          if (!e.target) return
          this.fileData = e.target.result as string
        }
        reader.readAsDataURL(files[0])
        const fileBytes = (await fileToArrayBuffer(files[0])) as ArrayBuffer
        if (fileBytes) {
          const [
            fileSHA256,
            imageType,
            ipfsHash,
          ] = await Promise.all([
            digestFileSHA256(fileBytes),
            readImageType(fileBytes),
            Hash.of(Buffer.from(fileBytes)),
          ])
          this.ipfsHash = ipfsHash
          this.fileSHA256 = fileSHA256
          this.isImage = !!imageType
          // eslint-disable-next-line prefer-destructuring
          this.fileBlob = files[0]
          if (this.isImage) {
            try {
              this.exifInfo = await exifr.parse(files[0])
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error(err)
              this.exifInfo = null
            }
          } else {
            this.exifInfo = null
          }
        }
      } else {
        this.isSizeExceeded = true
        this.handleInitFile()
      }
    }
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

  onSubmit() {
    if (IS_CHAIN_UPGRADING) return;
    this.$emit('submit', {
      ipfsHash: this.ipfsHash,
      fileData: this.fileData,
      fileSHA256: this.fileSHA256,
      fileBlob: this.fileBlob,
      fileSize: this.size,
      fileType: this.fileType,
      isImage: this.isImage,
      exifInfo: this.exifInfo,
    })
  }

  handleInitFile() {
    this.isImage = false
    this.ipfsURL = ''
    this.ipfsHash = ''
    this.fileData = ''
    this.fileSHA256 = ''
    this.fileBlob = null
    this.exifInfo = null
    this.fileName = ''
    this.fileSize = 0
  }
}
</script>
