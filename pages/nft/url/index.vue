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
          <Stepper :step="1" :total-step="3" />
          <Label preset="p6" :text="$t('Registration.step', { step: 1, total: 3 })" class="text-medium-gray" />
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
          <TextField v-model="url" class="flex flex-col" :placeholder="$t('NFTPortal.placeholder.register')"
            :error-message="errorMessage" />
          {{ iscnId }}
        </div>
        <!-- <ProgressIndicator v-if="isLoading" class="my-[4px]" preset="thin" /> -->
        <div class="flex flex-row self-end">
          <ProgressIndicator v-if="isLoading" />
          <Button v-else :text="$t('NFTPortal.button.register')" preset="outline" @click="onSubmit">
            <template #prepend>
              <IconAddToISCN class="w-[20px]" />
            </template>
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


const signerModule = namespace('signer')
const walletModule = namespace('wallet')

export enum ErrorType {
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  MISSING_SIGNER = 'MISSING_SIGNER'
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


  url = this.$route.query.url as string || ''
  ownerWallet = ''
  errorMessage = ''
  crawledData: any
  ipfsHash = ''
  arweaveId = ''
  arweaveFeeTxHash = ''
  iscnId = this.$route.query.iscn_id as string || ''
  likerId = this.$route.query.liker_id as string || ''
  isLoading = false
  avatar = null
  balance: string = ''

  get isUrlIscnId(): boolean {
    return this.url.startsWith('iscn://likecoin-chain')
  }

  get formData(): FormData | null {
    if (!this.crawledData?.body) { return null }
    const body = new Blob([this.crawledData.body], { type: "text/html" })
    const formData = new FormData()
    formData.append('file', body, 'index.html')
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
      likerIdsAddress: [],
      descriptions: [description],
      numbersProtocolAssetId: '',
    }
  }

  get iscnParams() {
    const params: any = { iscnId: this.iscnId }
    if (this.crawledData?.image) {
      params.ogImageUrl = this.crawledData.image
    }
    return params
  }

  get isUsingLikerLandApp() {
    return this.walletType === 'likerland_app'
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
  }

  async onSubmit() {
    if (this.ownerWallet && this.address !== this.ownerWallet) {
      this.errorMessage = 'PLEASE_USE_OWNER_WALLET_TO_SIGN'
      return
    }
    if (this.isUrlIscnId) {
      this.iscnId = this.url;
      this.$router.push(
        this.localeLocation({
          name: 'nft-iscn-iscnId',
          params: this.iscnParams,
        })!,
      )
      return;
    }

    this.balance = await getAccountBalance(this.address) as string
    if (this.balance === '0') {
      this.toggleSnackbar('INSUFFICIENT_BALANCE')
      return
    }

    try {
      this.errorMessage = ''
      if (!this.url) {
        this.errorMessage = this.$t(
          'HomePage.search.errormessage.empty',
        ) as string
        return
      }
      this.isLoading = true
      await this.crawlUrlData()
      if (this.crawledData?.body) {
          const arweaveFeeInfo = await this.estimateArweaveFee()
          if (!this.arweaveId) {
            if (!this.arweaveFeeTxHash) { await this.sendArweaveFeeTx(arweaveFeeInfo) }
            await this.submitToArweave()
          }
      }
      await this.submitToISCN()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      this.setError(err)
    } finally {
      this.isLoading = false
    }
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
      const { data } = await this.$axios.get(`/crawler/?url=${encodeURIComponent(this.url)}`)
      this.crawledData = data
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('CANNOT_CRAWL_URL')
      throw err
    }
  }

  async estimateArweaveFee() {
    try {
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

  async sendArweaveFeeTx({ to, amount, memo }: { to: string, amount: BigNumber, memo: string }): Promise<void> {
    if (!this.signer) throw new Error('SIGNER_NOT_INITED')
    if (!to) throw new Error('TARGET_ADDRESS_NOT_SET')
    try {
      const { transactionHash } = await sendLIKE(this.address, to, amount.toFixed(), this.signer, memo)
      this.arweaveFeeTxHash = transactionHash;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('CANNOT_SEND_ARWEAVE_FEE_TX')
      throw err
    }
  }

  async submitToArweave(): Promise<void> {
    try {
      if (!this.arweaveFeeTxHash) throw new Error('ARWEAVE_FEE_TX_HASH_NOT_SET')
      const { arweaveId } = await this.$axios.$post(
        `${API_POST_ARWEAVE_UPLOAD}?txHash=${this.arweaveFeeTxHash}`,
        this.formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )
      this.arweaveId = arweaveId
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('CANNOT_UPLOAD_TO_ARWEAVE')
      throw err
    }
  }

  async submitToISCN(): Promise<void> {
    if (!this.signer) {
      this.errorMessage = 'MISSING_SIGNER'
      return
    }
    try {
      const res = await signISCNTx(
        formatISCNTxPayload(this.iscnPayload),
        this.signer,
        this.address,
      )
      this.iscnId = res.iscnId
      if (this.url && this.likerId) await postMappingWithCosmosWallet(this.iscnId, this.url, this.likerId, this.signer, this.address)
      if (res) {
        this.$router.push(
          this.localeLocation({
            name: 'nft-iscn-iscnId',
            params: this.iscnParams,
          })!,
        )
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('CANNOT_SEND_ISCN_TX')
      throw err
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