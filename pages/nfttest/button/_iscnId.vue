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
    <div>ISCN: {{ iscnId }}</div>
    <template v-if="nftInfo">
      <div>NFT Class: {{ nftInfo.classId }}</div>
      <div>Sold count {{ nftInfo.soldCount }} / {{ nftInfo.totalCount }}</div>
    </template>
    <div>Price: {{ nftPrice }} LIKE</div>
    <hr/>
    <Button @click="onClickMint">Mint</Button>
    <Button v-if="showHistory" :to="localeLocation({ name: 'nfttest-history-iscnId', params: { iscnId: iscnId }  })">check history</Button>

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
import { API_LIKER_NFT_PURCHASE } from '~/constant/api'
import { getSigningClient } from '~/utils/cosmos/iscn/sign'
import { LIKER_NFT_API_WALLET } from '~/constant'

const signerModule = namespace('signer')

@Component({
  fetch({ params, redirect }) {
    if (!params.iscnId) {
      redirect({ name: 'index' })
    }
  },
})
export default class NFTTestButtonPage extends Vue {
  @signerModule.Getter('getAddress') address!: string
  @signerModule.Getter('getSigner') signer!: OfflineSigner | null

  classId: string = '';
  nftPrice: number = -1;
  totalPrice: number = -1;
  nftInfo: any = null;
  grantTransactionHash: string = '';
  showHistory = false

  @Watch('nftInfo', { immediate: true, deep: true })
  showHistoryButton() {
    this.showHistory = true
  }

  get iscnId(): string {
    const { iscnId } = this.$route.params;
    return iscnId
  }

  async mounted() {
    await this.getPurchaseInfo()
  }

  async onClickMint() {
    await this.grantPurchaseTransaction();
    await this.purchaseNFT();
    await this.getPurchaseInfo();
  }

  async getPurchaseInfo() {
    const { data } = await this.$axios.get(API_LIKER_NFT_PURCHASE, {
      params: {
        iscn_id: this.iscnId,
      },
      paramsSerializer: params => qs.stringify(params),
    });
    this.nftPrice = data.price;
    this.totalPrice = data.totalPrice;
    this.nftInfo = data.metadata;
  }

  async grantPurchaseTransaction() {
    if (!this.signer) return;
    const signingClient = await getSigningClient();
    await signingClient.setSigner(this.signer);
    const res = await signingClient.createSendGrant(
      this.address,
      LIKER_NFT_API_WALLET,
      [{ denom: 'nanolike', amount: new BigNumber(this.totalPrice).shiftedBy(9).toFixed(0) }],
      Date.now() + 60000,
    );
    console.log(res);
    this.grantTransactionHash = (res as DeliverTxResponse).transactionHash;
  }

  async purchaseNFT() {
    const { data } = await this.$axios.post(API_LIKER_NFT_PURCHASE, {
    }, {
      params: {
        iscn_id: this.iscnId,
        class_id: this.classId,
        tx_hash: this.grantTransactionHash,
      },
      paramsSerializer: params => qs.stringify(params),
    });
    return data;
  }
}
</script>
