<template>
  <Page :class="[
    'flex',
    'flex-col',
    'relative',
    'items-center',
    'justify-center',
    'px-[20px]',
    'pt-[38px]',
    'lg:p-[16px]',
  ]">
    <Card :class="['p-[32px]', 'w-full', 'max-w-[600px]']" :has-padding="false">
      <!-- header -->
      <div :class="['flex', 'justify-between', 'items-center']">
        <Label class="w-min" :text="$t('NFTPortal.button.convertToIscn')" tag="div" preset="p5" valign="middle"
          content-class="font-semibold whitespace-nowrap text-like-green" prepend-class="text-like-green">
          <template #prepend>
            <IconRegister />
          </template>
        </Label>
        <div :class="['flex', 'flex-col', 'items-end']">
          <Stepper :step="1" :total-step="4" />
          <Label preset="p6" :text="$t('Registration.step', { step: 1, total: 4 })" class="text-medium-gray" />
        </div>
      </div>
      <!-- guide text -->
      <!-- body -->
      <div v-if="ownerWallet">
        <img v-if="avatar" :src="avatar">
        <Label :text="$t('NFTPortal.errorMessage.notIscnOwner', { ownerWallet })" />
      </div>
      <div :class="[
        'flex',
        'flex-col',
        'justify-center',
        'items-center',
        'w-full',
      ]">
        <div :class="['flex', 'flex-col', 'justify-center', 'w-full', 'my-[64px]']" @submit.prevent="onSubmit">
          <Label preset="p6" :text="$t('NFTPortal.label.register')" />
          <TextField
            v-model="url"
            class="flex flex-col"
            :placeholder="$t('NFTPortal.placeholder.register')"
            :error-message="errorMessage"
            @input="onInputURL"
          />
          {{ iscnId }}
        </div>
        <div v-if="isLoading" class="flex flex-col items-end w-full">
          <ProgressIndicator class="ml-auto w-min" />
          <Label
            class="text-[8px] text-medium-gray text-center mt-[8px] whitespace-nowrap w-min"
            >{{ loadingText }}</Label
          >
        </div>
        <div v-else-if="state === 'INIT'" class="ml-auto w-min">
          <Button
            :text="$t('NFTPortal.button.register')"
            :preset="isInputValueValid ? 'secondary' : 'tertiary'"
            :is-disabled="!isInputValueValid"
            @click="onSubmit"
          >
            <template #prepend>
              <IconAddToISCN class="w-[20px]" />
            </template>
          </Button>
        </div>
        <div v-else class="flex gap-[12px] ml-auto w-min">
            <Button preset="secondary" :text="$t('NFTPortal.button.skip')" @click="onSkip" />
            <Button preset="outline" :text="$t('NFTPortal.button.retry')" @click="onSubmit" />
        </div>
      </div>
    </Card>
    <AttentionsOpenLikerLandApp v-if="isUsingLikerLandApp" />
    <AttentionsLedger v-else />
    <AlertsSignFailed />
  </Page>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing'
import BigNumber from 'bignumber.js'
import postMappingWithCosmosWallet from '@/utils/mapping';
import axios, { AxiosError } from 'axios'

import { getAccountBalance } from '~/utils/cosmos'
import { signISCNTx } from '~/utils/cosmos/iscn'
import { sendLIKE } from '~/utils/cosmos/sign'
import { formatISCNTxPayload } from '~/utils/cosmos/iscn/sign'
import { ISCNRegisterPayload } from '~/utils/cosmos/iscn/iscn.type'
import {
  getLikerIdMinApi,
  getAddressLikerIdMinApi,
  API_POST_ARWEAVE_ESTIMATE,
  API_POST_ARWEAVE_UPLOAD,
} from '~/constant/api'
import { logTrackerEvent } from '~/utils/logger'
import { CRAWL_URL_REGEX, ISCN_PREFIX_REGEX } from '~/constant'

const base64toBlob = (base64Data:string, contentType: string, sliceSize = 512) => {
  const byteCharacters = atob(base64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i+=1) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  const blob = new Blob(byteArrays, {type: contentType});
  return blob;
}

const signerModule = namespace('signer')
const walletModule = namespace('wallet')

export enum ErrorType {
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  MISSING_SIGNER = 'MISSING_SIGNER',
  USE_WALLET_CONNECT = 'WALLET_CONNECT_NOT_ALLOW',
}

