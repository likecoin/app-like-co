<template>
  <Page
    :class="[
      'flex',
      'flex-col',
      'relative',
      'items-center',
      'justify-center',
      'px-[20px]',
      'pt-[38px]',
      'lg:p-[16px]',
    ]"
  >
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
        @generate-image="onGenerateImage"
        @reset-image="onResetImage"
      />

      <NFTMintWriterMessage
        v-if="currentPage === 'MessagePreview'"
        :address="address"
        @message-change="(value) => (message = value)"
      />

      <!-- Reserve NFTs Input -->
      <div
        v-if="currentPage === 'MintProcess' && mintState === 'reserving'"
        class="flex justify-start gap-[12px] text-dark-gray text-[14px] items-center bg-[#E6F4F2] rounded-[4px] px-[6px] py-[4px]"
      >
        <IconGift />
        <span>{{ $t('NFTPortal.label.reserve.input') }}</span>
        <input
          ref="nameInput"
          :placeholder="reservePlaceholder"
          type="number"
          :max="premintAmount"
          min="0"
          class="w-[65px] bg-transparent border-0 border-b-2 border-black outline-none text-center placeholder-medium-gray focus:outline-none"
          @change="handleInputReserveNft"
        />
      </div>

      <NFTMintProcess
        v-if="currentPage === 'MintProcess'"
        :iscn-id="iscnId"
        :ar-id="ogImageArweaveId"
        :class-id="classId"
        :nft-link="apiData && detailsPageURL"
        :nft-model-url="apiData && modelURL"
        :has-error="hasError"
        :error-message="errorMessage"
        :tx-status="txStatus"
        :state="mintState"
      />

      <!-- Reserve NFTs Result -->
      <div
        v-if="currentPage === 'MintProcess' && mintState !== 'reserving'"
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

    <AttentionsOpenLikerLandApp v-if="isUsingLikerLandApp && isStateTransaction" />

    <AttentionsLedger v-if="!isUsingLikerLandApp" />
    <AlertsSignFailed />
  </Page>
</template>

<script lang="ts">
import qs from 'querystring'
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing'
import { parseAndCalculateStakeholderRewards } from '@likecoin/iscn-js/dist/iscn/parsing';
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { v4 as uuidv4 } from 'uuid'
import { DeliverTxResponse } from '@cosmjs/stargate'
import {
  formatMsgMintNFT,
  formatMsgSend,
} from '@likecoin/iscn-js/dist/messages/likenft'
import BigNumber from 'bignumber.js'
import axios, { AxiosError } from 'axios'

import {
  LIKER_NFT_TARGET_ADDRESS,
  API_LIKER_NFT_MINT,
  API_LIKER_NFT_MINT_IMAGE,
  API_POST_ARWEAVE_ESTIMATE,
  API_POST_ARWEAVE_UPLOAD,
  getWhitelistApi,
  getNftClassImage,
  getNftClassUriViaIscnId,
  getNftUriViaNftId,
  getChainNFTIdList,
  getNftModelApi,
} from '~/constant/api'
import { getSigningClient } from '~/utils/cosmos/iscn/sign'
import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type'
import { IS_TESTNET, LIKER_LAND_URL, LIKER_NFT_API_WALLET, LIKER_NFT_FEE_WALLET, WHITELISTED_PLATFORM } from '~/constant'
import sendLIKE from '~/utils/cosmos/sign'
import { getAccountBalance } from '~/utils/cosmos'
import { logTrackerEvent } from '~/utils/logger'

const iscnModule = namespace('iscn')
const walletModule = namespace('wallet')

