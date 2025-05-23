<template>
  <MintPageContainer :is-state-transaction="isStateTransaction">
    <ContentCard
      class="max-w-[600px]"
      :title="pageTitle"
      :step="currentStep"
      :total-step="4"
    >
      <!-- header Icon -->
      <template #label-prepend>
        <IconAddToISCN v-if="currentPage !== 'MintProcess'" class="w-[20px]" />
        <IconStar v-else class="w-[20px]" />
      </template>

      <!-- body  -->

      <NFTMintPreview
        v-if="currentPage === 'NFTPreview'"
        class="w-[90%] mx-auto mb-[32px]"
        :name="NftName"
        :description="NftDescription"
        :img-src="imgSrc"
        :is-loading="isLoadingPreviewOG"
        :should-show-no-url-warning="shouldShowNoUrlWarning"
        @edit-name="onEditNftName"
        @edit-description="onEditNftDescription"
        @edit-image="onEditOgImage"
        @reset-image="onResetImage"
      />

      <NFTMintWriterMessage
        v-if="currentPage === 'MessagePreview'"
        :address="address"
        :mint-amount.sync="mintAmount"
        :max-mint-amount="maxMintAmount"
        :reserve-amount.sync="reserveNft"
        :collect-expiry-date.sync="collectExpiryDate"
        :is-news-press="isNewsPress"
        @message-change="(value) => (message = value)"
        @update-mint-amount.once="handleInputMintAmount"
        @update-reserve.once="handleInputReserveNft"
        @update-initial-batch="handleInputInitialBatch"
      />

      <NFTMintProcess
        v-if="currentPage === 'MintProcess'"
        :iscn-id="iscnId"
        :ar-id="ogImageArweaveId"
        :class-id="classId"
        :nft-link="(doneOverride || apiData) && detailsPageURL"
        :nft-model-url="(doneOverride || apiData) && modelURL"
        :has-error="hasError"
        :error-message="errorMessage"
        :tx-status="txStatus"
        :state="mintState"
      />

      <!-- Reserve NFTs Result -->
      <div
        v-if="currentPage === 'MintProcess' && mintState !== 'reserving' && !!reserveNft"
        class="flex justify-start mt-[-28px]"
      >
        <div class="flex text-[#BBBBBB] text-[12px] items-center border-2 border-[#E6F4F2] rounded-[4px] px-[6px] py-[2px]">
          <span>{{ $t('NFTPortal.label.reserve.result', { num: reserveNft })}}</span>
        </div>
      </div>

      <!-- footer -->

      <template #footer>
        <div v-if="isLoading" class="flex flex-col items-end w-full">
          <ProgressIndicator class="w-min" />
          <Label
            class="text-[8px] text-medium-gray text-center mt-[8px] w-min whitespace-nowrap"
            >{{ loadingText }}</Label
          >
        </div>
        <div v-else-if="!hasError" class="ml-auto w-min">
          <Button
            preset="secondary"
            :text="buttonText"
            @click="handleClickButton"
          >
            <template v-if="state !== 'done'" #append>
              <IconArrowRight />
            </template>
          </Button>
        </div>
        <div v-else-if="hasError" class="flex flex-col items-end ml-auto">
          <Button preset="outline" :text="$t('IscnRegisterForm.signDialog.retry')" @click="handleClickButton" />
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
      </template>
    </ContentCard>
  </MintPageContainer>
</template>

