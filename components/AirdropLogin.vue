<template>
  <div
    :class="[
      'flex',
      'flex-col',
      'items-center',
      'w-full',
    ]"
  >
    <img
      :class="['my-[32px]', 'w-[300px]']"
      src="/images/airdrop/title_Checker.png"
    />
    <!-- Wallet -->
    <div
      :class="[
        'flex',
        'flex-col',
        'items-start',
        'bg-light-gray',
        'pt-[24px]',
        'pb-[56px]',
        'px-[56px]',
        'w-full',
      ]"
    >
      <Label
        :class="['font-extrabold', 'text-like-green']"
        :text="$t('AirDrop.label.connect.wallet')"
        preset="h2"
      />
      <Label
        :class="[
          'text-dark-gray',
          'mt-[8px]',
          'w-[600px]',
        ]"
        :text="$t('AirDrop.guide.connect.wallet')"
        preset="p5"
      />
      <ul
        :class="[
          'w-full',
          'p-[32px]',
          'grid',
          'grid-cols-2',
          'gap-[24px]',
        ]"
      >
        <li
          v-for="type in connectWalletTypes"
          :key="type"
        >
          <ConnectWalletButton
            :class="[
              'w-full',
              'bg-white',
            ]"
            :type="type"
          />
        </li>
      </ul>
    </div>
    <!-- input -->
    <div
      :class="[
        'flex',
        'flex-col',
        'items-center',
        'mb-[32px]',
      ]"
    >
      <Label
        :class="[
          'text-center',
          'text-medium-gray',
          'mt-[32px]',
        ]"
        :text="$t('AirDrop.label.connect.address')"
        preset="p5"
      />
      <div
        :class="[
          'flex',
          'justify-center',
          'mt-[24px]',
          'p-[16px]',
          'w-[450px]',
        ]"
      >
        <TextField
          v-model="inputAddress"
          class="flex-grow"
          :placeholder="$t('AirDrop.placeholder.address')"
          :error-message="errorMessage"
        />
        <Button
          class="ml-[16px]"
          preset="secondary"
          :text="$t('AirDrop.button.enter')"
          @click="handleAddressInput"
        >
          <template #append>
            <IconArrowRight />
          </template>
        </Button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import {
  CONNECT_WALLET_TYPES,
  COSMOS_ADDRESS_REGEX,
  OSMOSIS_ADDRESS_REGEX,
} from '~/constant'

@Component
export default class AirdropLogin extends Vue {
  @Prop(Boolean) readonly isAirdropStarted: boolean | undefined

  inputAddress: string = ''
  errorMessage: string = ''

  // eslint-disable-next-line class-methods-use-this
  get connectWalletTypes() {
    return CONNECT_WALLET_TYPES
  }

  handleAddressInput() {
    this.errorMessage = ''
    if (
      !COSMOS_ADDRESS_REGEX.test(this.inputAddress) ||
      !OSMOSIS_ADDRESS_REGEX.test(this.inputAddress)
    ) {
      this.errorMessage = this.$t('AirDrop.errorMessage.address') as string
      return;
    }
    this.$emit('input', this.inputAddress)
  }
}
</script>
