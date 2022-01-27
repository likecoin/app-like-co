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
        <li v-for="type in connectWalletTypes" :key="type">
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
      <Button
        :class="[
          'hidden',
          'lg:block',
          'text-center',
          'text-medium-gray',
          'mt-[32px]',
        ]"
        :text="$t('AirDrop.button.withoutWallet')"
        :to="localeLocation({ name: 'airdrop-claim' })"
        preset="plain"
      >
        <template #append>
          <IconArrowRight />
        </template>
      </Button>
      <Button
        :class="[
          'text-dark-gray',
          'mt-[8px]',
          'text-center',
          'lg:hidden',
        ]"
        :text="$t('AirDrop.button.withoutWallet')"
        :to="localeLocation({ name: 'airdrop-claim' })"
        preset="plain"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { CONNECT_WALLET_TYPES } from '~/constant'

@Component
export default class AirdropLogin extends Vue {
  // eslint-disable-next-line class-methods-use-this
  get connectWalletTypes() {
    return CONNECT_WALLET_TYPES
  }
}
</script>
