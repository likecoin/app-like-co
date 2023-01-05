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
      />

      <NFTMintWriterMessage
        v-if="currentPage === 'MessagePreview'"
        :address="address"
        @message-change="(value) => (message = value)"
      />

      <NFTMintProcess
        v-if="currentPage === 'MintProcess'"
        :iscn-id="iscnId"
        :ar-id="ogImageArweaveId"
        :class-id="classId"
        :nft-link="apiData && detailsPageURL"
        :has-error="hasError"
        :error-message="errorMessage"
        :tx-status="txStatus"
        :state="mintState"
      />

      <!-- footer -->

      <template #footer>
        <div v-if="isLoading" class="flex flex-col items-end w-full">
          <ProgressIndicator class="w-min" />
          <Label
            class="text-[8px] text-medium-gray text-center mt-[8px] w-min whitespace-nowrap"
            >{{ loadingText }}</Label
          >
        </div>
        <div v-else class="ml-auto w-min">
          <Button v-if="hasError" preset="outline" text="Retry" @click="handleClickButton" />
          <Button
            v-else
            preset="secondary"
            :text="buttonText"
            @click="handleClickButton"
          >
            <template v-if="state !== 'done'" #append>
              <IconArrowRight />
            </template>
          </Button>
        </div>
      </template>
    </ContentCard>

    <AttentionsOpenLikerLandApp v-if="isUsingLikerLandApp" />
    <AttentionsLedger v-else />
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
  API_LIKER_NFT_MINT,
  API_POST_ARWEAVE_ESTIMATE,
  API_POST_ARWEAVE_UPLOAD,
  getWhitelistApi,
  getNftClassImage,
  getNftClassUriViaIscnId,
  getNftUriViaNftId,
} from '~/constant/api'
import { getSigningClient } from '~/utils/cosmos/iscn/sign'
import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type'
import { IS_TESTNET, LIKER_LAND_URL, LIKER_NFT_API_WALLET, LIKER_NFT_FEE_WALLET } from '~/constant'
import sendLIKE from '~/utils/cosmos/sign'
import { getAccountBalance } from '~/utils/cosmos'
import { logTrackerEvent } from '~/utils/logger'

const iscnModule = namespace('iscn')
const signerModule = namespace('signer')
const walletModule = namespace('wallet')

export enum ErrorType {
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  MISSING_SIGNER = 'MISSING_SIGNER',
  USER_NOT_ISCN_OWNER = 'USER_NOT_ISCN_OWNER',
  USER_NOT_WHITELISTED = 'USER_NOT_WHITELISTED',
  USE_WALLET_CONNECT = 'WALLET_CONNECT_NOT_ALLOW',
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

@Component({
  fetch({ params, redirect }) {
    if (!params.iscnId) {
      redirect({ name: 'index' })
    }
  },
  layout: 'wallet',
})
export default class NFTTestMintPage extends Vue {
  @signerModule.Getter('getAddress') address!: string
  @signerModule.Getter('getSigner') signer!: OfflineSigner | null
  @iscnModule.Getter getISCNById!: (arg0: string) => ISCNRecordWithID
  @iscnModule.Action fetchISCNById!: (arg0: string) => Promise<{
    records: ISCNRecordWithID[]
    owner: string
    latestVersion: Long.Long
  } | null>

  @walletModule.Action toggleSnackbar!: (error: string) => void

  @walletModule.Getter('getType') walletType!: string | null

  classId: string = ''
  iscnOwner: string = ''
  iscnData: any = null
  apiData: any = null
  message: string = ''
  ogImageBlob: Blob | null = null
  ogImageArweaveId: string = ''
  ogImageArweaveFeeTxHash: string = ''

  mintNFTResult: any = null
  postInfo: any = null

  isLoading = false
  isLoadingPreviewOG = true
  mintState = MintState.UPLOADING
  isPreviewChecked = false
  isMessageChecked = false

  hasError = false
  errorMessage: string = ''
  balance: string = ''
  txStatus: string = ''

  get isUserISCNOwner(): boolean {
    if (!this.iscnOwner) return false
    return (this.iscnOwner === this.address)
  }