<script lang="ts">
import qs from 'querystring'
// eslint-disable-next-line import/no-extraneous-dependencies
import Long from 'long';
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing'
import { parseAndCalculateStakeholderRewards } from '@likecoin/iscn-js/dist/iscn/parsing';
import { Vue, Component, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { v4 as uuidv4 } from 'uuid'
import {
  formatMsgCreateRoyaltyConfig,
  formatMsgMintNFT,
  formatMsgNewClass,
  formatMsgSend,
} from '@likecoin/iscn-js/dist/messages/likenft'
import { calculateNFTClassIdByISCNId } from '@likecoin/iscn-js/dist/nft/nftId'
import BigNumber from 'bignumber.js'
import axios, { AxiosError } from 'axios'
import Hash from 'ipfs-only-hash'

import {
  LIKER_NFT_TARGET_ADDRESS,
  API_LIKER_NFT_MINT,
  getNftClassImage,
  getNftClassUriViaIscnId,
  getNftUriViaNftId,
  getChainNFTIdList,
  getNftModelApi,
} from '~/constant/api'
import { getSigningClient } from '~/utils/cosmos/iscn/sign'
import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type'
import { ARWEAVE_ENDPOINT, LIKER_LAND_URL, LIKER_NFT_API_WALLET, LIKER_NFT_FEE_WALLET } from '~/constant'
import sendLIKE from '~/utils/cosmos/sign'
import { logTrackerEvent } from '~/utils/logger'
import { estimateBundlrFilePrice, uploadSingleFileToBundlr } from '~/utils/arweave/v2';

const iscnModule = namespace('iscn')
const walletModule = namespace('wallet')
const bookApiModule = namespace('book-api')

export enum ErrorType {
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  MISSING_SIGNER = 'MISSING_SIGNER',
  USER_NOT_ISCN_OWNER = 'USER_NOT_ISCN_OWNER',
}

export enum State {
  PREVIEW = 'preview',
  MESSAGE = 'message',
  CREATE = 'create',
  MINT = 'mint',
  DONE = 'done'
}

export enum CurrentPage {
  NFT_PREVIEW = 'NFTPreview',
  MESSAGE_PREVIEW = 'MessagePreview',
  MINT_PROCESS = 'MintProcess',
}

export enum TxStatus {
  SIGN = 'sign',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
}

export enum MintState {
  UPLOADING = 'uploading',
  CREATING = 'creating',
  MINTING = 'minting',
  DONE = ''
}

const DEFAULT_MINT_AMOUNT = 32

@Component({
  fetch({ params, redirect }) {
    if (!params.iscnId) {
      redirect({ name: 'index' })
    }
  },
  head() {
    return {
      link: [{
          rel: 'modulepreload',
          href:
            'https://unpkg.com/@google/model-viewer@3.0.2/dist/model-viewer.min.js',
          as: 'script',
        }],
      script: [{
          type: 'module',
          src:
            'https://unpkg.com/@google/model-viewer@3.0.2/dist/model-viewer.min.js',
          async: true,
        }],
    };
  },
  layout: 'wallet',
})
export default class NFTMintPage extends Vue {
  @iscnModule.Getter getISCNById!: (arg0: string) => ISCNRecordWithID
  @iscnModule.Action fetchISCNById!: (arg0: string) => Promise<{
    records: ISCNRecordWithID[]
    owner: string
    latestVersion: Long.Long
  } | null>

  @walletModule.Action toggleSnackbar!: (error: string) => void
  @walletModule.Action('initIfNecessary') initIfNecessary!: () => Promise<any>
  @walletModule.Action('fetchWalletBalance') fetchWalletBalance!: () => void

  @walletModule.Getter('getType') walletType!: string | null
  @walletModule.Getter('getWalletAddress') address!: string
  @walletModule.Getter('getSigner') signer!: OfflineSigner | null
  @walletModule.Getter('getFormattedBalance') balance!: number | 0

  @bookApiModule.Getter('getToken') getToken!: string

  platform = this.$route.query.platform as string || ''
  isNewsPress = !!this.$route.query.news_press && this.$route.query.news_press !== '0'


  classId: string = ''
  nftsIds: string[] = []
  iscnOwner: string = ''
  iscnData: any = null
  apiData: any = null

  NftName: string = '';
  NftDescription: string  = '';

  message: string = ''

  isCustomOgimage = false
  defaultOgImageBlob: Blob | null = null
  ogImageBlob: Blob | null = null
  arweaveFeeInfo: any =  null
  ogImageArweaveId: string = ''
  ogImageArweaveFeeTxHash: string = ''
  chainNFTIdList: any = null

  mintNFTResult: any = null
  sendNFTResult: any = null
  postInfo: any = null

  isLoading = false
  isLoadingPreviewOG = true
  mintState = MintState.UPLOADING
  isPreviewChecked = false
  isMessageChecked = false

  hasError = false
  errorMessage: string = ''
  txStatus: string = ''

  reserveNft: number = 0
  mintAmount: number = Math.min(this.maxMintAmount, DEFAULT_MINT_AMOUNT)
  initialBatch: number = 6
  shouldShowNoUrlWarning: boolean = false

  collectExpiryDate: string = ''

  get isUserISCNOwner(): boolean {
    if (!this.iscnOwner) return false
    return (this.iscnOwner === this.address)
  }

  get isWritingNFT(): boolean {
    return this.mintAmount > this.reserveNft;
  }

  get NFTPrefix(): string {
    return (this.$route.query.nft_prefix as string) || 'Writing NFT';
  }

  get hasOpener(): boolean {
    const { opener = 0 } = this.$route.query
    return window?.opener && (opener && opener !== '0');
  }

  get redirectOrigin(): string {
    const redirectUri: string = this.$route.query.redirect_uri as string;
    if (!redirectUri) return '';
    const url = new URL(redirectUri);
    return url.origin;
  }

  get iscnId(): string {
    const { iscnId } = this.$route.params
    return iscnId
  }

  get doneOverride(): boolean {
    const { done } = this.$route.query
    return done === '1'
  }

  get state(): string {
    if (this.apiData || this.doneOverride) return State.DONE
    if (this.classId) return State.MINT
    if (this.isMessageChecked) return State.CREATE
    if (this.isPreviewChecked) return State.MESSAGE
    return State.PREVIEW
  }

  get currentPage() {
    switch (this.state) {
      case State.PREVIEW:
        return CurrentPage.NFT_PREVIEW

      case State.MESSAGE:
        return CurrentPage.MESSAGE_PREVIEW

      case State.CREATE:
      case State.MINT:
      case State.DONE:
        return CurrentPage.MINT_PROCESS

      default:
        return CurrentPage.NFT_PREVIEW
    }
  }

  get pageTitle() {
    switch (this.currentPage) {
      case CurrentPage.NFT_PREVIEW:
        return this.$t('NFTPortal.process.title.preview')
      case CurrentPage.MESSAGE_PREVIEW:
        return this.$t('NFTPortal.process.title.message')
      case CurrentPage.MINT_PROCESS:
        return this.$t('NFTPortal.process.title.mint')

      default:
        return this.$t('NFTPortal.process.title.preview')
    }
  }

  get buttonText(): string {
    if (this.hasError) return 'Retry'
    if (this.state === State.DONE) return this.$t('NFTPortal.button.view') as string
    if (this.state === State.MINT) return this.$t('NFTPortal.button.mint') as string
    if (this.state === State.CREATE) return this.$t('NFTPortal.button.create') as string
    if (this.state === State.MESSAGE) return this.$t('NFTPortal.button.next') as string
    return this.$t('NFTPortal.button.next') as string
  }

  get labelText(): string {
    if (this.state === State.DONE) return this.$t('NFTPortal.title.done') as string
    if (this.state === State.MESSAGE) return this.$t('NFTPortal.title.message') as string
    if (this.state === State.MINT) return this.$t('NFTPortal.title.mint') as string
    return this.$t('NFTPortal.title.mint') as string
  }

  get currentStep(): number {
    switch (this.state) {
      case State.PREVIEW:
        return 2

      case State.MESSAGE:
        return 3

      case State.CREATE:
      case State.MINT:
      case State.DONE:
        return 4

      default:
        return 2
    }
  }

  get loadingText(): string {
    if (this.mintState === MintState.UPLOADING) {
      if (!this.arweaveFeeInfo) {
        return this.$t('NFTPortal.loadingMessage.estimateImgFee') as string
      }
      if (!this.ogImageArweaveFeeTxHash) {
        return this.$t('NFTPortal.loadingMessage.waitingImgFee') as string
      }
      if (!this.ogImageArweaveId)
        return this.$t('NFTPortal.loadingMessage.uploadImg') as string
    }

    if (this.state === State.MINT)
      return this.$t('NFTPortal.loadingMessage.mint') as string

    if (this.state === State.CREATE)
      return this.$t('NFTPortal.loadingMessage.createClass') as string

    return this.$t('NFTPortal.loadingMessage.createClass') as string
  }

  get isStateTransaction() {
    return ([
      State.MINT,
      State.CREATE,
    ].includes(this.state as State));
  }

  get ogImageUri(): string {
    if (this.ogImageArweaveId) return `ar://${this.ogImageArweaveId}`
    if (this.classId) return getNftClassImage(this.classId)
    return ''
  }

  get ogImageByteSize(): number {
    if (!this.ogImageBlob) return 0
    return this.ogImageBlob.size
  }

  get detailsPageURL(): string {
    return `${LIKER_LAND_URL}/nft/class/${encodeURIComponent(this.classId)}`
  }

  get modelURL(): string {
    return getNftModelApi(this.classId);
  }

  get isUsingMobileApp() {
    return this.walletType?.includes('mobile') || this.walletType?.includes('walletconnect') || this.isUsingLikerLandApp
  }

  get isUsingLikerLandApp() {
    return this.walletType === 'likerland-app'
  }

  get isTransactionSizeLimited() {
    return this.isUsingMobileApp
  }

  get createNftClassPayload() {
    let metadata: {[key: string]: any} = {
      image: this.ogImageUri,
      external_url: this.iscnData.contentMetadata?.url,
      message: this.message || '',
    }
    metadata = Object.assign(metadata, {
      nft_meta_collection_id: 'likerland_writing_nft',
      nft_meta_collection_name: 'Writing NFT',
      nft_meta_collection_description: 'Writing NFT by Liker Land',
    })
    let payload = {
      symbol: 'WRITING',
      name: this.NftName,
      description: this.NftDescription,
      metadata,
    };
    if (this.isCustomOgimage) payload.metadata.is_custom_image = 'true';
    if (this.isWritingNFT) {
      payload = Object.assign(payload, {
        uri: getNftClassUriViaIscnId(this.iscnId),
      });
    }
    return payload
  }

  // eslint-disable-next-line class-methods-use-this
  get createNftClassConfig() {
    return {
      maxSupply: Long.fromNumber(0),
      burnable: true,
    };
  }

  get maxMintAmount() {
    if (this.isTransactionSizeLimited) {
      return 30;
    }
    return 256;
  }

  get imgSrc() {
    if (this.ogImageBlob) {
      return URL.createObjectURL(this.ogImageBlob)
    }
    return undefined
  }

  get isFree() {
    return this.initialBatch === -1
  }

  get collectExpiryAt() {
    if (this.collectExpiryDate) {
      return Date.parse(this.collectExpiryDate);
    }
    return undefined;
  }

  async mounted() {
    try {
      await Promise.all([
        this.getISCNInfo(),
        this.getMintInfo(),
      ])
      if (this.$route.query.done === '1') {
        // for handling refresh after all reserve nft
        // state is set in computed
        this.txStatus = TxStatus.COMPLETED
        return;
      }
      await this.getOgImage()
      if (!this.isUserISCNOwner) {
        throw new Error(ErrorType.USER_NOT_ISCN_OWNER)
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      this.setError(error)
    }
  }

  @Watch('maxMintAmount', { immediate: true })
  onMaxMintAmount(max: number) {
    if (this.mintAmount > max) {
      this.mintAmount = max
    }
  }

  handleClickButton() {
    this.hasError = false
    this.errorMessage = ''
    switch (this.state) {
      case 'preview':
        this.isPreviewChecked = true
        break
      case 'message':
        this.isMessageChecked = true
        this.doAction()
        break
      default:
        this.doAction()
    }
  }

  async doAction() {
    try {
      this.hasError = false
      this.errorMessage = ''
      await this.fetchWalletBalance()
      if (this.balance === 0) {
        logTrackerEvent(this, 'IscnMintNFT', 'doActionNFTError', ErrorType.INSUFFICIENT_BALANCE, 1);
        throw new Error(ErrorType.INSUFFICIENT_BALANCE)
      }
      /* eslint-disable no-fallthrough */
      switch (this.state) {
        case 'create': {
          this.isLoading = true

          if (!this.isUserISCNOwner) {
            logTrackerEvent(this, 'IscnMintNFT', 'CreateNFTError', ErrorType.USER_NOT_ISCN_OWNER, 1);
            throw new Error(ErrorType.USER_NOT_ISCN_OWNER)
          }

          if (this.ogImageBlob) {
            this.mintState = MintState.UPLOADING
            this.arweaveFeeInfo = await this.checkArweaveIdExistsAndEstimateFee()
            if (!this.ogImageArweaveId && !this.ogImageArweaveFeeTxHash && this.arweaveFeeInfo) {
              await this.sendArweaveFeeTx(this.arweaveFeeInfo)
            }
            if (!this.ogImageArweaveId) await this.submitToArweave()
          }
          this.mintState = MintState.CREATING
          this.classId = await this.createNftClass()
          this.mintState = MintState.DONE
          if (!this.classId) break
          this.$router.replace({ query: {
            ...this.$route.query,
            class_id: this.classId,
          } })
        }
        case 'mint': {
          this.isLoading = true
          this.mintState = MintState.MINTING
          if (!this.mintNFTResult || (this.isWritingNFT && !this.sendNFTResult)) {
            await this.checkIsNFTIdListExist()
            if (!this.chainNFTIdList) {
              await this.mintNFT()
              if (!this.mintNFTResult || this.isWritingNFT && !this.sendNFTResult) break
            }
          }
          if (this.isWritingNFT) {
            await this.postMintInfo()
            if (!this.postInfo) break
            await this.getMintInfo()
          } else {
            this.$router.replace({ query: {
              ...this.$route.query,
              done: '1',
            } })
          }
          this.txStatus = TxStatus.COMPLETED
          this.isLoading = false
          this.mintState = MintState.DONE
          break
        }
        case 'done':
          window.location.href = this.detailsPageURL
        default:
      }
      /* eslint-enable no-fallthrough */
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      this.mintState = MintState.DONE
      this.setError(error)
    } finally {
      this.fetchWalletBalance()
    }
  }

  async checkIsNFTIdListExist() {
    try {
      const { data } = await this.$axios.get(getChainNFTIdList(this.classId))
      const { nfts } = data.owners.find((owner: any) => owner.owner === LIKER_NFT_TARGET_ADDRESS);
      this.chainNFTIdList = nfts;
    } catch (error) {
      // no need to handle
    }
  }

  getMintNftPayload(id: string) {
    return {
      id,
      uri: this.isWritingNFT ? getNftUriViaNftId(this.classId, id) : '',
      metadata: {
        name: this.NftName,
        image: this.ogImageUri,
        message: this.message,
      },
    }
  }

  async getOgImageIpfsHash(): Promise<string> {
    if (!this.ogImageBlob) return ''
    return Hash.of(Buffer.from(await this.ogImageBlob.arrayBuffer()))
  }

  async getISCNInfo() {
    try {
      const res = await this.fetchISCNById(this.iscnId)
      if (res) {
        this.iscnData = res.records[0].data
        this.iscnOwner = res.owner
        this.NftName =`${this.NFTPrefix ? `${this.NFTPrefix} - ` : ''}${this.iscnData?.contentMetadata?.name || 'NFT'}`;
        this.NftDescription =`${this.iscnData?.contentMetadata?.description || ''}`;
        if (!this.iscnData.contentMetadata?.url) {
          logTrackerEvent(this, 'IscnMintNFT', 'GetISCNInfoWarning', 'No URL in ISCN\'s metadata', 1);
          this.shouldShowNoUrlWarning = true
        }
      }
    } catch (error) {
      logTrackerEvent(this, 'IscnMintNFT', 'GetISCNInfoError', (error as Error).toString(), 1);
      // eslint-disable-next-line no-console
      console.error(error)
      this.throwCustomError('ISCN_NOT_FOUND', error as Error)
    }
  }

  async getMintInfo() {
    if (this.$route.query.class_id) {
      this.classId = this.$route.query.class_id as string
    }
    try {
      const { data } = await this.$axios.get(API_LIKER_NFT_MINT, {
        params: {
          iscn_id: this.iscnId,
        },
        paramsSerializer: (params) => qs.stringify(params),
      })
      this.classId = data.classId
      this.apiData = data
      if (data.classId) {
        this.txStatus = TxStatus.COMPLETED

        if (this.hasOpener) {
          try {
            window.opener.postMessage(JSON.stringify({
              action: 'NFT_MINT_DATA',
              data,
            }), this.redirectOrigin)
          } catch (error) {
            logTrackerEvent(this, 'IscnMintNFT', 'PostMessageNFTMintDataError',  (error as Error).toString(), 1);
            // eslint-disable-next-line no-console
            console.error(error);
          }
        }
      }
    } catch (err) {
      if (!axios.isAxiosError(err) || (err as AxiosError).response?.status !== 404) {
        logTrackerEvent(this, 'IscnMintNFT', 'GetMintInfoError', (err as Error).toString(), 1);
        // eslint-disable-next-line no-console
        console.error(err)
      }
    }
  }

  onEditNftName(name: string) {
    this.NftName = name;
    logTrackerEvent(this, 'IscnMintNFT', 'MintEditNftName', this.iscnId, 1);
  }

  onEditNftDescription(description: string) {
    this.NftDescription = description;
    logTrackerEvent(this, 'IscnMintNFT', 'MintEditNftDescription', this.iscnId, 1);
  }

  onEditOgImage(imageData: File | Blob) {
    this.ogImageBlob = imageData;
    this.ogImageArweaveId = '';
    this.isCustomOgimage = true;
    logTrackerEvent(this, 'IscnMintNFT', 'MintEditNftImage', this.iscnId, 1);
  }

  async getOgImage() {
    try {
      this.isLoadingPreviewOG = true
      let arweaveID = this.$route.query.og_image_arweave_id as string;
      if (!arweaveID && this.iscnData.contentMetadata?.['@type'] === 'Photo') {
        const arweaveURI = this.iscnData.contentFingerprints?.find((f: string) => f.startsWith('ar://'));
        if (arweaveURI) {
          arweaveID = arweaveURI.replace('ar://', '');
        }
      }
      if (arweaveID) {
        try {
          const { data } = await this.$axios.get(`${ARWEAVE_ENDPOINT}/${arweaveID}`, { responseType: 'blob' })
          this.ogImageBlob = data
          this.defaultOgImageBlob = data
          this.ogImageArweaveId = arweaveID
          this.isCustomOgimage = true;
          logTrackerEvent(this, 'IscnMintNFT', 'GetOgImageExists', arweaveID, 1);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err)
        }
      }
      if (!this.ogImageBlob && !this.ogImageArweaveId) {
        const url = this.iscnData.contentMetadata?.url
        if (!url) {
          logTrackerEvent(this, 'IscnMintNFT', 'GetOgImageNotExists', this.iscnId, 1);
          throw new Error(this.$t('NFTPortal.errorMessage.urlNotExists') as string);
        }
        logTrackerEvent(this, 'IscnMintNFT', 'GetOgImageExists', url, 1);
        const { data } = await this.$axios.get(`/crawler/ogimage?url=${encodeURIComponent(url)}`, { responseType: 'blob' })
        this.ogImageBlob = data
        this.defaultOgImageBlob = data
      }
      this.isLoadingPreviewOG = false
    } catch (error) {
      logTrackerEvent(this, 'IscnMintNFT', 'GetOgImageError', (error as Error).toString(), 1);
      // eslint-disable-next-line no-console
      console.error(error)
      this.isLoadingPreviewOG = false
    }
  }

  async checkArweaveIdExistsAndEstimateFee() {
    try {
      logTrackerEvent(this, 'IscnMintNFT', 'CheckArweaveIdExistsAndEstimateFee', this.iscnId, 1);
      const { address, arweaveId, LIKE, memo } = await estimateBundlrFilePrice({
        fileSize: this.ogImageByteSize, ipfsHash: await this.getOgImageIpfsHash(),
      })
      this.ogImageArweaveId = arweaveId
      return {
        to: address,
        amount: new BigNumber(LIKE),
        memo,
      }
    } catch (err) {
      logTrackerEvent(this, 'IscnMintNFT', 'CheckArweaveIdExistsAndEstimateFeeError', (err as Error).toString(), 1);
      // eslint-disable-next-line no-console
      console.error(err)
      this.throwCustomError('CANNOT_ESTIMATE_ARWEAVE_FEE', err as Error)
      return false
    }
  }

  async sendArweaveFeeTx({ to, amount, memo }: { to: string, amount: BigNumber, memo: string }): Promise<void> {
    await this.initIfNecessary()
    if (!this.signer) {
      logTrackerEvent(this, 'IscnMintNFT', 'SendArweaveFeeTxError', 'SIGNER_NOT_INITED', 1);
      throw new Error('SIGNER_NOT_INITED')
    }
    if (!to) {
      logTrackerEvent(this, 'IscnMintNFT', 'SendArweaveFeeTxError', 'TARGET_ADDRESS_NOT_SET', 1);
      throw new Error('TARGET_ADDRESS_NOT_SET')
    }
    try {
      const { transactionHash } = await sendLIKE(this.address, to, amount.toFixed(), this.signer, memo)
      this.ogImageArweaveFeeTxHash = transactionHash
      logTrackerEvent(this, 'IscnMintNFT', 'SendArweaveFeeTxSuccess', transactionHash, 1);
    } catch (err) {
      logTrackerEvent(this, 'IscnMintNFT', 'SendArweaveFeeTxError', (err as Error).toString(), 1);
      // eslint-disable-next-line no-console
      console.error(err)
      this.throwCustomError('CANNOT_SEND_ARWEAVE_FEE_TX', err as Error)
    }
  }

  async submitToArweave(): Promise<void> {
    try {
      logTrackerEvent(this, 'IscnMintNFT', 'SubmitToArweave', this.ogImageArweaveFeeTxHash, 1);
      if (!this.ogImageBlob) {
        throw new Error('OG_IMAGE_NOT_SET')
      }
      if (!this.ogImageArweaveFeeTxHash) {
        throw new Error('ARWEAVE_FEE_TX_HASH_NOT_SET')
      }
      const arrayBuffer = await this.ogImageBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const { arweaveId } = await uploadSingleFileToBundlr(buffer, {
        fileSize: this.ogImageByteSize,
        ipfsHash: await this.getOgImageIpfsHash(),
        fileType: this.ogImageBlob.type,
        txHash: this.ogImageArweaveFeeTxHash,
        token: this.getToken,
      });
      logTrackerEvent(this, 'IscnMintNFT', 'SubmitToArweaveSuccess', arweaveId as string, 1);
      this.ogImageArweaveId = arweaveId as string
    } catch (err) {
      logTrackerEvent(this, 'IscnMintNFT', 'SubmitToArweaveError', (err as Error).toString(), 1);
      // eslint-disable-next-line no-console
      console.error(err)
      this.throwCustomError('CANNOT_UPLOAD_TO_ARWEAVE', err as Error)

    }
  }

  onResetImage() {
    this.ogImageBlob = this.defaultOgImageBlob;
    this.isCustomOgimage = false;
  }

  async postMintInfo() {
    try {
      logTrackerEvent(this, 'IscnMintNFT', 'PostMintInfo', this.classId, 1);
      const { data } = await this.$axios.post(
        API_LIKER_NFT_MINT,
        {
          contentUrl: this.iscnData.contentMetadata?.url,
          initialBatch: this.initialBatch,
          reservedNftCount: this.reserveNft,
          isFree: this.isFree,
          collectExpiryAt: this.collectExpiryAt,
        },
        {
          params: {
            iscn_id: this.iscnId,
            class_id: this.classId,
            platform: this.platform,
          },
          paramsSerializer: (params) => qs.stringify(params),
        },
      )
      this.postInfo = data
      logTrackerEvent(this, 'IscnMintNFT', 'PostMintInfoSuccess', this.classId, 1);
    } catch (error: any) {
      // If the API returns a status of 409, it indicates that the request may have already successful
      // and a duplicate request was made.
      if (error?.response?.status === 409) {
        // Instead of throwing an error, perform the next step in the process
        await this.getMintInfo();
        return;
      }
      // eslint-disable-next-line no-console
      console.error(error)
      logTrackerEvent(this, 'IscnMintNFT', 'PostMintInfoError', (error as Error).toString(), 1);
      this.throwCustomError('CANNOT_POST_MINT_INFO', error as Error)
    }
  }

  async createNftClass() {
    let classId
    try {
      await this.initIfNecessary()
      if (!this.signer) return '';
      const signingClient = await getSigningClient()
      await signingClient.setSigner(this.signer)
      logTrackerEvent(this, 'IscnMintNFT', 'CreateNftClass', this.iscnId, 1);
      this.txStatus = TxStatus.PROCESSING

      const queryClient = signingClient.getISCNQueryClient()
      const q = await queryClient.getQueryClient()
      // expect no pagination (i.e. <= 100 items) for existing class under ISCN
      const { classes = [] } = await q.likenft.classesByISCN(this.iscnId).catch(() => ({} as any))
      const existingClassesLength = classes?.length || 0;
      const expectedClassId = calculateNFTClassIdByISCNId(this.iscnId, existingClassesLength)

      let messages = [formatMsgNewClass(
        this.address,
        this.iscnId,
        this.createNftClassPayload,
        this.createNftClassConfig,
      )]
      const config = await this.getRoyaltyConfig();
      if (config) {
        messages.push(formatMsgCreateRoyaltyConfig(this.address, expectedClassId, config))
      }
      const { mintMessages, sendMessages } = this.getNFTMessages(expectedClassId);
      if (!this.isTransactionSizeLimited) {
        messages.push(...mintMessages, ...sendMessages);
        const res = await signingClient.sendMessages(this.address, messages);
        this.mintNFTResult = res;
        this.sendNFTResult = res;
      } else {
        messages = messages.concat(mintMessages);
        this.mintNFTResult = await signingClient.sendMessages(this.address, messages);
      }
      classId = expectedClassId
    } catch (error) {
      logTrackerEvent(this, 'IscnMintNFT', 'CreateNftClassError', (error as Error).toString(), 1);
      // eslint-disable-next-line no-console
      console.error(error)
      if ((error as Error).message?.includes('code 11')) {
        throw new Error('CREATE_NFT_CLASS_TX_RUNS_OUT_OF_GAS')
      }
      throw error;
    }
    logTrackerEvent(this, 'IscnMintNFT', 'CreateNftClassSuccess', classId, 1)
    return classId
  }

  async getRoyaltyConfig() {
    try {
      const rateBasisPoints = Long.fromNumber(1000); // 10% as in current chain config
      const feeAmount = 25000; // 2.5%
      const userAmount = 1000000 - feeAmount; // 1000000 - fee
      const rewardMap = await parseAndCalculateStakeholderRewards(this.iscnData.stakeholders, this.iscnOwner, {
        precision: 0,
        totalAmount: userAmount,
      });
      const rewards = Array.from(rewardMap.entries());
      const stakeholders = rewards.map((r) => {
        const [
          address,
          { amount },
        ] = r;
        return {
          account: address,
          weight: Long.fromString(amount, 10),
        };
      });
      stakeholders.push({
          account: LIKER_NFT_FEE_WALLET,
          weight: Long.fromNumber(feeAmount),
      })
      logTrackerEvent(this, 'IscnMintNFT', 'CreateNftClass', this.iscnId, 1);
      return {
        rateBasisPoints,
        stakeholders,
      };
    } catch (err) {
      // Don't throw on royalty create, not critical for now
      // eslint-disable-next-line no-console
      console.error(err);
    }
    return null;
  }

  getNFTMessages(classId = this.classId) {
    if (!this.nftsIds.length) this.nftsIds = [...Array(this.mintAmount).keys()]
        .map((_) => `writing-${uuidv4()}`);
      const nfts = this.nftsIds.map(id => this.getMintNftPayload(id))
      const mintMessages = nfts.map((i) =>
        formatMsgMintNFT(this.address, classId, i),
      )
      const nftsToSend = nfts.filter((_, index) => index >= this.reserveNft)
      const sendMessages = nftsToSend.map((i) =>
        formatMsgSend(this.address, LIKER_NFT_API_WALLET, classId, i.id),
      )
    return {
      mintMessages,
      sendMessages,
    }
  }

  async mintNFT() {
    await this.initIfNecessary()
    try {
      if (!this.signer) return
      const signingClient = await getSigningClient()
      await signingClient.setSigner(this.signer)

      logTrackerEvent(this, 'IscnMintNFT', 'MintNFT', this.classId, 1);

      const shouldMintNFT = !this.mintNFTResult
      const shouldSendNFT = this.isWritingNFT && !this.sendNFTResult

      const { mintMessages, sendMessages } = this.getNFTMessages();

      let messages: any[] = []
      if (shouldMintNFT) {
        if (this.isTransactionSizeLimited) {
          this.mintNFTResult = await signingClient.sendMessages(
            this.address,
            mintMessages,
          )
        } else {
          messages.push(...mintMessages)
        }
      }
      if (shouldSendNFT) {
        messages = messages.concat(sendMessages)
        this.sendNFTResult = await signingClient.sendMessages(
          this.address,
          messages,
        )
        // mintNFTResult not set means mint is sent together with send
        if (shouldMintNFT && !this.mintNFTResult) {
          this.mintNFTResult = this.sendNFTResult;
        }
      }
    } catch (error) {
      logTrackerEvent(
        this,
        'IscnMintNFT',
        'MintNFTError',
        (error as Error).toString(),
        1,
      )
      // eslint-disable-next-line no-console
      console.error(error)
      if ((error as Error).message?.includes('code 11')) {
        throw new Error('MINT_NFT_TX_RUNS_OUT_OF_GAS')
      }
      throw new Error(`CANNOT_MINT_NFT, Error: ${((error as Error).message).substring(0,200)}`)
    }
  }

  setError(err: any) {
    this.isLoading = false
    this.hasError = true
    // eslint-disable-next-line no-console
    console.error(err)
    if (axios.isAxiosError(err)) {
      const message = ((err as AxiosError).response?.data || (err as Error) as any).toString();
      this.errorMessage = message;
      this.toggleSnackbar(message)
    } else {
      const message = (err as Error).toString();
      this.errorMessage = message;
      this.toggleSnackbar(message)
    }
  }

  // eslint-disable-next-line class-methods-use-this
  throwCustomError(title: string, error: Error) {
    throw new Error(`${title}, Error: ${error.message.substring(0, 200)}`)
  }

  handleInputMintAmount() {
    logTrackerEvent(this, 'IscnMintNFT', 'MintAmount', this.mintAmount.toString(), 1);
  }

  handleInputReserveNft() {
    logTrackerEvent(this, 'IscnMintNFT', 'ReserveNFT', this.reserveNft.toString(), 1);
  }

  handleInputInitialBatch(inputValue: string | number) {
    const value = Number(inputValue);
    this.initialBatch = value;
    logTrackerEvent(this, 'IscnMintNFT', 'SetInitialBatch', this.initialBatch.toString(), 1);
  }

  onReport() {
    logTrackerEvent(this, 'IscnMintNFT', 'onClickReportIssue', this.mintState, 1);
  }
}
</script>
