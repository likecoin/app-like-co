<template>
  <div>
    <Card class="p-[32px]" :has-padding="false">
      <!-- header -->
      <IscnFormHeader :step="step" :total-step="4" />
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
                    { isFileImage, fileData, fileName, fileSize, exifInfo},
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
                    <div class="flex gap-[4px] items-end ml-[4px]">
                      <div
                        v-if="exifInfo"
                        :class="['cursor-pointer']"
                        @click="handleClickExifInfo(index)"
                      >
                        <IconInfo />
                      </div>
                      <div
                        :class="['ml-auto', 'cursor-pointer']"
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
        <div class="flex gap-[8px] justify-end mt-[12px] text-medium-gray">
          <Button preset="outline" @click="onSkipUpload"
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
    </Card>
    <AttentionsLedger />
    <Snackbar
      v-model="isSizeExceeded"
      :text="$t('UploadForm.warning',{ size: Math.round(uploadSizeLimit / (1024*1024)) })"
      preset="warn"
    />
  </div>
</template>

<script lang="ts">
import exifr from 'exifr'
import Hash from 'ipfs-only-hash'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { logTrackerEvent } from '~/utils/logger'
import { IS_CHAIN_UPGRADING, UPLOAD_FILESIZE_MAX } from '~/constant'

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

  displayImageSrc: string = ''
  displayExifInfo: any = null

  fileRecords: any[] = []

  isOpenFileInfoDialog = false
  isSizeExceeded = false

  uploadSizeLimit: number = UPLOAD_FILESIZE_MAX

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
          }
        } else {
          this.isSizeExceeded = true
        }
        this.fileRecords.push(fileRecord)
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

  onSkipUpload() {
    this.$emit('submit', {})
  }

  onSubmit() {
    if (IS_CHAIN_UPGRADING) return
    this.$emit('submit', this.fileRecords)
  }

  handleDeleteFile(index: number) {
    this.fileRecords.splice(index, 1)
  }

  handleClickExifInfo(index: number) {
    this.isOpenFileInfoDialog = true
    this.displayImageSrc = this.fileRecords[index].fileData
    this.displayExifInfo = this.fileRecords[index].exifInfo
  }
}
</script>
