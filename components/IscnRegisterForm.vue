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
        :text="$t('IscnRegisterForm.guide.title')"
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
        :label="$t('iscn.meta.content.fingerprints')"
        class="mb-[12px]"
      >
        <ContentFingerprintLink v-if="ipfsHash"  :item="formattedIpfs" />
        <ContentFingerprintLink v-if="uploadArweaveId" :item="formattedArweave" />
      </FormField>
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
          <FormField :label="$t('iscn.meta.name')" class="my-[12px]">
            <TextField
              v-model="name"
              :placeholder="$t('iscn.meta.name.placeholder')"
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
                @click="editAuthor(index)"
              />
            </span>
            <Button
              type="button"
              class="mb-[4px]"
              size="mini"
              preset="secondary"
              content-class="py-[4px]"
              @click="isOpenAuthorDialog = true"
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
          <!-- register -->
          <FormField :label="$t('iscn.meta.register')" class="mb-[12px]">
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
                {{ uploadStatus || $t('iscn.meta.register') }}
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
      <Dialog
        v-model="isOpenAuthorDialog"
        :has-padding="false"
        preset="custom"
      >
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
              size="small"
              preset="secondary"
              content-class="font-semibold"
              :text="$t('UploadForm.button.confirm')"
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
import { DEFAULT_TRANSFER_FEE, sendLIKE } from '~/utils/cosmos/sign';
import { esimateISCNTxGasAndFee, formatISCNTxPayload } from '~/utils/cosmos/iscn/sign';
import { API_POST_ARWEAVE_ESTIMATE, API_POST_ARWEAVE_UPLOAD } from '~/constant/api';
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
  @Prop(String) readonly arweaveId!: string

  @signerModule.Getter('getAddress') address!: string
  @signerModule.Getter('getSigner') signer!: OfflineSigner | null

  authors: Author[] = []
  name: string = ''
  description: string = ''
  tags: string[] = []
  url: string = ''
  license: string = ''
  authorName: string = ''
  authorUrl: string = ''
  authorWalletAddress: string = ''
  uploadStatus: string = ''
  uploadIpfsHash: string = this.ipfsHash || ''
  uploadArweaveId: string = this.arweaveId || ''
  error: string = ''

  arweaveFeeTargetAddress: string = ''
  arweaveFee = new BigNumber(0)
  iscnFee = new BigNumber(0)
  totalFee = new BigNumber(0)
  balance = new BigNumber(0)
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

  async mounted() {
    this.uploadStatus = 'Loading'
    await this.estimateArweaveFee();
    // Total Fee needs Arweave fee to calculate
    await this.calculateTotalFee()
    this.uploadStatus = ''
  }

  get tagsString(): string {
    return this.tags.join(',')
  }

  get authorNames() {
    return this.authors.map((a) => a.name)
  }

  get authorUrls() {
    return this.authors.map((a) => a.url)
  }

  get authorWalletAddresses() {
    return this.authors.map((a) => a.wallet)
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

  get formattedArweave() {
    return this.$t('IscnRegisterForm.arweave.link', { arweaveId: this.uploadArweaveId })
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
      arweaveId: this.uploadArweaveId ||this.arweaveId,
      fileSHA256: this.fileSHA256,
      authorNames: this.authorNames,
      authorUrls: this.authorUrls,
      authorWallets: this.authorWalletAddresses,
      cosmosWallet: this.address,
    }
  }

  get arweaveFeePlusGas() {
    if (this.arweaveFee.lte(0)) return this.arweaveFee;
    const gasAmount = new BigNumber(DEFAULT_TRANSFER_FEE.amount[0].amount).shiftedBy(-9);
    return this.arweaveFee.plus(gasAmount);
  }

  editAuthor(index: number) {
    const { name, wallet, url } = this.authors[index]
    this.authorName = name
    this.authorWalletAddress = wallet
    this.authorUrl = url
    this.activeEditingAuthorIndex = index
    this.isOpenAuthorDialog = true
  }

  dismissAuthorDialog() {
    this.isOpenAuthorDialog = false
    this.activeEditingAuthorIndex = -1
    this.authorName = ''
    this.authorUrl = ''
    this.authorWalletAddress = ''
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
    }
    if (this.activeEditingAuthorIndex >= 0) {
      this.authors.splice(this.activeEditingAuthorIndex, 1, newAuthor)
    } else {
      this.authors.push(newAuthor)
    }
    this.dismissAuthorDialog()
  }

  async calculateTotalFee(): Promise<void> {
    const [
      balance,
      estimation,
    ] = await Promise.all([
      getAccountBalance(this.address),
      esimateISCNTxGasAndFee(formatISCNTxPayload(this.payload)),
    ])
    this.balance = new BigNumber(balance);
    const { iscnFee, gas: iscnGasEstimation } = estimation;
    const iscnGasNanolike = iscnGasEstimation.fee.amount[0].amount
    const iscnFeeNanolike = iscnFee.amount[0]
    this.iscnFee =  new BigNumber(iscnFeeNanolike)
      .plus(iscnGasNanolike)
      .shiftedBy(-9);
    this.totalFee = this.iscnFee.plus(this.arweaveFeePlusGas)
  }

  async onSubmit(): Promise<void> {
    this.error = ''
    if (!this.uploadArweaveId) {
      await this.submitToArweave();
    }
    await this.submitToISCN()
  }

  async estimateArweaveFee(): Promise<void> {
    const formData = new FormData();
    if (this.fileBlob) formData.append('file', this.fileBlob);
    try {
      const { address, arweaveId, LIKE } = await this.$axios.$post(
        API_POST_ARWEAVE_ESTIMATE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      this.uploadArweaveId = arweaveId;
      if (LIKE) this.arweaveFee = new BigNumber(LIKE);
      this.arweaveFeeTargetAddress = address;
    } catch (err) {
      console.error(err);
    }
  }

  async sendArweaveFeeTx(): Promise<string> {
    if (!this.signer) throw new Error('SIGNER_NOT_INITED');
    if (!this.arweaveFeeTargetAddress) throw new Error('TARGET_ADDRESS_NOT_SET');
    this.uploadStatus = 'Waiting for signature'
    const memo = JSON.stringify({ ipfs: this.ipfsHash });
    const { transactionHash } = await sendLIKE(this.address, this.arweaveFeeTargetAddress, this.arweaveFee.toFixed(), this.signer, memo);
    return transactionHash;
  }

  async submitToArweave(): Promise<void> {
    if (this.uploadArweaveId) return;
    const transactionHash = await this.sendArweaveFeeTx();
    const formData = new FormData();
    if (this.fileBlob) formData.append('file', this.fileBlob);
    this.uploadStatus = this.$t('UploadForm.button.uploading') as string;
    try {
      const { arweaveId } = await this.$axios.$post(
        `${API_POST_ARWEAVE_UPLOAD}?txHash=${transactionHash}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      this.uploadArweaveId = arweaveId;
    } catch (err) {
      console.error(err);
    }
  }

  async submitToISCN(): Promise<void> {
    this.uploadStatus = 'Loading'
    await this.calculateTotalFee()
    if (this.balance.lt(this.iscnFee)) {
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
