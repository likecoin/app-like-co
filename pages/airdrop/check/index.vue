<template>
  <Page :class="['justify-start', 'bg-light-gray']">
    <!-- Container -->
    <img
      :class="[
        'absolute',
        'top-0',
        'z-0',
        'w-full',
      ]"
      src="/images/airdrop/background.png"
    />
    <img
      :class="[
        'absolute',
        'top-[260px]',
        'left-[60%]',
        'z-[8]',
        'w-[340px]',
      ]"
      src="/images/airdrop/planet_1.png"
    />
    <img
      id="lg"
      :class="[
        'absolute',
        'top-[560px]',
        'left-[20px]',
        'z-[8]',
        'w-[276px]',
      ]"
      src="/images/airdrop/planet_2.png"
    />
    <div id="transparent-to-top" />
    <div
      :class="[
        'relative',
        'z-[5]',
        'overflow-hidden',
        'flex flex-col',
        'items-center',
        'justify-center',
        'mx-auto',
        'mt-[280px]',
        'mb-[32px]',
        'min-w-[936px]',
        'max-w-[970px]',
        'box-border',
        'bg-white',
        'rounded-[24px]',
        'border-[2px]',
        'border-airdrop-gold',
      ]"
    >
      <AirdropLogin v-if="!address" @getAddress="getOverview" />
      <AirdropVierfier
        v-if="address"
        :address="address"
        :total-amount="totalAmount"
        :is-qualified-for-atom="isQualifiedForAtom"
        :is-qualified-for-osmo="isQualifiedForOsmo"
        :is-qualified-for-civic="isQualifiedForCivic"
      />
    </div>
    <!-- follow LikeCoin -->
    <SubscriptionCard preset="community" />
    <!-- get tokens -->
    <TokenBar
      :class="[
        'mt-[300px]',
        'mb-[24px]',
        'ml-auto',
        'w-min',
      ]"
    />
  </Page>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type'

const signerModule = namespace('signer')
const iscnModule = namespace('iscn')

export enum Denom {
  Nanolike = 0.000000001
}

@Component({
  layout: 'default',
})
export default class AirdropPageextends extends Vue {
  @signerModule.Getter('getAddress') currentAddress!: string
  @iscnModule.Action queryISCNByAddress!: (
    arg0: string
  ) => ISCNRecordWithID[] | PromiseLike<ISCNRecordWithID[]>

  address: string = ''
  totalAmount: any = 0
  isWithoutWallet: boolean = false
  isQualifiedForAtom: boolean = false
  isQualifiedForOsmo: boolean = false
  isQualifiedForCivic: boolean = false

  async getOverview({ address }: { address: string }) {
    this.address = address  
    const res: any = await this.$axios.get(
      `https://airdrop.rinkeby.like.co/api/overview?address=${address}`,
    )
    this.checkTotalAmount(res.data)
    this.checkIfQualified(res.data)
  }

  checkTotalAmount(data:any) {
    this.totalAmount = Math.round(data.totalAmount * Denom.Nanolike)
  }

  checkIfQualified(data:any) {
    this.isQualifiedForAtom = !!data.atomAmount
    this.isQualifiedForOsmo = !!data.osmosisAmount
    this.isQualifiedForCivic = !!data.civicLikerAmount
  }
}
</script>
<style>
@media only screen and (max-width: 1140px) {
  #lg {
    display: none;
  }
}
#transparent-to-top {
  width: 100%;
	height: 100%;
  background: linear-gradient(to bottom, rgb(247, 247, 247,0) 35%, rgb(247, 247, 247,1));
  position: absolute;
	top: 0;
	left: 0;
}
</style>