  get isWritingNFT(): boolean {
    const { raw_nft: nft = 0 } = this.$route.query
    return !(nft && nft !== '0');
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

  get isUsingLikerLandApp() {
    return this.walletType === 'likerland_app'
  }

  get NftName() {
    const prefix = this.NFTPrefix || `${this.isWritingNFT ? 'Writing NFT' : ''}`;
    return `${prefix ? `${prefix} - ` : ''}${this.iscnData?.contentMetadata?.name || 'NFT'}`;
  }

  get NftDescription() {
    return `${this.iscnData?.contentMetadata?.description || ''}`;
  }

  get createNftClassPayload() {
    let metadata = {
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
      description: this.iscnData.contentMetadata?.description,
      metadata,
    };
    if (this.isWritingNFT) {
      payload = Object.assign(payload, {
        symbol: 'WRITING',
        uri: getNftClassUriViaIscnId(this.iscnId),
      });
    }
    return payload;
  }

  get premintAmount() {
    return this.isWritingNFT ? 500 : 100;
  }

  get imgSrc() {
    if (this.ogImageBlob) {
      return URL.createObjectURL(this.ogImageBlob)
    }
    return undefined
  }

  async mounted() {
    try {
      await Promise.all([
        this.getISCNInfo(),
        this.getMintInfo(),
      ])
      await this.getOgImage()
    } catch (error) {
      this.setError(error)
    }
  }

  handleClickButton() {
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
      this.balance = await getAccountBalance(this.address) as string
      if (this.balance === '0') {
        logTrackerEvent(this, 'IscnMintNFT', 'doActionNFTError', ErrorType.INSUFFICIENT_BALANCE, 1);
        throw new Error(ErrorType.INSUFFICIENT_BALANCE)
      }
      if (this.isUsingLikerLandApp) {
        this.errorMessage = this.$t('IscnRegisterForm.error.walletConnect') as string
        throw new Error(ErrorType.USE_WALLET_CONNECT)
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
          this.$router.replace({ query: { class_id: this.classId } })
        }
        case 'mint': {
          this.isLoading = true
          this.mintState = MintState.MINTING
          await this.mintNFT()
          if (!this.mintNFTResult) break
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
      this.hasError = true
      this.mintState = MintState.DONE
      this.setError(error)
    }
  }

  async checkIsWhitelisted() {
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
        if (!this.iscnData.contentMetadata?.url) {
          logTrackerEvent(this, 'IscnMintNFT', 'GetISCNInfoWarning', 'No URL in ISCN\'s metadata', 1);
          this.toggleSnackbar('Warning: No URL in ISCN\'s metadata')
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
    } catch (err) {
      logTrackerEvent(this, 'IscnMintNFT', 'GetMintInfoError', (err as Error).toString(), 1);
      // eslint-disable-next-line no-console
      console.error(err)
    }
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

  async postMintInfo() {
    try {
      logTrackerEvent(this, 'IscnMintNFT', 'PostMintInfo', this.classId, 1);
      const { data } = await this.$axios.post(
        API_LIKER_NFT_MINT,
        {},
        {
          params: {
            iscn_id: this.iscnId,
            class_id: this.classId,
          },
          paramsSerializer: (params) => qs.stringify(params),
        },
      )
      logTrackerEvent(this, 'IscnMintNFT', 'PostMintInfoSuccess', this.classId, 1);
      this.postInfo = data
    } catch (error) {
      logTrackerEvent(this, 'IscnMintNFT', 'PostMintInfoError', (error as Error).toString(), 1);
      // eslint-disable-next-line no-console
      console.error(error)
      throw new Error('CANNOT_POST_MINT_INFO')
    }
  }

  async createNftClass() {
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
      await this.createRoyltyConfig(classId);
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

  async createRoyltyConfig(classId: string) {
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
    try {
      if (!this.signer) return
      const signingClient = await getSigningClient()
      await signingClient.setSigner(this.signer)

      const nfts = [...Array(this.premintAmount).keys()].map((_) => {
        const id = `${this.isWritingNFT ? 'writing-' : ''}${uuidv4()}`
        return this.getMintNftPayload(id);
      })
      const mintMessages = nfts.map((i) =>
        formatMsgMintNFT(this.address, this.classId, i),
      )
      const sendMessages = nfts.map((i) =>
        formatMsgSend(this.address, LIKER_NFT_API_WALLET, this.classId, i.id),
      )
      let messages = mintMessages;
      if (this.isWritingNFT) messages = messages.concat(sendMessages);

      logTrackerEvent(this, 'IscnMintNFT', 'MintNFT', this.classId, 1);
      this.mintNFTResult = await signingClient.sendMessages(this.address, messages)
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
}
</script>
