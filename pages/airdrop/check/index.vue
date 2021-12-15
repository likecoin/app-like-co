<template>
  <Page :class="['justify-start','bg-light-gray','items-center']">
    <!-- Container -->
    <div
      :class="[
        'flex',
        'flex-col',
        'items-center',
        'mx-auto',
        'min-w-[1440px]',
        'w-full',
        'h-full',
        'bg-gradient-to-b',
        'from-white',
        'to-light-gray',
        'mt-[-100px]',
      ]"
    >
      <img
        :class="[
          'absolute',
          'z-[0]',
          'min-w-[1440px]',
          'max-w-[1440px]',
        ]"
        src="/images/airdrop/background.png"
      />
      <img
        id="planet1"
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
        id="planet2"
        :class="[
          'absolute',
          'top-[560px]',
          'left-[8%]',
          'z-[8]',
          'w-[276px]',
        ]"
        src="/images/airdrop/planet_2.png"
      />
      <div
        :class="[
          'relative',
          'z-[5]',
          'overflow-hidden',
          'flex flex-col',
          'items-center',
          'justify-center',
          'mx-auto',
          'mt-[380px]',
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
      <SubscriptionCard class="mb-[150px]" preset="community" />
      <!-- get tokens -->
      <div 
        :class="[
          'flex',
          'w-full',
          'justify-between',
          'px-[24px]',
          'mb-[24px]'
        ]"
      >
        <InformationBar/>
        <TokenBar/>
      </div>
    </div>
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
@media only screen and (max-width: 1440px) {
  #planet1 {
    left: 880px
  }
  #planet2 {
    left: 30px
  }
}
</style>