export enum ErrorType {
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  MISSING_SIGNER = 'MISSING_SIGNER',
  USER_NOT_ISCN_OWNER = 'USER_NOT_ISCN_OWNER',
  USER_NOT_WHITELISTED = 'USER_NOT_WHITELISTED',
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
  RESERVING = 'reserving',
  UPLOADING = 'uploading',
  CREATING = 'creating',
  MINTING = 'minting',
  DONE = ''
}

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
          asyc: 'true',
        }],
    };
  },
  layout: 'wallet',
})
export default class NFTTestMintPage extends Vue {
  @iscnModule.Getter getISCNById!: (arg0: string) => ISCNRecordWithID
  @iscnModule.Action fetchISCNById!: (arg0: string) => Promise<{
    records: ISCNRecordWithID[]
    owner: string
    latestVersion: Long.Long
  } | null>

  @walletModule.Action toggleSnackbar!: (error: string) => void
  @walletModule.Action('initIfNecessary') initIfNecessary!: () => Promise<any>

  @walletModule.Getter('getType') walletType!: string | null
  @walletModule.Getter('getWalletAddress') address!: string
  @walletModule.Getter('getSigner') signer!: OfflineSigner | null

  platform = this.$route.query.platform as string || ''

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
  ogImageArweaveId: string = ''
  ogImageArweaveFeeTxHash: string = ''
  chainNFTIdList: any = null

  mintNFTResult: any = null
  sendNFTResult: any = null
  postInfo: any = null

  isLoading = false
  isLoadingPreviewOG = true
  mintState = MintState.RESERVING
  isPreviewChecked = false
  isMessageChecked = false

  hasError = false
  errorMessage: string = ''
  balance: string = ''
  txStatus: string = ''

  reserveNft: number = 0
  shouldShowNoUrlWarning: boolean = false

  get isUserISCNOwner(): boolean {
    if (!this.iscnOwner) return false
    return (this.iscnOwner === this.address)
  }

  get isWritingNFT(): boolean {
    const { raw_nft: nft = 0 } = this.$route.query
    return !(nft && nft !== '0');
  }

