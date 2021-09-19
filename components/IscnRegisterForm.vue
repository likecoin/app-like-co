<template>
  <div class="flex flex-col w-min max-w-[648px] mx-auto mt-[40px] mb-[166px]">
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
          <Stepper :step=3 />
          <Label preset="p6" text="Step 3/4" class="text-medium-gray" />
        </div>
      </div>
      <!-- guide text -->
      <Label
        :text="$t('IscnRegisterForm.guide.review')"
        class="text-medium-gray my-[12px]"
      />
      <!-- review metadata -->
      <div
        class="
          flex
          w-[584px]
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
        <Previewer :is-image="isImage" :file-data="fileData" />
        <div class="flex flex-col justify-start">
          <Label
            class="w-min mb-[16px]"
            :text="$t('IscnRegisterForm.title.published')"
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
            v-if="exifInfo"
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
        :label="$t('IscnRegisterForm.label.fingerprints')"
        class="mb-[12px]"
      >
        <ContentFingerprintLink :item="formattedIpfs" />
      </FormField>
      <!-- Dialog -->
      <Dialog
        v-model="isOpenFileInfoDialog"
        :has-padding="false"
        preset="custom"
      >
        <MetadataCard
          class="w-[616px] max-h-[75vh] overflow-y-scroll"
          :img-src="fileData"
          :data="exifInfo"
        />
      </Dialog>
    </Card>
    <!-- ////// Input Card /////// -->
    <Card
      class="flex flex-col mt-[16px] p-[32px]"
      :has-padding="false"
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
        <form @submit.prevent="onSubmit">
          <FormField
            :label="$t('IscnRegisterForm.label.iscn')"
            class="my-[12px]"
          >
            <TextField
              v-model="name"
              :placeholder="$t('IscnRegisterForm.placeholder.iscn')"
            />
          </FormField>
          <FormField
            :label="$t('IscnRegisterForm.label.description')"
            class="mb-[12px]"
          >
            <TextField
              v-model="description"
              :is-textarea="true"
              :placeholder="$t('IscnRegisterForm.placeholder.description')"
            />
          </FormField>
          <FormField
            :label="$t('IscnRegisterForm.label.author')"
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
                @click="editAuthor(index)"
              />
            </span>
            <Button
              type="button"
              class="mb-[4px]"
              size="mini"
              preset="secondary"
              content-class="py-[4px]"
              @click="handleOpenAuthorDialog()"
            >
              <IconAddMini />
            </Button>
          </FormField>
          <!-- add tags -->
          <IconDiverMini class="my-[12px]" />
          <FormField
            :label="$t('IscnRegisterForm.label.tags')"
            content-classes="flex flex-row flex-wrap"
          >
            <EditableTagList v-model="tags" />
          </FormField>
          <IconDiverMini class="my-[12px]" />
          <FormField
            :label="$t('IscnRegisterForm.label.url')"
            class="mb-[12px]"
          >
            <TextField
              v-model="url"
              :placeholder="$t('IscnRegisterForm.placeholder.url')"
            />
          </FormField>
          <FormField
            :label="$t('IscnRegisterForm.label.license')"
            class="mb-[12px]"
          >
            <TextField
              v-model="license"
              :placeholder="$t('IscnRegisterForm.placeholder.license')"
            />
          </FormField>
          <IconDiverMini class="my-[12px]" />
          <!-- register -->
          <FormField
            :label="$t('IscnRegisterForm.label.registrant')"
            class="mb-[12px]"
          >
            <div class="font-normal text-[16px] leading-[22px]">
              {{ address }}
            </div>
          </FormField>
          <div class="flex flex-row justify-end pt-[24px] text-medium-gray">
            <Label :text="formattedRegisterFee" class="mx-[24px]" />
            <div class="flex flex-col">
              <Button
                type="submit"
                preset="secondary"
                :is-disabled="!!uploadStatus"
              >
                {{ uploadStatus || $t('IscnRegisterForm.button.register') }}
                <template #append>
                  <IconArrowRight />
                </template>
              </Button>
            </div>
          </div>
        </form>
      </div>
      <!-- Snackbar -->
      <Snackbar
        v-model="isOpenWarningSnackbar"
        :text="errorMsg"
        preset="warn"
      />
      <!-- Dialog -->
      <Dialog v-model="isOpenAuthorDialog" :has-padding="false" preset="custom">
        <Card
          class="
            flex flex-col
            w-[616px]
            max-h-[75vh]
            pb-[80px]
            overflow-y-scroll
          "
        >
          <Label
            class="w-min mb-[16px]"
            :text="$t('IscnRegisterForm.title.editAuthor')"
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
          <FormField
            class="mb-[24px]"
            content-classes="flex flex-row flex-nowarp items-center"
            :label="$t('IscnRegisterForm.label.name')"
          >
            <TextField
              v-model="authorName"
              :size="40"
              class="w-[219px]"
              :placeholder="$t('IscnRegisterForm.placeholder.name')"
            />
            <Selector
              class="h-[40px] w-[52px] ml-[8px] z-[1000]"
              @input="setAuthorName"
            />
          </FormField>
          <FormField class="mb-[16px]" :label="$t('IscnRegisterForm.label.likerID')">
            <TextField
              v-model="likerId"
              :size="40"
              :placeholder="$t('IscnRegisterForm.placeholder.likerID')"
            />
          </FormField>
          <FormField
            :label="$t('IscnRegisterForm.label.description')"
            class="mb-[24px]"
          >
            <TextField
              v-model="authorDescription"
              :is-textarea="true"
              :placeholder="$t('IscnRegisterForm.placeholder.description')"
            />
          </FormField>
          <!-- url -->
          <FormField class="mb-[24px]" :label="$t('IscnRegisterForm.label.url')">
            <TextFieldList
              v-model="authorUrl"
              :size="40"
              :text="$t('IscnRegisterForm.label.url')"
              :placeholder="$t('IscnRegisterForm.placeholder.url')"
            />
          </FormField>
          <!-- wallet address -->
          <FormField :label="$t('IscnRegisterForm.label.wallet')">
            <WalletFieldList
              v-model="authorWalletAddress"
            />
          </FormField>
          <!-- submit btn -->
          <div class="flex flex-row self-end">
            <Button
              type="button"
              size="small"
              preset="secondary"
              content-class="font-semibold"
              :text="$t('IscnRegisterForm.button.confirm')"
              @click.prevent="confirmAuthorChange"
            />
            <Button
              v-if="activeEditingAuthorIndex >= 0"
              class="ml-[8px]"
              type="button"
              size="small"
              preset="tertiary"
              @click="deleteAuthor"
            >
              <IconDelete />
            </Button>
          </div>
        </Card>
      </Dialog>
    </Card>
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing'
import BigNumber from 'bignumber.js'
import debounce from 'lodash.debounce'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