enum State {
  INIT = 'INIT',
  TO_CRAWL_URL = 'TO_CRAWL_URL',
  TO_ESTIMATE_ARWEAVE_FEE = 'TO_ESTIMATE_ARWEAVE_FEE',
  TO_UPLOAD_TO_ARWEAVE = 'TO_UPLOAD_TO_ARWEAVE',
  TO_REGISTER_ISCN = 'TO_REGISTER_ISCN',
}

@Component({
  layout: 'wallet',
})
export default class FetchIndex extends Vue {
  @signerModule.Getter('getAddress') address!: string
  @signerModule.Getter('getSigner') signer!: OfflineSigner | null

  @walletModule.Action toggleSnackbar!: (
    error: string,
  ) => void

  @walletModule.Getter('getType') walletType!: string | null

  state = State.INIT
  url = this.$route.query.url as string || ''
  ownerWallet = ''
  errorMessage = ''
  crawledData: any
  ipfsHash = ''
  arweaveId = ''
  arweaveFeeInfo: any
  arweaveFeeTxHash = ''
  iscnId = this.$route.query.iscn_id as string || ''
  likerId = this.$route.query.liker_id as string || ''
  isLoading = false
  avatar = null
  balance: string = ''
  isInputValueValid: boolean = false

  get encodedURL(): string {
    const { url } = this;
    if (/^[ -~]+$/.test(url)) {
      return url;
    }
    return encodeURI(url);
  }

  get loadingText(): string {
    switch (this.state) {
      case State.INIT:
        return this.$t('NFTPortal.url.loadingMessage.init') as string

      case State.TO_CRAWL_URL:
        return this.$t('NFTPortal.url.loadingMessage.crawl') as string

      case State.TO_ESTIMATE_ARWEAVE_FEE:
        return this.$t('NFTPortal.url.loadingMessage.estimate') as string

      case State.TO_UPLOAD_TO_ARWEAVE:
        return this.$t('NFTPortal.url.loadingMessage.upload') as string

      case State.TO_REGISTER_ISCN:
        return this.$t('NFTPortal.url.loadingMessage.register') as string

      default:
        return '';
    }
  }

  get formData(): FormData | null {
    if (!this.crawledData?.body) { return null }
    const body = new Blob([this.crawledData.body], { type: "text/html" })
    const formData = new FormData()
    formData.append('index.html', body, 'index.html')
    const { images } = this.crawledData
    images.forEach((element:any) => {
      formData.append(`${element.key}`, base64toBlob(element.data, element.type), `${element.key}`)
    });
    return formData
  }

  get iscnPayload(): ISCNRegisterPayload {
    const { title = '', keywords = '', author = '' } = this.crawledData
    let { description = '' } = this.crawledData
    description = this.truncate(description, 200)
    return {
      type: 'CreativeWork',
      name: title,
      description,
      tagsString: keywords,
      url: this.url,
      exifInfo: {},
      license: '',
      ipfsHash: this.ipfsHash,
      arweaveId: this.arweaveId,
      fileSHA256: '',
      authorNames: [author],
      authorUrls: [[]],
      authorWallets: [[{
        address: this.address,
        type: 'like',
      }]],
      likerIds: [],
      likerIdsAddresses: [],
      descriptions: [description],
      numbersProtocolAssetId: '',
    }
  }

  get iscnParams() {
    const params: any = { iscnId: this.iscnId }
    return params
  }

  get isUsingLikerLandApp() {
    return this.walletType === 'likerland_app'
  }

  // eslint-disable-next-line class-methods-use-this
  get crawlURLRegex() {
      return new RegExp(CRAWL_URL_REGEX);
  }

    // eslint-disable-next-line class-methods-use-this
  get iscnPrefixRegex() {
      return new RegExp(ISCN_PREFIX_REGEX);
  }

