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
    <div class="flex flex-col w-[480px]">
      <div class="flex justify-between">
        <Label class="text-[8px]">Collect this work as NFT</Label>
        <Label class="text-[9px] text-dark-gray"
          >Work : {{ iscnId | ellipsis }}
          <template #prepend>
            <IconCreativeWork />
          </template>
        </Label>
      </div>
      <div
        :class="[
          'mt-[4px]',
          'p-[16px]',
          'border-[2px]',
          'border-medium-gray',
          'rounded-[16px]',
          'flex',
          'justify-between',
          'items-center',
        ]"
      >
        <Label preset="h2" class="text-like-green">{{ nftPrice }} $LIKE</Label>
        <Button preset="secondary" @click="onClickMint"
          >Collect Now <template #prepend><IconPlaceholder /></template
        ></Button>
      </div>
    </div>
  </Page>
</template>

<script lang="ts">
import qs from 'querystring'
import BigNumber from 'bignumber.js'
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing'
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { DeliverTxResponse } from '@cosmjs/stargate'
import { API_LIKER_NFT_PURCHASE } from '~/constant/api'
import { getSigningClient } from '~/utils/cosmos/iscn/sign'
import { LIKER_NFT_API_WALLET, COSMOS_DENOM } from '~/constant'

const signerModule = namespace('signer')

@Component({
  fetch({ params, redirect }) {
    if (!params.iscnId) {
      redirect({ name: 'index' })
    }
  },
  filters: {
    ellipsis(value: any) {
      const len: number = value.length
      const dots = '...'
      if (!value) return ''
      if (value.length > 15) {
        return value.substring(0, 10) + dots + value.substring(len - 5, len)
      }
      return value
    },
  },
})
export default class NFTTestButtonPage extends Vue {
  @signerModule.Getter('getAddress') address!: string
  @signerModule.Getter('getSigner') signer!: OfflineSigner | null

  classId: string = ''
  nftPrice: number = -1
  totalPrice: number = -1
  nftInfo: any = null
  grantTransactionHash: string = ''
  showHistory = false

  get iscnId(): string {
    const { iscnId } = this.$route.params
    return iscnId
  }

  async mounted() {
    await this.getPurchaseInfo()
  }

  async onClickMint() {
    await this.grantPurchaseTransaction()
    await this.purchaseNFT()
    await this.getPurchaseInfo()
  }

  async getPurchaseInfo() {
    const { data } = await this.$axios.get(API_LIKER_NFT_PURCHASE, {
      params: {
        iscn_id: this.iscnId,
      },
      paramsSerializer: (params) => qs.stringify(params),
    })
    this.nftPrice = data.price
    this.totalPrice = data.totalPrice
    this.nftInfo = data.metadata
  }

  async grantPurchaseTransaction() {
    if (!this.signer) return
    const signingClient = await getSigningClient()
    await signingClient.setSigner(this.signer)
    const res = await signingClient.createSendGrant(
      this.address,
      LIKER_NFT_API_WALLET,
      [{
          denom: COSMOS_DENOM,
          amount: new BigNumber(this.totalPrice).shiftedBy(9).toFixed(0),
        }],
      Date.now() + 60000,
    )
    this.grantTransactionHash = (res as DeliverTxResponse).transactionHash
  }

  async purchaseNFT() {
    const { data } = await this.$axios.post(
      API_LIKER_NFT_PURCHASE,
      {},
      {
        params: {
          iscn_id: this.iscnId,
          class_id: this.classId,
          tx_hash: this.grantTransactionHash,
        },
        paramsSerializer: (params) => qs.stringify(params),
      },
    )
    return data
  }
}
</script>