import { Author } from '~/types/author'

import { signISCNTx } from '~/utils/cosmos/iscn';
import { esimateISCNTxGasAndFee, formatISCNTxPayload } from '~/utils/cosmos/iscn/sign';
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

  @signerModule.Getter('getAddress') address!: string
  @signerModule.Getter('getSigner') signer!: OfflineSigner | null

  authors: Author[] = []
  name: string = ''
  description: string = ''
  tags: string[] = []
  url: string = ''
  license: string = ''
  authorName: string = ''
  authorUrl: string[] = []
  authorWalletAddress: string[] = []
  uploadStatus: string = ''
  uploadIpfsHash: string = this.ipfsHash
  error: string = ''
  likerId: string = ''
  authorDescription: string = ''

  totalFee: any = 0
  balance: any = 0
  debouncedCalculateTotalFee = debounce(this.calculateTotalFee, 400)

  isOpenFileInfoDialog = false
  isOpenAuthorDialog = false
  isOpenWarningSnackbar = false
  activeEditingAuthorIndex = -1

  @Watch('payload', { immediate: true, deep: true })
  change() {
    this.debouncedCalculateTotalFee()
  }

  @Watch('error')
  showWarning(errormsg: any) {
    if (errormsg) this.isOpenWarningSnackbar = true
  }

  mounted() {
    this.uploadStatus = ''
    this.calculateTotalFee()
  }

  get tagsString(): string {
    return this.tags.join(',')
  }

  get authorNames() {
    return this.authors.map((a) => a.name)
  }

  get authorUrls() {
    return this.authors.map((a) => a.url.map((b: any) => b.content))
  }

  get authorWalletAddresses() {
    return this.authors.map((a) =>
      a.wallet.map((b: any) => ({ address: b.content, type: b.type })),
    )
  }

  get likerIds() {
    return this.authors.map((a) => a.likerId)
  }

  get descriptions() {
    return this.authors.map((a) => a.authorDescription)
  }

  get isPhoto() {
    return this.exifInfo && this.exifInfo.ExifImageWidth
  }

  get type() {
    if (this.isPhoto) return 'Photo'
    if (this.isImage) return 'Image'
    return 'CreativeWork'
  }

  get formattedIpfs() {
    return this.$t('IscnRegisterForm.ipfs.link', { hash: this.ipfsHash })
  }

  get errorMsg() {
    switch (this.error) {
      case 'INSUFFICIENT_BALANCE':
        return this.$t('IscnRegisterForm.error.insufficient')
      case 'MISSING_SIGNER':
        return this.$t('IscnRegisterForm.error.missingSigner')
      default:
        return ''
    }
  }

  get formattedRegisterFee() {
    return this.$t('IscnRegisterForm.register.fee', { fee: this.totalFee })
  }

  get payload() {
    return {
      type: this.type,
      name: this.name,
      description: this.description,
      tagsString: this.tagsString,
      url: this.url,
      license: this.license,
      ipfsHash: this.uploadIpfsHash || this.ipfsHash,
      fileSHA256: this.fileSHA256,
      authorNames: this.authorNames,
      authorUrls: this.authorUrls,
      authorWallets: this.authorWalletAddresses,
      cosmosWallet: this.address,
      likerIds: this.likerIds,
      descriptions: this.descriptions,
    }
  }

  handleOpenAuthorDialog() {
    this.isOpenAuthorDialog = true
    this.initAuthorInfo()
  }

  editAuthor(index: number) {
    const { name, wallet, url, likerId, authorDescription } =
      this.authors[index]
    this.authorName = name
    this.authorWalletAddress = wallet
    this.authorUrl = url
    this.likerId = likerId
    this.authorDescription = authorDescription
    this.activeEditingAuthorIndex = index
    this.isOpenAuthorDialog = true
  }

  dismissAuthorDialog() {
    this.isOpenAuthorDialog = false
    this.activeEditingAuthorIndex = -1
    this.authorName = ''
    this.authorUrl = []
    this.authorWalletAddress = []
    this.likerId = ''
    this.authorDescription = ''
  }

  deleteAuthor() {
    this.authors.splice(this.activeEditingAuthorIndex, 1)
    this.dismissAuthorDialog()
  }

  confirmAuthorChange() {
    const newAuthor = {
      name: this.authorName,
      wallet: this.authorWalletAddress,
      url: this.authorUrl,
      likerId: this.likerId,
      authorDescription: this.authorDescription,
    }
    if (this.activeEditingAuthorIndex >= 0) {
      this.authors.splice(this.activeEditingAuthorIndex, 1, newAuthor)
    } else {
      this.authors.push(newAuthor)
    }
    this.dismissAuthorDialog()
  }

  initAuthorInfo() {
    this.authorName = ''
    this.authorWalletAddress = []
    this.authorUrl = []
    this.likerId = ''
    this.authorDescription = ''
    this.activeEditingAuthorIndex = -1
  }

  setAuthorName(value: string) {
    this.authorName = value
  }

  async calculateTotalFee(): Promise<void> {
    const [
      balance,
      estimation,
    ] = await Promise.all([
      getAccountBalance(this.address),
      esimateISCNTxGasAndFee(formatISCNTxPayload(this.payload)),
    ])
    this.balance = balance
    const { iscnFee, gas: iscnGasEstimation } = estimation;
    const iscnGasNanolike = iscnGasEstimation.fee.amount[0].amount
    const iscnFeeNanolike = iscnFee.amount[0]
    this.totalFee = new BigNumber(iscnFeeNanolike)
      .plus(iscnGasNanolike)
      .shiftedBy(-9)
  }

  async onSubmit(): Promise<void> {
    this.error = ''
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
    await this.calculateTotalFee()
    if (new BigNumber(this.balance).lt(this.totalFee)) {
      this.error = 'INSUFFICIENT_BALANCE'
      this.uploadStatus = ''
      return
    }
    if (!this.signer) {
      this.error = 'MISSING_SIGNER'
      this.uploadStatus = ''
      return
    }
    this.uploadStatus = 'Waiting for signature'
    const res = await signISCNTx(formatISCNTxPayload(this.payload), this.signer, this.address)
    this.uploadStatus = 'Success'
    this.$emit('txBroadcasted', res)
  }
}
</script>
