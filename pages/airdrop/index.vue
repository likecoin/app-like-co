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
        'left-[880px]',
        'z-[8]',
        'w-[340px]',
      ]"
      src="/images/airdrop/planet_1.png"
    />
    <img
      :class="[
        'absolute',
        'top-[560px]',
        'left-[20px]',
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
      <AirdropLogin
        v-if="!address"
        :is-airdrop-started="isAirdropStarted"
        @getAddress="verifyAmount"
      />
      <AirdropVierfier v-if="address && !isAirdropStarted" :address="address" />
      <AirdropMissions
        v-if="(address && isAirdropStarted) || isNoWallet"
        :address="address"
      />
    </div>
    <!-- follow LikeCoin -->
    <Label text="Follow LikeCoin" preset="h4" />
    <div
      :class="[
        'flex',
        'justify-center',
        'mt-[16px]',
      ]"
    >
      <Button
        v-for="item in 4"
        :key="item"
        preset="tertiary"
        circle="true"
        class="w-[32px] h-[32px] mx-[8px]"
      >
        <IconCoinEthereum class="text-dark-gray" />
      </Button>
    </div>
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
  layout: 'default',
})
export default class AirdropPageextends extends Vue {
  @signerModule.Getter('getAddress') currentAddress!: string
  @iscnModule.Action queryISCNByAddress!: (
    arg0: string
  ) => ISCNRecordWithID[] | PromiseLike<ISCNRecordWithID[]>

  step: string = ''
  address: string = ''
  TotalAmount: any = ''
  isAirdropStarted: boolean = true
  isNoWallet: boolean = false

  verifyAmount({ address }: { address: string }) {
    this.address = address  
    // not ready yet ↓
    // const res:any = await this.$axios.get(
    //   `https://airdrop.rinkeby.like.co/overview?address=${address}`,
    // )
    // console.log(res)
  }
}
</script>
