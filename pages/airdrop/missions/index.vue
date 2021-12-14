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
      <AirdropMissions
        :address="currentAddress"
      />
    </div>
    <!-- follow LikeCoin -->
    <SubscriptionCard preset="both" />
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

@Component({
  layout: 'wallet',
})
export default class AirdropPageextends extends Vue {
  @signerModule.Getter('getAddress') currentAddress!: string
  @iscnModule.Action queryISCNByAddress!: (
    arg0: string
  ) => ISCNRecordWithID[] | PromiseLike<ISCNRecordWithID[]>

  step: string = ''
  address: string = ''
  totalAmount: number = 0
  isNoWallet: boolean = false
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
