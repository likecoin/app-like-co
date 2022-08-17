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
        <Label class="w-min" :text="labelText" tag="div" preset="p5" valign="middle"
          content-class="font-semibold whitespace-nowrap text-like-green" prepend-class="text-like-green">
          <template #prepend>
            <IconRegister />
          </template>
        </Label>
        <div :class="['flex', 'flex-col', 'items-end']">
          <Stepper :step="step" :total-step="3" />
          <Label preset="p6" :text="$t('Registration.step', { step: step, total: 3 })" class="text-medium-gray" />
        </div>
      </div>
      <!-- guide text -->
      <!-- body -->
      <div :class="[
        'flex',
        'flex-col',
        'justify-center',
        'items-center',
        'w-full',
      ]">
        <div :class="[
          'flex',
          'flex-col',
          'justify-center',
          'items-center',
          'w-full',
          'my-[64px]',
        ]">
          <FormField :label="$t('NFTPortal.label.Iscn')" class="mb-[12px]">
            <Label :text="iscnId" tag="div" preset="p6" />
          </FormField>
          <FormField v-if="classId" :label="$t('NFTPortal.label.classId')" class="mb-[12px]">
            <Label :text="classId" tag="div" preset="p6" />
          </FormField>
          <FormField v-if="state === 'done' && isWritingNFT" :label="$t('NFTPortal.label.detailsPage')" class="mb-[12px]">
            <Link :href="detailsPageURL">{{ detailsPageURL }}</Link>
          </FormField>
        </div>
        <Label
          v-if="iscnOwner && !isUserISCNOwner"
          :text="$t('NFTPortal.errorMessage.notIscnOwner', { ownerWallet: iscnOwner })"
        />
        <div class="flex flex-col self-end">
          <div v-if="isLoading" class="flex flex-col justify-center">
            <ProgressIndicator />
            <Label class="text-[8px] text-medium-gray text-center mt-[8px]" align="center">{{ loadingText }}</Label>
          </div>

          <Button
            v-else
            preset="outline"
            :is-disabled="!iscnData || !isUserISCNOwner"
            class="my-[12px]"
            @click="doAction"
          >
            {{ buttonText }}
          </Button>
        </div>
      </div>
    </Card>
    <AttentionsOpenLikerLandApp v-if="isUsingLikerLandApp" />
    <AttentionsLedger v-else />
    <AlertsSignFailed />
  </Page>
</template>

<script lang="ts">
import qs from 'querystring'
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing'
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
  getNftClassImage,
  getNftClassUriViaIscnId,
  getNftUriViaNftId,
} from '~/constant/api'
import { getSigningClient } from '~/utils/cosmos/iscn/sign'
import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type'
import { LIKER_LAND_URL, LIKER_NFT_API_WALLET } from '~/constant'
import sendLIKE from '~/utils/cosmos/sign'
import { getAccountBalance } from '~/utils/cosmos'

const PREMINT_NFT_AMOUNT = 500;

const iscnModule = namespace('iscn')
const signerModule = namespace('signer')
const walletModule = namespace('wallet')

export enum ErrorType {
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  MISSING_SIGNER = 'MISSING_SIGNER',
  USER_NOT_ISCN_OWNER = 'USER_NOT_ISCN_OWNER',
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

  @walletModule.Action toggleSnackbar!: (
    error: string,
  ) => void

  @walletModule.Getter('getType') walletType!: string | null

  classId: string = ''
  iscnOwner: string = ''
  iscnData: any = null
  apiData: any = null
  ogImageUrl = this.$route.params.ogImageUrl as string || ''
  ogImageBlob: Blob | null = null
  ogImageArweaveId: string = ''
  ogImageArweaveFeeTxHash: string = ''

  sendRes: any = null
  postInfo: any = null

  isLoading = false

  errorType: string = ''
  balance: string = ''

  get isUserISCNOwner(): boolean {
    if (!this.iscnOwner) return false
    return (this.iscnOwner === this.address)
  }

  get isWritingNFT(): boolean {
    const { raw_nft: nft = 0 } = this.$route.query
    return !(nft && nft !== '0');
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
    if (this.apiData) return 'done'
    if (this.classId) return 'mint'
    return 'create'
  }

  get buttonText(): string {
    if (this.errorType) return 'Retry'
    if (this.state === 'done') return 'View NFT'
    if (this.state === 'mint') return 'Mint NFT'
    return 'Mint NFT'
  }

  get labelText(): string {
    if (this.state === 'done') return 'Done'
    if (this.state === 'mint') return 'Mint NFT'
    return 'Mint NFT'
  }

  get step(): number {
    if (this.state === 'done') return 3
    if (this.state === 'mint') return 2
    return 2
  }

