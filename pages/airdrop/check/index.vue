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
      <div id="cross-bg" :class="['w-full','h-full']">
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
          <AirdropLogin
            v-if="!claimmingAddress"
            @input="handleAddressInput"
          />
          <AirdropVerifier
            v-else
            :address="claimmingAddress"
            :claimmable-amount="claimmableAmount"
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
    </div>
  </Page>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
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
export default class AirdropCheckPage extends Vue {
  @signerModule.Getter('getAddress') walletAddress!: string
  @iscnModule.Action queryISCNByAddress!: (
    arg0: string
  ) => ISCNRecordWithID[] | PromiseLike<ISCNRecordWithID[]>

  inputAddress: string = ''
  claimmableAmount: any = 0
  isWithoutWallet: boolean = false
  isQualifiedForAtom: boolean = false
  isQualifiedForOsmo: boolean = false
  isQualifiedForCivic: boolean = false

  mounted() {
    this.fetchClaimmableAmount()
  }

  get claimmingAddress() {
    return this.walletAddress || this.inputAddress
  }

  handleAddressInput(address: string) {
    this.inputAddress = address
    this.fetchClaimmableAmount()
  }

  @Watch('walletAddress')
  async fetchClaimmableAmount() {
    if (!this.claimmingAddress) return
    // TODO: Separate Testnet/Production endpoint
    const res: any = await this.$axios.get(
      `https://airdrop.rinkeby.like.co/api/overview?address=${this.claimmingAddress}`,
    )
    this.claimmableAmount = Math.round(res.data.totalAmount * Denom.Nanolike)
    this.isQualifiedForAtom = !!res.data.atomAmount
    this.isQualifiedForOsmo = !!res.data.osmosisAmount
    this.isQualifiedForCivic = !!res.data.civicLikerAmount
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
#cross-bg {
    background-image:url('/images/airdrop/background_cross.svg') ;
    background-repeat: repeat;
  }
</style>
