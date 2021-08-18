<template>
  <div class="flex flex-col w-min max-w-[648px] mx-auto mt-[40px]">
    <!-- Back btn -->
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
    <!-- ////// Review Card /////// -->
    <Card :has-padding="false" set-padding-classes="p-[32px]">
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
          <div class="flex flex-row flex-nowrap w-min mb-[8px]">
            <IconStepDot
              v-for="item in 4"
              :key="item.key"
              color="#EBEBEB"
              class="ml-[16px]"
            />
          </div>
          <Label preset="p6" text="Step 3/4" class="text-medium-gray" />
        </div>
      </div>
      <!-- guide text -->
      <Label
        :text="$t('IscnRegisterForm.guide.title')"
        class="text-medium-gray my-[12px]"
      />
      <!-- review metadata -->
      <div
        class="
          flex
          w-[584px]
          h-[196px]
          flex-row
          justify-start
          items-center
          p-[32px]
          mb-[12px]
          border-[2px] border-dashed border-shade-gray
          rounded-[12px]
          text-medium-gray
        "
      >
        <img class="w-[138px] mr-[16px] rounded-[8px]" :src="fileData" />
        <div class="flex flex-col justify-start">
          <Label
            class="w-min mb-[16px]"
            :text="$t('IscnRegisterForm.title.done')"
            tag="div"
            preset="p5"
            valign="middle"
            content-class="font-semibold whitespace-nowrap text-like-green"
            prepend-class="text-like-green"
          >
            <template #prepend>
              <IconDone />
            </template>
          </Label>
          <Button
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
      <!-- fingerPrint -->
      <FormField
        :label="$t('iscn.meta.content.fingerprints')"
        class="mb-[12px]"
      >
        <Link :href="`https://ipfs.io/ipfs/${ipfsHash}`">
          {{ ipfsHash }}
          <IconNorthEast class="ml-[4px]" />
        </Link>
      </FormField>
      <!-- Dialog -->
      <Dialog
        v-model="isOpenFileInfoDialog"
        :has-padding="false"
        preset="custom"
      >
        <MetadataCard :img-src="fileData" :data="exifInfo" />
      </Dialog>
    </Card>
    <!-- ////// Input Card /////// -->
    <Card
      class="flex flex-col mt-[16px]"
      :has-padding="false"
      set-padding-classes="p-[32px]"
    >
      <!-- header -->
      <Label
        class="w-min mb-[16px]"
        :text="type"
        tag="div"
        preset="p5"
        valign="middle"
        content-class="font-semibold whitespace-nowrap text-like-green"
        prepend-class="text-like-green"
      >
        <template #prepend>
          <ISCNTypeIcon :type="type" />
        </template>
      </Label>
      <!-- form fieldset -->
      <div>
        <form @submit.prevent="onSubmit" @keypress="(e) => e.key != 'Enter'" >
          <FormField :label="$t('iscn.meta.title')" class="my-[12px]">
            <TextField
              v-model="title"
              :placeholder="$t('iscn.meta.title.placeholder')"
            />
          </FormField>
          <FormField :label="$t('iscn.meta.description')" class="mb-[12px]">
            <TextField
              v-model="description"
              :placeholder="$t('iscn.meta.description.placeholder')"
            />
          </FormField>
          <FormField
            :label="$t('iscn.meta.creator.name')"
            content-classes="flex flex-row flex-wrap"
          >
          <!-- add author -->
            <span
              v-for="(author, index) in authors"
              :key="index"
              class="mr-[8px] mb-[4px]"
            >
              <Button
                size="mini"
                preset="secondary"
                tag="div"
                text-preset="h6"
                type="button"
                :text="author.name"
              />
            </span>
            <Button
              type="button"
              class="mb-[4px]"
              size="mini"
              preset="secondary"
              content-class="py-[4px]"
              @click="isOpenAddAuthor = true"
            >
              <IconAddMini />
            </Button>
          </FormField>
          <!-- add tags -->
          <IconDiverMini class="my-[12px]" />
          <FormField
            :label="$t('iscn.meta.keywords')"
            content-classes="flex flex-row flex-wrap"
          >
            <EditableTagList v-model="tags" />
          </FormField>
          <IconDiverMini class="my-[12px]" />
          <FormField :label="$t('iscn.meta.creator.url')" class="mb-[12px]">
            <TextField
              v-model="url"
              :placeholder="$t('iscn.meta.creator.url.placeholder')"
            />
          </FormField>
          <FormField :label="$t('iscn.meta.license')" class="mb-[12px]">
            <TextField
              v-model="license"
              :placeholder="$t('iscn.meta.license.placeholder')"
            />
          </FormField>
          <IconDiverMini class="my-[12px]" />
          <FormField :label="$t('iscn.meta.register')" class="mb-[12px]">
            <div class="font-normal text-[16px] leading-[22px]">
              {{ $t('iscn.meta.register.placeholder') }}
            </div>
            <div class="font-semibold">
              {{ $t('iscn.meta.register.placeholder') }}
            </div>
          </FormField>
          <FormField :label="$t('iscn.meta.version')" class="mb-[12px]">
            {{ $t('iscn.meta.version.placeholder') }}
          </FormField>
          <div class="flex flex-row justify-end pt-[24px] text-medium-gray">
            <!-- Hide for now
            <Label
              v-if="isImage"
              text="Est.Fee:~123.123 Like"
              class="mx-[24px]"
            />
            -->
            <Button
              type="submit"
              preset="secondary"
              :is-disabled="!!uploadStatus"
            >
              {{ uploadStatus || $t('iscn.meta.register') }}
              <template #append>
                <IconArrowRight />
              </template>
            </Button>
          </div>
        </form>
      </div>
      <!-- Dialog -->
      <Dialog v-model="isOpenAddAuthor" :has-padding="false" preset="custom">
        <Card class="flex flex-col w-[616px]">
          <Label
            class="w-min mb-[16px]"
            :text="$t('UploadForm.title.editAuthor')"
            tag="div"
            preset="p5"
            valign="middle"
            content-class="font-semibold whitespace-nowrap text-like-green"
            prepend-class="text-like-green"
          >
            <template #prepend>
              <IconAdd />
            </template>
          </Label>
          <!-- name -->
          <FormField :label="$t('iscn.meta.creator.name')" class="my-[12px]">
            <TextField
              v-model="authorName"
              :placeholder="$t('iscn.meta.creator.name.placeholder')"
            />
          </FormField>
          <IconDiverMini class="my-[12px]" />
          <!-- wallet address -->
          <FormField :label="$t('iscn.meta.creator.wallet.title')">
            <TextField
              v-model="authorWalletAddress"
              :placeholder="$t('iscn.meta.creator.wallet')"
            />
          </FormField>
          <!-- url -->
          <FormField :label="$t('iscn.meta.creator.url')">
            <TextField
              v-model="authorUrl"
              :placeholder="$t('iscn.meta.creator.url.placeholder')"
            />
          </FormField>
          <!-- submit btn -->
          <div class="flex flex-row self-end">
            <Button
              type="button"
              class="mx-[8px]"
              size="small"
              preset="secondary"
              content-class="font-semibold"
              :text="$t('UploadForm.button.comfirm')"
              @click.prevent="onClickAddAuthor"
            />
            <Button type="button" size="small" preset="tertiary">
              <IconDelete />
            </Button>
          </div>
        </Card>
      </Dialog>
    </Card>
  </div>
