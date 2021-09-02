<template>
  <div>
    <div class="flex flex-col mx-auto mt-[40px] w-min">
      <Button
        :to="localeLocation({ name: 'index' })"
        preset="plain"
        tag="div"
        :text="$t('UploadForm.button.back')"
        class="text-dark-gray"
      >
        <template #prepend>
          <IconArrowLeft />
        </template>
      </Button>
      <Card class="p-[32px]" :has-padding="false">
        <!-- header -->
        <div class="flex flex-row items-start justify-between">
          <Label
            class="w-min"
            :text="$t('UploadForm.title.registerISCN')"
            tag="div"
            preset="p5"
            valign="middle"
            content-class="font-semibold whitespace-nowrap text-like-green"
            prepend-class="text-like-green"
          >
            <template #prepend>
              <IconRegister />
            </template>
          </Label>
          <div class="flex flex-col items-end">
            <Stepper :step="stepNum" />
            <Label preset="p6" :text="stepText" class="text-medium-gray" />
          </div>
        </div>
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
            <div class="flex justify-center w-[138px] max-h-[150px] mr-[16px]">
              <img v-if="isImage" class="object-contain rounded-[8px]" :src="fileData" />
              <IconFile v-else class="text-dark-gray" />
            </div>
            <!-- <img class="w-[138px] max-h-[150px] object-contain mr-[16px] rounded-[8px]" :src="fileData" /> -->
            <div class="flex flex-col items-stretch justify-start">
              <Label :text="fileName" class="font-semibold text-dark-gray" />
              <Label
                :text="`${size} KB`"
                class="font-normal text-medium-gray my-[8px]"
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
            class="w-[616px] max-h-[65vh] overflow-y-scroll"
            :img-src="fileData"
            :data="exifInfo"
          />
        </Dialog>
      </Card>
    </div>
  </div>
</template>

<script lang="ts">
import exifr from 'exifr'
import Hash from 'ipfs-only-hash'
import { Vue, Component } from 'vue-property-decorator'

import {
  fileToArrayBuffer,
  digestFileSHA256,
  readImageType,
} from '~/utils/misc'

@Component
export default class UploadForm extends Vue {
  isImage: boolean = false
  ipfsURL: string = ''
  ipfsHash: string = ''
  fileData: string = ''
  fileSHA256: string = ''
  fileBlob: Blob | null = null
  exifInfo: any = null
  fileName: string = ''
  fileSize: number = 0

  isOpenFileInfoDialog = false

  get formClasses() {
    return [
      'flex',
      'w-[584px]',
      {
        'flex-row justify-start': this.ipfsHash,
        'h-[196px] flex-col justify-center': !this.ipfsHash,
      },
      'items-center',
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
    return this.ipfsHash ? 'secondary' : 'outline'
  }

  get stepText() {
    return this.ipfsHash ? 'Step 2/4' : 'Step 1/4'
  }

  get stepNum() {
    return this.ipfsHash ? 2 : 1
  }

  get size() {
    return Math.round(this.fileSize * 0.001)
  }

  async onFileUpload(event: DragEvent) {
    let files = null
    if (event.dataTransfer) {
      ;({ files } = event.dataTransfer)
    } else if (event.target) {
      ;({ files } = event.target as HTMLInputElement)
    }

    if (files && files[0]) {
      const reader = new FileReader()
      this.fileName = files[0].name
      this.fileSize = files[0].size
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
          } catch (exifInfo) {
            this.exifInfo = null
          }
        } else {
          this.exifInfo = null
        }
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
    this.$emit('submit', {
      ipfsHash: this.ipfsHash,
      fileData: this.fileData,
      fileSHA256: this.fileSHA256,
      fileBlob: this.fileBlob,
      isImage: this.isImage,
      exifInfo: this.exifInfo,
    })
  }
}
</script>
