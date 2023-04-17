<template>
  <MintPageContainer :is-state-transaction="isStateTransaction">
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

      <div v-if="!isReady" class="flex justify-center items-center py-[64px]">
        <ProgressIndicator />
      </div>
      <!-- URL Input -->
      <div
        v-else
        :class="[
          'flex',
          'flex-col',
          'justify-center',
          'items-center',
          'w-full',
        ]"
      >
        <div :class="['flex', 'flex-col', 'justify-center', 'w-full', 'my-[64px]']" @submit.prevent="onSubmit">
          <Label preset="p6" :text="$t('NFTPortal.label.register')" />
          <TextField
            v-model="url"
            class="flex flex-col"
            :is-disabled="isLoading"
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
        <div v-else-if="state === 'INIT' && !hasError" class="ml-auto w-min">
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
        <div v-if="hasError" class="flex flex-col items-end ml-auto">
          <div class="flex items-center gap-[12px]">
            <Button
              preset="outline"
              :text="$t('NFTPortal.button.retry')"
              :is-disabled="!isInputValueValid"
              @click="onSubmit"
            />
            <Button
              v-if="state !== 'INIT'"
              preset="secondary"
              :text="$t('NFTPortal.button.skip')"
              :is-disabled="!isInputValueValid"
              @click="onSkip"
            />
          </div>
          <div class="flex w-full justify-end mt-[20px]">
            <div class="flex items-center rounded-[3px] text-medium-gray">
              <Label class="mr-[8px]" :text="$t('NFTPortal.label.encountered.issue')">
                <template #prepend>
                  <IconDiscord />
                </template>
              </Label>
              <a
                class="flex items-center underline"
                href="https://discord.gg/likecoin"
                target="_blank"
                @click.native.prevent="onReport"
              >
                <span>{{ $t('NFTPortal.label.report') }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Card>
    <span v-if="isSubscriptionMint">Subscription mode is on</span>
  </MintPageContainer>
</template>

<script lang="ts">
import mime from 'mime-types';
import { Vue, Component, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing'
import BigNumber from 'bignumber.js'
import axios, { AxiosError } from 'axios'
import postMappingWithCosmosWallet from '~/utils/cosmos/mapping';

import { getAccountBalance } from '~/utils/cosmos'
import { signISCNTx } from '~/utils/cosmos/iscn'
import { sendLIKE } from '~/utils/cosmos/sign'
import { formatISCNTxPayload } from '~/utils/cosmos/iscn/sign'
import { ISCNRecordWithID, ISCNRegisterPayload } from '~/utils/cosmos/iscn/iscn.type'
import {
  getLikerIdMinApi,
  getAddressLikerIdMinApi,
  API_POST_ARWEAVE_ESTIMATE,
  API_POST_ARWEAVE_UPLOAD,
} from '~/constant/api'
import { logTrackerEvent } from '~/utils/logger'
import { CRAWL_URL_REGEX, ISCN_PREFIX_REGEX, LIKER_LAND_URL } from '~/constant'
import { ISCN_LICENSES, ISCN_PUBLISHERS } from '~/constant/iscn'

const base64toBlob = (base64Data: string, contentType: string, sliceSize = 512) => {
  const byteCharacters = atob(base64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i += 1) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
}

const iscnModule = namespace('iscn')
const walletModule = namespace('wallet')
const subscriptionModule = namespace('subscription')

export enum ErrorType {
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  MISSING_SIGNER = 'MISSING_SIGNER',
  USER_NOT_ISCN_OWNER = 'USER_NOT_ISCN_OWNER'
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
  @iscnModule.Action fetchISCNById!: (arg0: string) => Promise<{
    records: ISCNRecordWithID[]
    owner: string
    latestVersion: Long.Long
  } | null>

  @walletModule.Action('initIfNecessary') initIfNecessary!: () => Promise<any>
  @walletModule.Action toggleSnackbar!: (
    error: string,
  ) => void

  @walletModule.Getter('getType') walletType!: string | null
  @walletModule.Getter('getWalletAddress') address!: string
  @walletModule.Getter('getSigner') signer!: OfflineSigner | null

  @subscriptionModule.Action newMintInstance!: () => Promise<any>
  @subscriptionModule.Action updateMintInstance!: (arg0: {
    status: string
    payload: any
    options?: any
  }) => Promise<any>

  @subscriptionModule.Getter('getAddressIsSubscriber') isSubscriber!: boolean
  @subscriptionModule.Getter('getCurrentMintStatusId') mintStatusId!: string

  state = State.INIT
  url = this.$route.query.url as string || ''
  platform = this.$route.query.platform as string || ''
  ownerWallet = ''
  errorMessage = ''
  iscnFiles: any[] = []
  iscnData: any
  ipfsHash = ''
  arweaveId = ''
  arweaveFeeInfo: any
  arweaveFeeTxHash = ''
  iscnId = this.$route.query.iscn_id as string || ''
  likerId = this.$route.query.liker_id as string || ''
  opener = !!this.$route.query.opener && this.$route.query.opener !== '0'
  isLoading = false
  avatar = null
  balance: string = ''
  isInputValueValid: boolean = false
  isReady: boolean = false
  hasError: boolean = false
  isSubscriptionMint: boolean = false

  get isUpdateMode(): boolean {
    const update = this.$route.query.update as string
    return !!this.iscnId && !!update && update !== '0'
  }

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

  get isStateTransaction() {
    return ([
      State.TO_UPLOAD_TO_ARWEAVE,
      State.TO_REGISTER_ISCN,
    ].includes(this.state as State));
  }

  get formData(): FormData | null {
    if (!this.iscnFiles?.length) { return null }
    const formData = new FormData()
    this.iscnFiles.forEach((element: any) => {
      if (element.blob) {
        formData.append(`${element.key}`, element.blob, `${element.key}`)
      } else {
        formData.append(`${element.key}`, base64toBlob(element.data, element.type), `${element.key}`)
      }
    });
    return formData
  }

  get iscnPayload(): ISCNRegisterPayload {
    const {
      title = '',
      keywords = '',
      author = '',
      authorDescription = '',
      license = '',
      contentFingerprints = [],
      stakeholders = [],
      recordNotes,
      publisher,
      type = 'CreativeWork',
    } = this.iscnData
    let { description = '' } = this.iscnData
    description = this.truncate(description, 200)
    return {
      type,
      name: title,
      description,
      tagsString: keywords,
      url: this.iscnData.url || this.url,
      exifInfo: {},
      license,
      publisher,
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
      authorDescriptions: [authorDescription],
      numbersProtocolAssetId: '',
      contentFingerprints,
      stakeholders,
      recordNotes,
    }
  }

  get iscnParams() {
    const params: any = { iscnId: this.iscnId }
    return params
  }

  get queryParams() {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    // Remove qs used by this page but not next page
    // Pass through other qs
    const {
      url: _,
      iscn_id: _iscnId,
      liker_id: _likerId,
      ...querys
    } = this.$route.query;
    return querys;
    /* eslint-enable @typescript-eslint/no-unused-vars */
  }

  get redirectOrigin(): string {
    const redirectUri: string = this.$route.query.redirect_uri as string;
    if (!redirectUri) return '';
    const url = new URL(redirectUri);
    return url.origin;
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
      if (!this.isUpdateMode) {
        this.$router.push(
          this.localeLocation({
            name: 'nft-iscn-iscnId',
            params: this.iscnParams,
            query: this.queryParams,
          })!,
        )
      } else {
        const res = await this.fetchISCNById(this.iscnId)
        if (res) {
          const iscnOwner = res.owner
          if (iscnOwner !== this.address) {
            this.toggleSnackbar('USER_NOT_ISCN_OWNER')
          }
        }
      }
    }

    const { liker_id: likerId, wallet } = this.$route.query;

    try {
      if (wallet) {
        this.ownerWallet = wallet as string;
        const { data } = await this.$axios.get(getAddressLikerIdMinApi(wallet as string));
        this.avatar = data.avatar;
      } else if (likerId) {
        const { data } = await this.$axios.get(getLikerIdMinApi(likerId as string));
        this.ownerWallet = data.likeWallet;
        this.avatar = data.avatar;
      }
    } catch (error) {
      if ((error as any).response?.status !== 404) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    } finally {
      this.isReady = true
    }

    if (this.url) {
      this.onInputURL(this.url);
    }
    window.addEventListener(
      'message',
      this.onWindowMessage,
      false,
    );
    if (this.opener) {
      try {
        const message = JSON.stringify({
          action: 'ISCN_WIDGET_READY',
        });
        window.opener.postMessage(message, this.redirectOrigin);
      } catch (err) {
        console.error(err);
      }
    }
  }

  @Watch('isSubscriber', { immediate: true })
  onIsSubscriberChange() {
    this.isSubscriptionMint = this.isSubscriber && !this.isUpdateMode;
  }

  @Watch('url')
  reset() {
    this.iscnData = null
    this.iscnFiles = []
    this.ipfsHash = ''
    this.arweaveId = ''
    this.arweaveFeeTxHash = ''
    this.iscnId = ''
    this.state = State.INIT
  }

  onWindowMessage(event: WindowEventHandlersEventMap['message']) {
    if (event && event.data && typeof event.data === 'string') {
      if (this.redirectOrigin && event.origin !== this.redirectOrigin) {
        return;
      }
      const { action, data } = JSON.parse(event.data);
      if (action === 'SUBMIT_ISCN_DATA') {
        // eslint-disable-next-line no-console
        console.info('Received SUBMIT_ISCN_DATA');
        const {
          metadata = {},
          files = [],
        } = data;
        this.onReceiveISCNData(metadata);
        this.onReceiveISCNFiles(files);
        if (files && files.length) {
          this.state = State.TO_ESTIMATE_ARWEAVE_FEE
        } else {
          this.state = State.TO_REGISTER_ISCN
        }
        this.onSubmit();
      }
    }
  }

  onReceiveISCNData(data: any) {
    const {
      fingerprints: contentFingerprints = [],
      stakeholders,
      name,
      description,
      author,
      authorDescription,
      url,
      recordNotes,
      memo,
    } = data;
    let {
      type = 'article',
      publisher,
      license,
      tags = [],
    } = data;
    switch (type) {
      case 'message':
      case 'image':
      case 'photo':
      case 'article': {
        type = type[0].toUpperCase().concat(type.slice(1));
        break;
      }
      default: type = 'CreativeWork';
    }

    if (publisher) {
      if (typeof publisher === 'string' && ISCN_PUBLISHERS[publisher]) {
        license = ISCN_PUBLISHERS[publisher].license || license;
        publisher = ISCN_PUBLISHERS[publisher];
      }
    }
    if (license) {
      if (typeof license === 'string') {
        license = ISCN_LICENSES[license] || license;
      }
    }
    if (!tags) {
      tags = [];
    } else if (typeof tags === 'string') {
      tags = tags.split(',');
    }
    this.iscnData = {
      keywords: tags.join(','),
      type,
      contentFingerprints,
      stakeholders,
      publisher,
      license,
      title: name,
      description,
      author,
      authorDescription,
      url,
      recordNotes,
      memo,
    };
  }

  onReceiveISCNFiles(files: any[]) {
    if (!files || !files.length) {
      // eslint-disable-next-line no-console
      console.info('Received no files for upload');

    }
    // eslint-disable-next-line no-console
    console.info(`Received ${files.length} files for upload`);
    const filteredFiles = files.filter(d => d.filename && d.data);
    const filesWithType = filteredFiles.map((d) => {
      const mimeType = d.mimeType || mime.lookup(d.filename) || 'text/plain';
      return {
        key: d.filename,
        data: d.data,
        type: mimeType,
      };
    })
    this.iscnFiles = filesWithType;
  }

  async onSubmit() {
    this.hasError = false
    try {
      logTrackerEvent(this, 'NFTUrlMint', 'OnSubmit', this.state, 1);
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
    this.hasError = false
    /* eslint-disable no-fallthrough */
    try {
      if (!this.balance) {
        this.balance = (await getAccountBalance(this.address)) as string
      }
      if (!this.isSubscriptionMint && this.balance === '0') {
        throw new Error('INSUFFICIENT_BALANCE')
      }
      switch (this.state) {
        case State.INIT: {
          if (this.ownerWallet && this.address !== this.ownerWallet) {
            throw new Error('PLEASE_USE_OWNER_WALLET_TO_SIGN')
          }
          if (this.iscnPrefixRegex.test(this.url)) {
            this.iscnId = this.url
            this.$router.push(
              this.localeLocation({
                name: 'nft-iscn-iscnId',
                params: this.iscnParams,
                query: this.queryParams,
              })!,
            )
            break
          }

          this.$router.replace({
            query: {
              ...this.$route.query,
              url: this.url,
            },
          })
          this.state = State.TO_CRAWL_URL
        }
        case State.TO_CRAWL_URL:
          await this.crawlUrlData()
          this.state = State.TO_ESTIMATE_ARWEAVE_FEE
        case State.TO_ESTIMATE_ARWEAVE_FEE:
          await this.initIfNecessary() // refresh wallet for subscription detection
          if (!this.isSubscriptionMint) {
            await this.checkArweaveIdExistsAndEstimateFee()
          } else if (!this.mintStatusId) {
            await this.newMintInstance()
            this.$router.replace({ query: {
                ...this.$route.query,
                mint_status_id: this.mintStatusId,
            } })
          }
          this.state = this.arweaveId
            ? State.TO_REGISTER_ISCN
            : State.TO_UPLOAD_TO_ARWEAVE
        case State.TO_UPLOAD_TO_ARWEAVE:
          if (!this.isSubscriptionMint && !this.arweaveFeeTxHash) {
            await this.sendArweaveFeeTx(this.arweaveFeeInfo)
          }
          await this.submitToArweave()
          this.state = State.TO_REGISTER_ISCN
        case State.TO_REGISTER_ISCN:
          await this.registerISCN()
        default:
          break
      }
    } catch (error) {
      this.setError(error)
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
      const { title, description, keywords, author, body, images = [] } = data
      if (!body) { throw new Error('CANNOT_CRAWL_THIS_URL') }
      if (title === 'patreon.com' && description === '') { throw new Error('SITE_NOT_CRAWLABLE: pateron') }
      this.iscnData = { title, description, keywords, author }
      this.iscnFiles = [{
        key: 'index.html',
        blob: new Blob([body], { type: "text/html" }),
      }].concat(images);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      logTrackerEvent(this, 'NFTUrlMint', 'CrawlUrlError', (err as Error).toString(), 1);
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
    await this.initIfNecessary()
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
      let arweaveResult;
      if (this.isSubscriptionMint) {
        arweaveResult = await this.updateMintInstance(
          {
            status: 'arweave',
            payload: this.formData,
            options: {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              timeout: 90000,
            },
          },
        );
      } else {
        if (!this.arweaveFeeTxHash) throw new Error('ARWEAVE_FEE_TX_HASH_NOT_SET')
        arweaveResult = await this.$axios.$post(
          `${API_POST_ARWEAVE_UPLOAD}?txHash=${this.arweaveFeeTxHash}`,
          this.formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            timeout: 90000,
          },
        )
      }
      const { arweaveId, txHash } = arweaveResult;
      logTrackerEvent(this, 'NFTUrlMint', 'SubmitToArweaveSuccess', arweaveId, 1);
      this.arweaveId = arweaveId
      if (this.opener) {
        try {
          const message = JSON.stringify({
            action: 'ARWEAVE_SUBMITTED',
            data: {
              arweaveId,
              txHash,
              tx_hash: txHash,
            },
          });
          window.opener.postMessage(message, this.redirectOrigin);
        } catch (err) {
          console.error(err);
        }
      }
    } catch (err) {
      logTrackerEvent(this, 'NFTUrlMint', 'SubmitToArweaveError', (err as Error).toString(), 1);
      // eslint-disable-next-line no-console
      console.error(err)
      throw new Error('CANNOT_SUBMIT_TO_ARWEAVE')
    }
  }

  async registerISCN(): Promise<void> {
    await this.initIfNecessary()
    if (!this.signer) {
      throw new Error('MISSING_SIGNER')
    }
    let res
    if (this.isSubscriptionMint) {
      res = await this.updateMintInstance({
        status: 'iscn',
        payload: { metadata: formatISCNTxPayload(this.iscnPayload) },
      });
      const { iscnId } = res
      this.iscnId = iscnId
    } else {
      try {
        logTrackerEvent(this, 'NFTUrlMint', 'SignISCNTx', this.url, 1);
        res = await signISCNTx(
          formatISCNTxPayload(this.iscnPayload),
          this.signer,
          this.address,
          {
            iscnId: this.isUpdateMode ? this.iscnId : undefined,
            memo: this.iscnPayload.memo,
          },
        )
        this.iscnId = res.iscnId
        if (this.url && this.likerId) {
          logTrackerEvent(this, 'NFTUrlMint', 'PostMappingWithCosmosWallet', this.iscnId, 1);
          await postMappingWithCosmosWallet(this.iscnId, this.url, this.likerId, this.signer, this.address)
        }
      } catch (err) {
        logTrackerEvent(this, 'NFTUrlMint', 'RegisterISCNError', (err as Error).toString(), 1);
        // eslint-disable-next-line no-console
        console.error(err)
        throw new Error(`CANNOT_REGISTER_ISCN, Error: ${((err as Error).message).substring(0,200)}`)
      }
    }
    if (this.iscnId) {
      if (this.opener) {
        try {
          const {
            txHash,
            iscnId,
          } = res;
          const message = JSON.stringify({
            action: 'ISCN_SUBMITTED',
            data: {
              tx_hash: txHash,
              txHash,
              iscnId,
              iscnVersion: iscnId.split('/')[iscnId.split('/').length - 1],
              timestamp: Math.floor(Date.now() / 1000),
            },
          });
          window.opener.postMessage(message, this.redirectOrigin);
        } catch (err) {
          console.error(err);
        }
      }
      logTrackerEvent(this, 'NFTUrlMint', 'RegisterISCNSuccess', this.iscnId, 1);
      this.$router.push(
        this.localeLocation({
          name: 'nft-iscn-iscnId',
          params: this.iscnParams,
          query: this.queryParams,
        })!,
      )
    }
  }

  setError(err: any) {
    this.isLoading = false
    this.hasError = true
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
    if (this.iscnPrefixRegex.test(url)) {
      this.isInputValueValid = true
      return
    }
    if (this.crawlURLRegex.test(url)) {
      if (url.includes(LIKER_LAND_URL)) {
        this.errorMessage = this.$t(
          'NFTPortal.errorMessage.url.notAllowToCrawl',
        ) as string
        this.isInputValueValid = false
        return
      }
      this.isInputValueValid = true
      return
    }
    this.isInputValueValid = false
  }

  onReport() {
    logTrackerEvent(this, 'NFTUrlMint', 'onClickReportIssue', this.state, 1);
  }
}
</script>