</template>

<script lang="ts">
import BigNumber from 'bignumber.js'
import { OfflineSigner } from '@cosmjs/proto-signing'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

import { Author } from '~/types/author'

import {
  signISCNTx,
  estimateISCNTxGas,
  estimateISCNTxFee,
} from '~/utils/cosmos/iscn/sign'
import { parseISCNTxInfoFromTxSuccess } from '~/utils/cosmos/iscn'
import IPFSClient from '~/utils/ipfs'
import { getAccountBalance } from '~/utils/cosmos'

const signerModule = namespace('signer')

@Component
export default class IscnRegisterForm extends Vue {
  @Prop({ default: false }) readonly isImage!: boolean
  @Prop({ default: null }) readonly exifInfo: any | null | undefined
  @Prop({ default: null }) readonly fileBlob: Blob | null | undefined
  @Prop({ default: null }) readonly fileData: string | null | undefined
  @Prop(String) readonly fileSHA256!: string
  @Prop({ default: false }) readonly isIPFSLink!: boolean
  @Prop(String) readonly ipfsHash!: string

  authors: Author[] = []
  title: string = ''
  description: string = ''
  tags: string[] = []
  url: string = ''
  license: string = ''
  authorName: string = ''
  authorUrl: string = ''
  authorWalletAddress: string = ''
  uploadStatus: string = ''
  uploadIpfsHash: string = this.ipfsHash

