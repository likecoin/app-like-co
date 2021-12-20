<template>
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
</template>

<script lang="ts">

import { Vue, Component, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
// eslint-disable-next-line import/no-extraneous-dependencies
import { MetaInfo } from 'vue-meta'

import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type'
import { AIRDROP_OVERVIEW } from '~/constant'

const signerModule = namespace('signer')
const iscnModule = namespace('iscn')

export enum Denom {
  Nanolike = 0.000000001
}

@Component({
  head() {
    const title = this.$t('page.airdrop.checker.title')
    const description = this.$t('page.airdrop.checker.description')
    return {
      title,
      meta: [
        {
          hid: 'og:title',
          property: 'og:title',
          content: title,
        },
        {
          hid: 'description',
          name: 'description',
          content: description,
        },
        {
          hid: 'og:description',
          property: 'og:description',
          content: description,
        },
      ],
    } as MetaInfo
  },
})
export default class AirdropCheckPage extends Vue {
  @signerModule.Getter('getAddress') walletAddress!: string
  @iscnModule.Action queryISCNByAddress!: (
    arg0: string
  ) => ISCNRecordWithID[] | PromiseLike<ISCNRecordWithID[]>

  inputAddress: string = ''
  claimmableAmount: any = 0
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
      `${AIRDROP_OVERVIEW}${this.claimmingAddress}`,
    )
    this.claimmableAmount = Math.round(res.data.totalAmount * Denom.Nanolike)
    this.isQualifiedForAtom = !!res.data.atomAmount
    this.isQualifiedForOsmo = !!res.data.osmosisAmount
    this.isQualifiedForCivic = !!res.data.civicLikerAmount
  }
}
</script>
