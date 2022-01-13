<template>
  <div class="w-full">
    <!-- Wallet -->
    <div
      :class="[
        'hidden',
        'lg:flex',
        'flex-col',
        'items-start',
        'bg-light-gray',
        'pt-[24px]',
        'pb-[56px]',
        'px-[56px]',
      ]"
    >
      <Label
        :class="[
          'font-extrabold',
          'text-like-green',
        ]"
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
        :text="$t('AirDrop.label.connect.address')"
        preset="p5"
      />
      <Label
        :class="[
          'text-dark-gray',
          'mt-[8px]',
          'text-center',
          'lg:hidden',
        ]"
        :text="$t('AirDrop.guide.connect.wallet')"
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
          @click="handleAddressInput"
        >
          <template #prepend>
            <IconSearch class="w-[20px]" />
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
      !COSMOS_ADDRESS_REGEX.test(this.inputAddress) &&
      !OSMOSIS_ADDRESS_REGEX.test(this.inputAddress)
    ) {
      this.errorMessage = this.$t('AirDrop.errorMessage.address') as string
      return;
    }
    this.$emit('input', this.inputAddress)
  }
}
</script>