  get NFTPrefix(): string {
    return (this.$route.query.nft_prefix as string) || `${this.isWritingNFT ? 'Writing NFT' : ''}`;
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

  get state(): string {
    if (this.apiData) return State.DONE
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
      case CurrentPage.MESSAGE_PREVIEW:
        return 'Preview'

      case CurrentPage.MINT_PROCESS:
        return 'Sign'

      default:
        return 'Writing NFT Preview'
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
    if (!this.ogImageArweaveId)
      return this.$t('NFTPortal.loadingMessage.uploadImg') as string

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

  get ogImageFormData(): FormData | null {
    if (!this.ogImageBlob) return null
    const formData = new FormData()
    formData.append('file', this.ogImageBlob)
    return formData
  }

  get detailsPageURL(): string {
    return `${LIKER_LAND_URL}/nft/class/${encodeURIComponent(this.classId)}`
  }

  get modelURL(): string {
    return getNftModelApi(this.classId);
  }

  get isUsingLikerLandApp() {
    return this.walletType === 'liker-id'
  }

  get createNftClassPayload() {
    let metadata: {[key: string]: any} = {
      image: this.ogImageUri,
      external_url: this.iscnData.contentMetadata?.url,
      message: this.message || '',
    }
    if (this.isWritingNFT) {
      metadata = Object.assign(metadata, {
        nft_meta_collection_id: 'likerland_writing_nft',
        nft_meta_collection_name: 'Writing NFT',
        nft_meta_collection_descrption: 'Writing NFT by Liker Land',
      })
    }
    let payload = {
      name: this.NftName,
      description: this.NftDescription,
      metadata,
    };
    if (this.isCustomOgimage) payload.metadata.is_custom_image = 'true';
    if (this.isWritingNFT) {
      payload = Object.assign(payload, {
        symbol: 'WRITING',
        uri: getNftClassUriViaIscnId(this.iscnId),
      });
    }
    return payload;
  }

  get premintAmount() {
    if (this.isUsingLikerLandApp) {
      return 35;
    }
    return this.isWritingNFT ? 500 : 100;
  }

  get imgSrc() {
    if (this.ogImageBlob) {
      return URL.createObjectURL(this.ogImageBlob)
    }
    return undefined
  }

  get reservePlaceholder() {
    return `0 - ${this.premintAmount}`
  }

  async mounted() {
    try {
      await Promise.all([
        this.getISCNInfo(),
        this.getMintInfo(),
      ])
      await this.getOgImage()
      if (!this.isUserISCNOwner) {
        throw new Error(ErrorType.USER_NOT_ISCN_OWNER)
      }
    } catch (error) {
      this.setError(error)
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
        break
      default:
        this.doAction()
    }
  }

  async doAction() {
    try {
      this.hasError = false
      this.errorMessage = ''
      this.balance = await getAccountBalance(this.address) as string
      if (this.balance === '0') {
        logTrackerEvent(this, 'IscnMintNFT', 'doActionNFTError', ErrorType.INSUFFICIENT_BALANCE, 1);
        throw new Error(ErrorType.INSUFFICIENT_BALANCE)
      }
      /* eslint-disable no-fallthrough */
      switch (this.state) {
        case 'create': {
          this.isLoading = true
          const isAllowed = IS_TESTNET || await this.checkIsWhitelisted();
          if (!isAllowed) {
            logTrackerEvent(this, 'IscnMintNFT', 'CreateNFTError', ErrorType.USER_NOT_WHITELISTED, 1);
            this.toggleSnackbar(ErrorType.USER_NOT_WHITELISTED)
            break
          }

          if (!this.isUserISCNOwner) {
            logTrackerEvent(this, 'IscnMintNFT', 'CreateNFTError', ErrorType.USER_NOT_ISCN_OWNER, 1);
            throw new Error(ErrorType.USER_NOT_ISCN_OWNER)
          }

          if (this.ogImageBlob) {
            this.mintState = MintState.UPLOADING
            const arweaveFeeInfo = await this.checkArweaveIdExistsAndEstimateFee()
            if (!this.ogImageArweaveId) {
              if (!this.ogImageArweaveFeeTxHash) { await this.sendArweaveFeeTx(arweaveFeeInfo) }
              await this.submitToArweave()
            }
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
      this.mintState = MintState.DONE
      this.setError(error)
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

  async checkIsWhitelisted() {
    if (this.platform && WHITELISTED_PLATFORM.includes(this.platform)) return true;
    const { data } = await this.$axios.get(getWhitelistApi(this.address))
    return data.isWhitelisted;
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
      throw new Error('ISCN not found')
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
    this.isCustomOgimage = true;
    logTrackerEvent(this, 'IscnMintNFT', 'MintEditNftImage', this.iscnId, 1);
  }

  async getOgImage() {
    try {
      this.isLoadingPreviewOG = true
      const url = this.iscnData.contentMetadata?.url
      if (!url) {
        logTrackerEvent(this, 'IscnMintNFT', 'GetOgImageNotExists', this.iscnId, 1);
        throw new Error(this.$t('NFTPortal.errorMessage.urlNotExists') as string);
      }
      logTrackerEvent(this, 'IscnMintNFT', 'GetOgImageExists', url, 1);
      const { data } = await this.$axios.get(`/crawler/ogimage?url=${encodeURIComponent(url)}`, { responseType: 'blob' })
      this.ogImageBlob = data
      this.defaultOgImageBlob = data
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
      const { address, arweaveId, LIKE, memo } = await this.$axios.$post(
        API_POST_ARWEAVE_ESTIMATE,
        this.ogImageFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )
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
      throw new Error('CANNOT_ESTIMATE_ARWEAVE_FEE')
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
      this.txStatus = TxStatus.PROCESSING
      const { transactionHash } = await sendLIKE(this.address, to, amount.toFixed(), this.signer, memo)
      this.ogImageArweaveFeeTxHash = transactionHash
      logTrackerEvent(this, 'IscnMintNFT', 'SendArweaveFeeTxSuccess', transactionHash, 1);
    } catch (err) {
      logTrackerEvent(this, 'IscnMintNFT', 'SendArweaveFeeTxError', (err as Error).toString(), 1);
      // eslint-disable-next-line no-console
      console.error(err)
      throw new Error('CANNOT_SEND_ARWEAVE_FEE_TX')
    }
  }

  async submitToArweave(): Promise<void> {
    try {
      logTrackerEvent(this, 'IscnMintNFT', 'SubmitToArweave', this.ogImageArweaveFeeTxHash, 1);
      if (!this.ogImageArweaveFeeTxHash) throw new Error('ARWEAVE_FEE_TX_HASH_NOT_SET')
      const { arweaveId } = await this.$axios.$post(
        `${API_POST_ARWEAVE_UPLOAD}?txHash=${this.ogImageArweaveFeeTxHash}`,
        this.ogImageFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )
      logTrackerEvent(this, 'IscnMintNFT', 'SubmitToArweaveSuccess', arweaveId, 1);
      this.ogImageArweaveId = arweaveId
    } catch (err) {
      logTrackerEvent(this, 'IscnMintNFT', 'SubmitToArweaveError', (err as Error).toString(), 1);
      // eslint-disable-next-line no-console
      console.error(err)
      throw new Error('CANNOT_UPLOAD_TO_ARWEAVE')
    }
  }

  onResetImage() {
    this.ogImageBlob = this.defaultOgImageBlob;
    this.isCustomOgimage = false;
  }

  async onGenerateImage() {
    this.isLoadingPreviewOG = true
    logTrackerEvent(this, 'IscnMintNFT', 'GenerationRandomImage', this.iscnId, 1);
    const res = await this.$axios.post(
        API_LIKER_NFT_MINT_IMAGE,
        {},
        {
          params: {
            iscn_id: this.iscnId,
            platform: this.platform,
            from: this.address,
          },
          paramsSerializer: (params) => qs.stringify(params),
          responseType: 'arraybuffer',
        },
      );
    this.onEditOgImage(new Blob([res.data], {type: res.headers['content-type']}));
    this.isLoadingPreviewOG = false
  }

  async postMintInfo() {
    try {
      logTrackerEvent(this, 'IscnMintNFT', 'PostMintInfo', this.classId, 1);
      const { data } = await this.$axios.post(
        API_LIKER_NFT_MINT,
        { contentUrl: this.iscnData.contentMetadata?.url },
        {
          params: {
            iscn_id: this.iscnId,
            class_id: this.classId,
            platform: this.platform,
          },
          paramsSerializer: (params) => qs.stringify(params),
        },
      )
      logTrackerEvent(this, 'IscnMintNFT', 'PostMintInfoSuccess', this.classId, 1);
      this.postInfo = data
    } catch (error: any) {
      // If the API returns a status of 409, it indicates that the request may have already successful
      // and a duplicate request was made.
      if (error.response!.status === 409) {
        // Instead of throwing an error, perform the next step in the process
        await this.getMintInfo();
        return;
      }
      // eslint-disable-next-line no-console
      console.error(error)
      logTrackerEvent(this, 'IscnMintNFT', 'PostMintInfoError', (error as Error).toString(), 1);
      throw new Error('CANNOT_POST_MINT_INFO')
    }
  }

  async createNftClass() {
    await this.initIfNecessary()
    if (!this.signer) return
    let classId
    try {
      const signingClient = await getSigningClient()
      await signingClient.setSigner(this.signer)
      logTrackerEvent(this, 'IscnMintNFT', 'CreateNftClass', this.iscnId, 1);
      this.txStatus = TxStatus.PROCESSING
      const res = await signingClient.createNFTClass(
        this.address,
        this.iscnId,
        this.createNftClassPayload,
      )
      const rawLogs = JSON.parse((res as DeliverTxResponse).rawLog as string)
      const event = rawLogs[0].events.find(
        (e: { type: string }) => e.type === 'likechain.likenft.v1.EventNewClass',
      )
      const attribute = event.attributes.find(
        (a: { key: string }) => a.key === 'class_id',
      )
      classId = (attribute?.value || '').replace(/^"(.*)"$/, '$1')
      await this.createRoyaltyConfig(classId);
    } catch (error) {
      logTrackerEvent(this, 'IscnMintNFT', 'CreateNftClassError', (error as Error).toString(), 1);
      // eslint-disable-next-line no-console
      console.error(error)
      if ((error as Error).message?.includes('code 11')) {
        throw new Error('CREATE_NFT_CLASS_TX_RUNS_OUT_OF_GAS')
      }
      throw new Error(`CANNOT_CREATE_NFT_CLASS, Error: ${((error as Error).message).substring(0,200)}`)
    }

    logTrackerEvent(this, 'IscnMintNFT', 'CreateNftClassSuccess', classId, 1);
    // eslint-disable-next-line consistent-return
    return classId
  }

  async createRoyaltyConfig(classId: string) {
    try {
      if (!this.signer) return
      const rateBasisPoints = 1000; // 10% as in current chain config
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
          weight: parseInt(amount, 10),
        };
      });
      stakeholders.push({
          account: LIKER_NFT_FEE_WALLET,
          weight: feeAmount,
      })

      const signingClient = await getSigningClient()
      await signingClient.setSigner(this.signer)
      logTrackerEvent(this, 'IscnMintNFT', 'CreateNftClass', this.iscnId, 1);
      this.txStatus = TxStatus.PROCESSING
      await signingClient.createRoyaltyConfig(
        this.address,
        classId,
        {
          rateBasisPoints,
          stakeholders,
        },
      )
    } catch (err) {
      // Don't throw on royalty create, not critical for now
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }

  async mintNFT() {
    await this.initIfNecessary()
    try {
      if (!this.signer) return
      const signingClient = await getSigningClient()
      await signingClient.setSigner(this.signer)

      if (!this.nftsIds.length) this.nftsIds = [...Array(this.premintAmount).keys()]
        .map((_) => `${this.isWritingNFT ? 'writing-' : ''}${uuidv4()}`);
      const nfts = this.nftsIds.map(id => this.getMintNftPayload(id))
      const mintMessages = nfts.map((i) =>
        formatMsgMintNFT(this.address, this.classId, i),
      )
      const sendMessages = nfts.map((i) =>
        formatMsgSend(this.address, LIKER_NFT_API_WALLET, this.classId, i.id),
      )
      logTrackerEvent(this, 'IscnMintNFT', 'MintNFT', this.classId, 1);
      if (this.isUsingLikerLandApp) {
        if (!this.mintNFTResult) {
          this.mintNFTResult = await signingClient.sendMessages(this.address, mintMessages)
        }
        if (this.isWritingNFT && !this.sendNFTResult) {
          this.sendNFTResult = await signingClient.sendMessages(this.address, sendMessages)
        }
      } else {
        let messages = mintMessages;

        if (this.isWritingNFT) messages = messages.concat(sendMessages);

        const res = await signingClient.sendMessages(this.address, messages)
        this.mintNFTResult = res
        // mint and send are in a same tx result
        if (this.isWritingNFT) this.sendNFTResult = res;
      }
    } catch (error) {
      logTrackerEvent(this, 'IscnMintNFT', 'MintNFTError', (error as Error).toString(), 1);
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
      const message = (err as AxiosError).response?.data || (err as Error).toString();
      this.errorMessage = message;
      this.toggleSnackbar(message)
    } else {
      const message = (err as Error).toString();
      this.errorMessage = message;
      this.toggleSnackbar(message)
    }
  }

  handleInputReserveNft(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = Number(inputElement.value);
    this.reserveNft = Math.max(0, Math.min(value, this.premintAmount));
    logTrackerEvent(this, 'IscnMintNFT', 'ReserveNFT', this.reserveNft.toString(), 1);
  }

  onReport() {
    logTrackerEvent(this, 'IscnMintNFT', 'onClickReportIssue', this.mintState, 1);
  }
}
</script>
