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
    <Snackbar
      v-model="isOpenWarningSnackbar"
      preset="warn"
    >
      {{ errorMessage }}
      <Link
        v-if="errorType === 'INSUFFICIENT_BALANCE'"
        :class="['text-white', 'ml-[2px]']"
        href="https://faucet.like.co/"
      >
        {{ $t('IscnRegisterForm.error.faucet') }}
      </Link>
    </Snackbar>
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
import { LIKER_LAND_URL, LIKER_NFT_API_WALLET, ARWEAVE_UPLOAD_TRY_LIMIT } from '~/constant'
import sendLIKE from '~/utils/cosmos/sign'
import { getAccountBalance } from '~/utils/cosmos'
import { timeout } from '~/utils/misc'

const PREMINT_NFT_AMOUNT = 500;

const iscnModule = namespace('iscn')
const signerModule = namespace('signer')

export enum ErrorType {
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  MISSING_SIGNER = 'MISSING_SIGNER',
  USER_NOT_ISCN_OWNER = 'USER_NOT_ISCN_OWNER',
  CREATE_NFT_CLASS_FAILD = 'CREATE_NFT_CLASS_FAILD',
  SEND_NFT_FAILD = 'SEND_NFT_FAILD',
  POST_NFT_INFO = 'POST_NFT_INFO'
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

  classId: string = ''
  iscnOwner: string = ''
  iscnData: any = null
  apiData: any = null
  ogImageUrl = this.$route.params.ogImageUrl as string || ''
  ogImageBlob: Blob | null = null
  ogImageArweaveId: string = ''

  sendRes: any = null
  postInfo: any = null

  isLoading = false
  isOpenWarningSnackbar: boolean = false

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
    if (this.state === 'done') return this.isWritingNFT ? 'Go to Doc' : 'View NFT'
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

  get errorMessage() {
    switch (this.errorType) {
      case ErrorType.INSUFFICIENT_BALANCE:
        return this.$t('IscnRegisterForm.error.insufficient')

      case ErrorType.MISSING_SIGNER:
        return this.$t('IscnRegisterForm.error.missingSigner')

      case ErrorType.USER_NOT_ISCN_OWNER:
        return ErrorType.USER_NOT_ISCN_OWNER

      case ErrorType.CREATE_NFT_CLASS_FAILD:
        return this.$t('NFTPortal.mint.error', {
          error: 'creating NFT classId',
        }) as string

      case ErrorType.SEND_NFT_FAILD:
        return this.$t('NFTPortal.mint.error', {
          error: 'sending NFT',
        }) as string

      case ErrorType.POST_NFT_INFO:
        return this.$t('NFTPortal.mint.error', {
          error: 'posting NFT info',
        }) as string
      default:
        return ''
    }
  }

  async mounted() {
    await Promise.all([
      this.getISCNInfo().catch(err => {
        // eslint-disable-next-line no-console
        console.error(err);
        this.setError('ISCN_NOT_FOUND')
      }),
      this.getMintInfo().catch(err => console.error(err)),
    ]);
    this.getOgImage().catch(err => console.error(err));
  }