  get loadingText(): string {
    if (this.state === 'done') return ''
    if (this.state === 'mint') return this.$t('NFTPortal.loadingMessage.mint') as string
    if (this.ogImageBlob && !this.ogImageArweaveId) return this.$t('NFTPortal.loadingMessage.uploadImg') as string
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

  async doAction() {
    try {
      this.errorType = ''
      this.balance = await getAccountBalance(this.address) as string
      if (this.balance === '0'){
        throw new Error(ErrorType.INSUFFICIENT_BALANCE)
      }
      this.isLoading = true
      /* eslint-disable no-fallthrough */
      switch (this.state) {
        case 'create':
          if (!this.isUserISCNOwner) {
            throw new Error(ErrorType.USER_NOT_ISCN_OWNER)
          }

          if (this.ogImageBlob) {
            try {
              const arweaveFeeInfo = await this.estimateArweaveFee()
              if (!this.ogImageArweaveId) {
                if (!this.ogImageArweaveFeeTxHash) { await this.sendArweaveFeeTx(arweaveFeeInfo) }
                await this.submitToArweave()
              }
            } catch (error) {
              // eslint-disable-next-line no-console
              console.error(error);
              this.toggleSnackbar('Warning: Cannot upload display image to Arweave')
            }
          }
          this.classId = await this.createNftClass()
          if (!this.classId) break
  
        case 'mint':
          await this.mintNFT()
          if (!this.sendRes) break
          if (this.isWritingNFT) {
            await this.postMintInfo()
            if (!this.postInfo) break
            await this.getMintInfo()
          }
          this.isLoading = false
          break
        case 'done':
          window.location.href = this.detailsPageURL
        default:
      }
      /* eslint-enable no-fallthrough */
    } catch (error) {
      this.setError(error)
    }
  }

  async getISCNInfo() {
    try {
      const res = await this.fetchISCNById(this.iscnId)
      if (res) {
        this.iscnData = res.records[0].data
        this.iscnOwner = res.owner
        if (!this.iscnData.contentMetadata?.url) {
          this.toggleSnackbar('Warning: No URL in ISCN\'s metadata')
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      throw new Error('ISCN not found')
    }
  }

  async getMintInfo() {
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
        window.opener.postMessage(JSON.stringify({
          action: 'NFT_MINT_DATA',
          data,
        }), this.redirectOrigin)
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
    }
  }

  async getOgImage() {
    try {
      if (!this.ogImageUrl) {
        const url = this.iscnData.contentMetadata?.url
        if (!url) return
        const { data: { image } } = await this.$axios.get(`/crawler/?url=${encodeURIComponent(url)}`)
        if (!image) return
        this.ogImageUrl = image
      }
      const { data, headers } = await this.$axios.get(this.ogImageUrl)
      this.ogImageBlob = new Blob([data], { type: headers['content-type'] })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      throw new Error('CANNOT_GET_OG_IMAGE')
    }
  }

  async estimateArweaveFee() {
    try {
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
      // eslint-disable-next-line no-console
      console.error(err)
      throw new Error('CANNOT_ESTIMATE_ARWEAVE_FEE')
    }
  }

  async sendArweaveFeeTx({ to, amount, memo }: { to: string, amount: BigNumber, memo: string }): Promise<void> {
    if (!this.signer) throw new Error('SIGNER_NOT_INITED')
    if (!to) throw new Error('TARGET_ADDRESS_NOT_SET')
    try {
      const { transactionHash } = await sendLIKE(this.address, to, amount.toFixed(), this.signer, memo)
      this.ogImageArweaveFeeTxHash = transactionHash
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      throw new Error('CANNOT_SEND_ARWEAVE_FEE_TX')
    }
  }

  async submitToArweave(): Promise<void> {
    try {
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
      this.ogImageArweaveId = arweaveId
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      throw new Error('CANNOT_UPLOAD_TO_ARWEAVE')
    }
  }

  async postMintInfo() {
    try {
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
      this.postInfo = data
    } catch (error) {
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
      const res = await signingClient.createNFTClass(
        this.address,
        this.iscnId,
        {
          name: `Writing NFT - ${this.iscnData.contentMetadata?.name || ''}`,
          symbol: 'WRITING',
          uri: getNftClassUriViaIscnId(this.iscnId),
          metadata: {
            nft_meta_collection_id: 'likerland_writing_nft',
            nft_meta_collection_name: 'Writing NFT',
            nft_meta_collection_descrption: 'Writing NFT by Liker Land',
            image: this.ogImageUri,
            description: this.iscnData.contentMetadata?.description,
            external_url: this.iscnData.contentMetadata?.url,
          },
        },
      )
      const rawLogs = JSON.parse((res as DeliverTxResponse).rawLog as string)
      const event = rawLogs[0].events.find(
        (e: { type: string }) => e.type === 'likechain.likenft.v1.EventNewClass',
      )
      const attribute = event.attributes.find(
        (a: { key: string }) => a.key === 'class_id',
      )
      classId = (attribute?.value || '').replace(/^"(.*)"$/, '$1')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      if ((error as Error).message?.includes('code 11')) {
        throw new Error('CREATE_NFT_CLASS_TX_RUNS_OUT_OF_GAS')
      }
      throw new Error('CANNOT_CREATE_NFT_CLASS')
    }

    // eslint-disable-next-line consistent-return
    return classId
  }

  async mintNFT() {
    try {
      if (!this.signer) return
      const signingClient = await getSigningClient()
      await signingClient.setSigner(this.signer)

      const nfts = [...Array(PREMINT_NFT_AMOUNT).keys()].map((_) => {
        const id = `writing-${uuidv4()}`
        return {
          id,
          uri: getNftUriViaNftId(this.classId, id),
          metadata: {
            name: `Writing NFT - ${this.iscnData.contentMetadata?.name || ''}`,
            image: this.ogImageUri,
          },
        }
      })
      const mintMessages = nfts.map((i) =>
        formatMsgMintNFT(this.address, this.classId, i),
      )
      const sendMessages = nfts.map((i) =>
        formatMsgSend(this.address, LIKER_NFT_API_WALLET, this.classId, i.id),
      )
      let messages = mintMessages;
      if (this.isWritingNFT) messages = messages.concat(sendMessages);

      this.sendRes = await signingClient.sendMessages(this.address, messages)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      if ((error as Error).message?.includes('code 11')) {
        throw new Error('MINT_NFT_TX_RUNS_OUT_OF_GAS')
      }
      throw new Error('CANNOT_MINT_NFT')
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
