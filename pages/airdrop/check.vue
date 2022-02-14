<template>
  <Page
    :class="[
      'flex',
      'flex-col',
      'w-full',
      'items-center',
      'justify-center',
      'px-[12px]',
      'md:px-0',
    ]"
  >
    <img
      :class="[
        'hidden',
        'my-[32px]',
        'w-[300px]',
        'lg:block',
      ]"
      src="/images/airdrop/title_Checker.png"
    />
    <Label
      :class="[
        'my-[24px]',
        'font-extrabold',
        'text-like-green',
        'lg:hidden',
        'text-center',
      ]"
      :text="$t('AirDrop.label.checker')"
      preset="h2"
      align="center"
    />
    <AirdropVerifier
      v-if="claimmingAddress"
      :address="claimmingAddress"
      :claimmable-amount="claimmableAmount"
      :is-qualified-for-atom="isQualifiedForAtom"
      :is-qualified-for-osmo="isQualifiedForOsmo"
      :is-qualified-for-civic="isQualifiedForCivic"
    />
    <Label v-else :text="errorMessage" />
  </Page>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
// eslint-disable-next-line import/no-extraneous-dependencies
import { MetaInfo } from 'vue-meta'

import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type'
import { AIRDROP_OVERVIEW_ENDPOINT } from '~/constant'

const signerModule = namespace('signer')
const iscnModule = namespace('iscn')

export enum Denom {
  Nanolike = 0.000000001,
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

  claimmableAmount: any = 0
  isQualifiedForAtom: boolean = false
  isQualifiedForOsmo: boolean = false
  isQualifiedForCivic: boolean = false

  errorMessage: string = ''

  get claimmingAddress() {
    return this.walletAddress
  }

  mounted() {
    if (this.claimmingAddress) {
      this.fetchClaimmableAmount()
    } else {
      this.errorMessage = this.$t('error.not.connect.wallet') as string
    }
  }

  @Watch('walletAddress')
  async fetchClaimmableAmount() {
    if (this.claimmingAddress) {
      const res: any = await this.$axios.get(
        `${AIRDROP_OVERVIEW_ENDPOINT}${this.claimmingAddress}`,
      )
      this.$emit('claimmingAddress')
      this.claimmableAmount = Math.round(
        res.data.allocatedAmount * Denom.Nanolike,
      )
      this.isQualifiedForAtom = !!res.data.atomAmount
      this.isQualifiedForOsmo = !!res.data.osmosisAmount
      this.isQualifiedForCivic = !!res.data.civicLikerAmount
    } else {
      this.$router.push(this.localeLocation({ name: 'airdrop' })!)
    }
  }
}
</script>