  async doAction() {
    this.errorType = ''
    this.balance = await getAccountBalance(this.address) as string
    if(this.balance === '0'){
      this.setError(ErrorType.INSUFFICIENT_BALANCE)
      return
    }
    this.isLoading = true
    this.isOpenWarningSnackbar = false
    /* eslint-disable no-fallthrough */
    switch (this.state) {
      case 'create':
        if (!this.isUserISCNOwner) {
          this.setError(ErrorType.USER_NOT_ISCN_OWNER)
          break
        }

        if (this.ogImageBlob) {
          const arweaveFeeInfo = await this.estimateArweaveFee()
          if (!this.ogImageArweaveId) {
            const txHash = await this.sendArweaveFeeTx(arweaveFeeInfo)
            let tryTime = 0
            do {
              tryTime += 1
              /* eslint-disable no-await-in-loop */
              try {
                await this.submitToArweave(txHash)
              } catch (err) {
                if (tryTime < ARWEAVE_UPLOAD_TRY_LIMIT) await timeout(2000)
              }
              /* eslint-enable no-await-in-loop */
            } while (!this.ogImageArweaveId && tryTime < ARWEAVE_UPLOAD_TRY_LIMIT )
          }
        }

        this.classId = await this.createNftClass()
        if (!this.classId) {
          this.setError(ErrorType.CREATE_NFT_CLASS_FAILD)
          break
        }

      case 'mint':
        this.sendRes = await this.mintNFT()
        if (!this.sendRes) {
          this.setError(ErrorType.SEND_NFT_FAILD)
          break
        }

        if (this.isWritingNFT) {
          this.postInfo = await this.postMintInfo()
          if (!this.postInfo) {
            this.setError(ErrorType.POST_NFT_INFO)
            break
          }
          await this.getMintInfo()
        }

        this.isLoading = false
        break
      case 'done':
        if (this.isWritingNFT) {
          window.location.href = 'https://github.com/likecoin/likecoin-button-sdk'
        } else {
          window.location.href = this.detailsPageURL
        }
      default:
    }
    /* eslint-enable no-fallthrough */
  }

  async getISCNInfo() {
    const res = await this.fetchISCNById(this.iscnId)
    if (res) {
      this.iscnData = res.records[0].data
      this.iscnOwner = res.owner
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
    } catch (err) {
      console.error(err)
    }
  }

  async getOgImage() {
    try {
      if (!this.ogImageUrl) {
        const url = this.iscnData.contentMetadata?.url
        if (!url) { return }
        const { data: { image } } = await this.$axios.get(`/crawler/?url=${encodeURIComponent(url)}`)
        if (!image) { return }
        this.ogImageUrl = image
      }
      const { data, headers } = await this.$axios.get(this.ogImageUrl)
      this.ogImageBlob = new Blob([data], { type: headers['content-type'] })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
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
      console.error('CANNOT_ESTIMATE_ARWEAVE_FEE')
      throw err
    }
  }

  async sendArweaveFeeTx({ to, amount, memo }: { to: string, amount: BigNumber, memo: string }): Promise<string> {
    if (!this.signer) throw new Error('SIGNER_NOT_INITED')
    if (!to) throw new Error('TARGET_ADDRESS_NOT_SET')
    try {
      const { transactionHash } = await sendLIKE(this.address, to, amount.toFixed(), this.signer, memo)
      return transactionHash
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('CANNOT_SEND_ARWEAVE_FEE_TX')
      throw err
    }
  }

  async submitToArweave(txHash: string): Promise<void> {
    try {
      const { arweaveId } = await this.$axios.$post(
        `${API_POST_ARWEAVE_UPLOAD}?txHash=${txHash}`,
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
      console.error('CANNOT_UPLOAD_TO_ARWEAVE')
      throw err
    }
  }

  async postMintInfo() {
    let fdata
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
      fdata = data
    } catch (error) {
      console.error(error)
    }
    return fdata
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
      console.error(error)
    }

    // eslint-disable-next-line consistent-return
    return classId
  }

  async mintNFT() {
    if (!this.signer) return
    let sendRes
    try {
      const signingClient = await getSigningClient()
      await signingClient.setSigner(this.signer)
      const { classId } = this

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
        formatMsgMintNFT(this.address, classId, i),
      )
      const sendMessages = nfts.map((i) =>
        formatMsgSend(this.address, LIKER_NFT_API_WALLET, classId, i.id),
      )
      let messages = mintMessages;
      if (this.isWritingNFT) messages = messages.concat(sendMessages);

      sendRes = await signingClient.sendMessages(this.address, messages)
      // eslint-disable-next-line consistent-return
    } catch (error) {
      console.error(error)
    }
    // eslint-disable-next-line consistent-return
    return sendRes
  }

  setError(errorType: string) {
    this.isOpenWarningSnackbar = true
    this.errorType = errorType
    this.isLoading = false
  }
}
</script>
