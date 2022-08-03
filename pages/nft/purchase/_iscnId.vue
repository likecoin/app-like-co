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
    <div class="flex flex-col w-full max-w-[580px]">
      <Card
        :class="[
          'flex',
          'flex-col',
          'mt-[4px]',
          'py-[22px]',
          'px-[28px]',
          'border-[2px]',
          'border-medium-gray',
          'rounded-[16px]',
          'justify-center',
          'items-start',
        ]"
      >
        <Label preset="h3" class="text-dark-gray mb-[8px]">{{ name }}</Label>
        <Label preset="p6" class="text-dark-gray mb-[8px]">{{ description }}</Label>
        <p class="text-[12px] text-medium-gray">by {{ ownerName || ownerAddr | ellipsis }}</p>
        <div class="w-[24px] h-[2px] bg-medium-gray my-[20px]" />
        <div class="flex flex-col items-start w-full sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center">
            <Label preset="h2" class="text-like-green">{{ nftPrice }} $LIKE</Label>
            <Label
              v-if="currentLIKEPrice"
              preset="p5"
              class="text-medium-gray ml-[8px]"
            >
              {{ NFTPriceUSD }}
            </Label>
          </div>
          <Button
            v-if="!isLoading"
            preset="secondary"
            :text="$t('NFTPortal.button.collect')"
            class="mt-[8px] sm:mt-0"
            @click="onClickMint"
          >
            <template #prepend>
              <IconPrice />
            </template>
          </Button>
          <ProgressIndicator v-else/>
        </div>
        <Label v-if="owningCount > 0" class="self-end mt-[4px]">
          <i18n path="NFTPortal.label.owning">
            <span class="font-bold text-like-green" place="count">{{ owningCount }}</span>
          </i18n>
        </Label>
      </Card>
    </div>
    <Snackbar v-model="isOpenWarningSnackbar" preset="warn">
      {{ errorMsg }}
    </Snackbar>
  </Page>
</template>

<script lang="ts">
import qs from 'querystring'
import BigNumber from 'bignumber.js'
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing'
import { Vue, Component, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { DeliverTxResponse } from '@cosmjs/stargate'
import {
  API_LIKER_NFT_PURCHASE,
  getNftClassUriViaIscnId,
  getLIKEPrice,
  getAddressLikerIdMinApi,
} from '~/constant/api'
import getQueryClient from '~/utils/cosmos/iscn/query';
import { getSigningClient } from '~/utils/cosmos/iscn/sign'
import { LIKER_NFT_API_WALLET, COSMOS_DENOM, LIKER_LAND_URL } from '~/constant'
import axios, { AxiosError } from 'axios'

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
  layout: 'wallet',
})
export default class NFTTestButtonPage extends Vue {
  @signerModule.Getter('getAddress') address!: string
  @signerModule.Getter('getSigner') signer!: OfflineSigner | null

  classId: string = ''
  nftPrice: number = -1
  totalPrice: number = -1
  nftInfo: any = null
  owningCount = -1
  grantTransactionHash: string = ''
  isOpenWarningSnackbar = false

  errorMsg: string = ''
  name: string = ''
  description: string = ''
  ownerAddr: string = ''
  ownerName: string = ''
  currentLIKEPrice: number = 0

  isLoading: boolean = false

  get iscnId(): string {
    const { iscnId } = this.$route.params
    return iscnId
  }

  get NFTPriceUSD(): string {
      const price = this.currentLIKEPrice * this.nftPrice;
      return `(${price.toFixed(3)} USD)`;
  }

  async mounted() {
    await Promise.all([
      this.getPurchaseInfo(),
      this.getNftMetadata(),
      this.getOwningCount(),
    ]).catch((err) => this.$nuxt.error({ statusCode: 404, message: err }))
    await this.getOwnerName().catch(err => console.error(err))
    this.getLIKEPrice().catch(err => console.error(err))
  }

  @Watch('classId')
  @Watch('address')
  async getOwningCount() {
    if (!this.classId || !this.address) return;
    const c = await getQueryClient();
    const client = await c.getQueryClient();
    const { amount = 0 } = await (client as any).nft.balance(this.classId, this.address);
    this.owningCount = amount;
  }

  redirectToPurchaserPortfolio() {
    const purchaserAddress = this.address
    if (window.opener) {
      window.opener.postMessage({
        type: 'navigate',
        route: `/${purchaserAddress}`,
      }, '*');
      window.close()
    } else {
      window.open(`${LIKER_LAND_URL}/${purchaserAddress}`, '_blank', 'noopener')
    }
  }

  async onClickMint() {
    this.isLoading = true
    try {
      this.isOpenWarningSnackbar = false;
      await this.grantPurchaseTransaction()
      await this.purchaseNFT()
      await this.getPurchaseInfo()
      this.redirectToPurchaserPortfolio()
    } catch (err) {
      console.error(err)
      this.isOpenWarningSnackbar = true;
      if (axios.isAxiosError(err)) {
        this.errorMsg = (err as AxiosError).response?.data || (err as Error).toString();
      } else {
        this.errorMsg = (err as Error).toString();
      }
    } finally {
      this.isLoading = false
    }
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
    this.classId = data.metadata.classId
  }

  async getNftMetadata() {
    const { data } = await this.$axios.get(getNftClassUriViaIscnId(this.iscnId));
    this.name = data.name
    this.description = data.description
    this.ownerAddr = data.iscn_owner
  }

  async getLIKEPrice() {
    const { data } = await this.$axios.get(getLIKEPrice());
    this.currentLIKEPrice = data.likecoin.usd;
  }

  async grantPurchaseTransaction() {
    if (!this.signer) throw new Error('PLEASE_CONNECT_WALLET_FIRST')
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

  async getOwnerName() {
    const { data } = await this.$axios.get(
      getAddressLikerIdMinApi(this.ownerAddr as string),
    )
    if (data) {
      this.ownerName = data.displayName
    }
  }
}
</script>