  async mounted() {
    if (this.iscnId) {
      this.$router.push(
        this.localeLocation({
          name: 'nft-iscn-iscnId',
          params: this.iscnParams,
        })!,
      )
    }
    const { liker_id: likerId, wallet } = this.$route.query;
    if (wallet) {
      this.ownerWallet = wallet as string;
      try {
        const { data } = await this.$axios.get(getAddressLikerIdMinApi(wallet as string));
        this.avatar = data.avatar;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
    } else if (likerId) {
      try {
        const { data } = await this.$axios.get(getLikerIdMinApi(likerId as string));
        this.ownerWallet = data.likeWallet;
        this.avatar = data.avatar;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
    }
  }

  @Watch('url')
  reset() {
    this.crawledData = null
    this.ipfsHash = ''
    this.arweaveId = ''
    this.arweaveFeeTxHash = ''
    this.iscnId = ''
    this.state = State.INIT
  }

  async onSubmit() {
    try {
      logTrackerEvent(this, 'NFTUrlMint', 'OnSubmit', this.state, 1);
      if (this.isUsingLikerLandApp) {
        this.errorMessage = this.$t('IscnRegisterForm.error.walletConnect') as string
        throw new Error(ErrorType.USE_WALLET_CONNECT)
      }
      this.isLoading = true
      await this.doAction()
    } catch (err) {
      this.setError(err)
    } finally {
      this.isLoading = false
    }
  }

  onSkip() {
    this.state = State.TO_REGISTER_ISCN
    this.onSubmit()
  }

  async doAction() {
    this.errorMessage = ''
    /* eslint-disable no-fallthrough */
    switch (this.state) {
      case State.INIT:
        if (this.ownerWallet && this.address !== this.ownerWallet) {
          this.errorMessage = 'PLEASE_USE_OWNER_WALLET_TO_SIGN'
          break
        }
        if (this.iscnPrefixRegex.test(this.url)) {
          this.iscnId = this.url;
          this.$router.push(
            this.localeLocation({
              name: 'nft-iscn-iscnId',
              params: this.iscnParams,
            })!,
          )
          break
        }

        this.balance = await getAccountBalance(this.address) as string
        if (this.balance === '0') {
          this.toggleSnackbar('INSUFFICIENT_BALANCE')
          break
        }

        this.errorMessage = ''
        if (!this.url) {
          this.errorMessage = this.$t('HomePage.search.errormessage.empty') as string
          break
        }
        this.state = State.TO_CRAWL_URL
      case State.TO_CRAWL_URL:
        await this.crawlUrlData()
        this.state = State.TO_ESTIMATE_ARWEAVE_FEE
      case State.TO_ESTIMATE_ARWEAVE_FEE:
        await this.checkArweaveIdExistsAndEstimateFee()
        this.state = this.arweaveId ? State.TO_REGISTER_ISCN : State.TO_UPLOAD_TO_ARWEAVE
      case State.TO_UPLOAD_TO_ARWEAVE:
        if (!this.arweaveFeeTxHash) { await this.sendArweaveFeeTx(this.arweaveFeeInfo) }
        await this.submitToArweave()
        this.state = State.TO_REGISTER_ISCN
      case State.TO_REGISTER_ISCN:
        await this.registerISCN()
      default:
        break
    }
    /* eslint-enable no-fallthrough */
  }

  // eslint-disable-next-line class-methods-use-this
  truncate(string: string, limit: number) {
    if (string.length > limit) {
      return `${string.substring(0, limit)}...`
    }
    return string
  }

  async crawlUrlData() {
    try {
      logTrackerEvent(this, 'NFTUrlMint', 'CrawlUrlData', this.url, 1);
      const { data } = await this.$axios.get(`/crawler/?url=${encodeURIComponent(this.encodedURL)}&wallet=${this.address}`)
      this.crawledData = data
      if (!this.crawledData?.body) { throw new Error('CANNOT_CRAWL_THIS_URL') }
      if (this.crawledData?.title === 'patreon.com' && this.crawledData?.description === '') { throw new Error('SITE_NOT_CRAWLABLE: pateron') }
    } catch (err) {
      // eslint-disable-next-line no-console
      logTrackerEvent(this, 'NFTUrlMint', 'CrawlUrlError', (err as Error).toString(), 1);
      console.error(err)
      throw new Error('CANNOT_CRAWL_THIS_URL')
    }
  }

  async checkArweaveIdExistsAndEstimateFee() {
    try {
      logTrackerEvent(this, 'NFTUrlMint', 'CheckArweaveIdExistsAndEstimateFee', this.url, 1);
      const { address, arweaveId, LIKE, ipfsHash, memo } = await this.$axios.$post(
        API_POST_ARWEAVE_ESTIMATE,
        this.formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )
      if (arweaveId) { this.arweaveId = arweaveId }
      this.ipfsHash = ipfsHash
      this.arweaveFeeInfo = {
        to: address,
        amount: new BigNumber(LIKE),
        memo,
      }
    } catch (err) {
      logTrackerEvent(this, 'NFTUrlMint', 'CheckArweaveIdExistsAndEstimateFeeError', (err as Error).toString(), 1);
      // eslint-disable-next-line no-console
      console.error(err)
      throw new Error('CANNOT_ESTIMATE_ARWEAVE_FEE')
    }
  }

  async sendArweaveFeeTx({ to, amount, memo }: { to: string, amount: BigNumber, memo: string }): Promise<void> {
    logTrackerEvent(this, 'NFTUrlMint', 'SendArweaveFeeTx', to, 1);
    if (!this.signer) throw new Error('SIGNER_NOT_INITED')
    if (!to) throw new Error('TARGET_ADDRESS_NOT_SET')
    try {
      const { transactionHash } = await sendLIKE(this.address, to, amount.toFixed(), this.signer, memo)
      this.arweaveFeeTxHash = transactionHash;
      logTrackerEvent(this, 'NFTUrlMint', 'SendArweaveFeeTxSuccess', transactionHash, 1);
    } catch (err) {
      logTrackerEvent(this, 'NFTUrlMint', 'SendArweaveFeeTxError', (err as Error).toString(), 1);
      // eslint-disable-next-line no-console
      console.error(err)
      throw new Error('CANNOT_SEND_ARWEAVE_FEE_TX')
    }
  }

  async submitToArweave(): Promise<void> {
    try {
      logTrackerEvent(this, 'NFTUrlMint', 'SubmitToArweave', this.arweaveFeeTxHash, 1);
      if (!this.arweaveFeeTxHash) throw new Error('ARWEAVE_FEE_TX_HASH_NOT_SET')
      const { arweaveId } = await this.$axios.$post(
        `${API_POST_ARWEAVE_UPLOAD}?txHash=${this.arweaveFeeTxHash}`,
        this.formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 90000,
        },
      )
      logTrackerEvent(this, 'NFTUrlMint', 'SubmitToArweaveSuccess', arweaveId, 1);
      this.arweaveId = arweaveId
    } catch (err) {
      logTrackerEvent(this, 'NFTUrlMint', 'SubmitToArweaveError', (err as Error).toString(), 1);
      // eslint-disable-next-line no-console
      console.error(err)
      throw new Error('CANNOT_SUBMIT_TO_ARWEAVE')
    }
  }

  async registerISCN(): Promise<void> {
    if (!this.signer) {
      this.errorMessage = 'MISSING_SIGNER'
      return
    }
    try {
      logTrackerEvent(this, 'NFTUrlMint', 'SignISCNTx', this.url, 1);
      const res = await signISCNTx(
        formatISCNTxPayload(this.iscnPayload),
        this.signer,
        this.address,
      )
      this.iscnId = res.iscnId
      if (this.url && this.likerId) {
        logTrackerEvent(this, 'NFTUrlMint', 'PostMappingWithCosmosWallet', this.iscnId, 1);
        await postMappingWithCosmosWallet(this.iscnId, this.url, this.likerId, this.signer, this.address)
      }
      if (res) {
      logTrackerEvent(this, 'NFTUrlMint', 'RegisterISCNSuccess', this.iscnId, 1);
        this.$router.push(
          this.localeLocation({
            name: 'nft-iscn-iscnId',
            params: this.iscnParams,
          })!,
        )
      }
    } catch (err) {
      logTrackerEvent(this, 'NFTUrlMint', 'RegisterISCNError', (err as Error).toString(), 1);
      // eslint-disable-next-line no-console
      console.error(err)
      throw new Error(`CANNOT_REGISTER_ISCN, Error: ${((err as Error).message).substring(0,200)}`)
    }
  }

  setError(err: any) {
    this.isLoading = false
    // eslint-disable-next-line no-console
    console.error(err)
    if (axios.isAxiosError(err)) {
      this.toggleSnackbar(
        (err as AxiosError).response?.data || (err as Error).toString(),
      )
    } else {
      this.toggleSnackbar((err as Error).toString())
    }
  }

  onInputURL(url: string) {
    this.errorMessage = ''
    if(this.iscnPrefixRegex.test(url)) {
      this.isInputValueValid = true
      return
    }
    if(this.crawlURLRegex.test(url)) {
      if(url.includes('https://liker.land')){
        this.errorMessage = this.$t('NFTPortal.errorMessage.url.notAllowToCrawl') as string
        this.isInputValueValid = false
        return
      }
        this.isInputValueValid = true
        return
    }
    this.isInputValueValid = false
  }
}
</script>