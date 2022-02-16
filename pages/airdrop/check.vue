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
      @quit="initChecker"
    />
    <!-- input -->
    <div
      v-else
      :class="[
        'flex',
        'flex-col',
        'items-center',
        'mb-[32px]',
        'px-[24px]',
      ]"
    >
      <Label
        :class="[
          'hidden',
          'lg:block',
          'text-center',
          'text-medium-gray',
          'mt-[32px]',
        ]"
        :text="$t('AirDrop.label.checkWithWallet')"
        preset="p5"
      />
      <Label
        :class="[
          'text-dark-gray',
          'mt-[8px]',
          'text-center',
          'lg:hidden',
        ]"
        :text="$t('AirDrop.label.checkWithWallet')"
        preset="p5"
      />
      <div
        :class="[
          'flex',
          'flex-col',
          'items-center',
          'justify-center',
          'mt-[24px]',
          'p-[16px]',
          'w-full',
          'max-w-[450px]',
          'sm:flex-row',
        ]"
      >
        <TextField
          v-model="inputAddress"
          class="flex-grow"
          :placeholder="$t('AirDrop.placeholder.address')"
          :error-message="errorMessage"
        />
        <Button
          :class="[
            'mt-[16px]',
            'sm:ml-[16px]',
            'sm:mt-0',
          ]"
          preset="secondary"
          :text="$t('AirDrop.button.check')"
          @click="handleSubmitAddress"
        >
          <template #prepend>
            <IconSearch class="w-[20px]" />
          </template>
        </Button>
      </div>
    </div>
  </Page>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
// eslint-disable-next-line import/no-extraneous-dependencies
import { MetaInfo } from 'vue-meta'
import BigNumber from 'bignumber.js'
import {
  AIRDROP_OVERVIEW_ENDPOINT,
  COSMOS_ADDRESS_REGEX,
  OSMOSIS_ADDRESS_REGEX,
} from '~/constant'

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
  claimmableAmount: string = '0'
  isQualifiedForAtom: boolean = false
  isQualifiedForOsmo: boolean = false
  isQualifiedForCivic: boolean = false

  inputAddress: string = ''
  claimmingAddress: string = ''
  errorMessage: string = ''

  async fetchClaimmableAmount(address: string) {
      const res: any = await this.$axios.get(
        `${AIRDROP_OVERVIEW_ENDPOINT}${address}`,
      )
      this.$emit('claimmingAddress')
      this.claimmableAmount = new BigNumber(res.data.allocatedAmount)
        .shiftedBy(-9)
        .toFixed(0, BigNumber.ROUND_DOWN)
      this.isQualifiedForAtom = !!res.data.atomAmount
      this.isQualifiedForOsmo = !!res.data.osmosisAmount
      this.isQualifiedForCivic = !!res.data.civicLikerAmount
    }

  handleSubmitAddress() {
    this.errorMessage = ''
    if (
      !COSMOS_ADDRESS_REGEX.test(this.inputAddress) &&
      !OSMOSIS_ADDRESS_REGEX.test(this.inputAddress)
    ) {
      this.errorMessage = this.$t('AirDrop.errorMessage.address') as string
      return;
    }
    this.claimmingAddress = this.inputAddress
    this.fetchClaimmableAmount(this.claimmingAddress)
  }

  initChecker() {
    this.claimmableAmount = '0'
    this.isQualifiedForAtom = false
    this.isQualifiedForOsmo = false
    this.isQualifiedForCivic = false
    this.inputAddress = ''
    this.claimmingAddress = ''
    this.errorMessage = ''
  }
}
</script>