  isOpenFileInfoDialog = false
  isOpenAddAuthor = false

  @signerModule.Getter('getAddress') address!: string
  @signerModule.Getter('getSigner') signer!: OfflineSigner | null

  get tagsString(): string {
    return this.tags.join(',')
  }

  get authorNames() {
    return this.authors.map((a) => a.name)
  }

  get authorUrls() {
    return this.authors.map((a) => a.url)
  }

  get isPhoto() {
    return this.exifInfo && this.exifInfo.ExifImageWidth
  }

  get type() {
    if (this.isPhoto) return 'Photo'
    if (this.isImage) return 'Image'
    return 'CreativeWorks'
  }

  mounted() {
    this.uploadStatus = ''
  }

  onClickAddAuthor() {
    this.authors.push({ name: this.authorName, wallet: this.authorWalletAddress, url: this.authorUrl })
    this.isOpenAddAuthor = false
    this.authorName= ''
    this.authorUrl= ''
    this.authorWalletAddress = ''
  }

  async onSubmit(): Promise<void> {
    if (!this.isIPFSLink) await this.submitToIPFS()
    await this.submitToISCN()
  }

  async submitToIPFS(): Promise<void> {
    if (!this.fileBlob) return
    this.uploadStatus = 'Uploading'
    const res = await IPFSClient.add(this.fileBlob)
    if (res.path) this.uploadIpfsHash = res.path
  }

  async submitToISCN(): Promise<void> {
    this.uploadStatus = 'Loading'
    const payload = {
      type: this.type,
      title: this.title,
      description: this.description,
      tagsString: this.tagsString,
      url: this.url,
      license: this.license,
      ipfsHash: this.uploadIpfsHash || this.ipfsHash,
      fileSHA256: this.fileSHA256,
      authorNames: this.authorNames,
      authorUrls: this.authorUrls,
      authorWalletAddress: this.authorWalletAddress,
    }
    const [
      balance,
      iscnFeeNanolike,
    ] = await Promise.all([
      getAccountBalance(this.address),
      estimateISCNTxFee(payload),
    ])
    const gasFee = estimateISCNTxGas()
    const totalFee = new BigNumber(iscnFeeNanolike)
      .plus(gasFee.amount[0].amount)
      .shiftedBy(-9)
    if (new BigNumber(balance).lt(totalFee)) {
      throw new Error('INSUFFICIENT_BALANCE')
    }
    if (!this.signer) throw new Error('MISSING_SIGNER')
    this.uploadStatus = 'Waiting for signature'
    const tx = await signISCNTx(payload, this.signer, this.address)
    this.uploadStatus = 'Success'
    this.$emit('txBroadcasted', parseISCNTxInfoFromTxSuccess(tx))
  }
}
</script>
