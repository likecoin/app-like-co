<!-- Please remove this file from your project -->
<template>
  <header class="mb-[100px]">
    <div
      :class="[
        'fixed',
        'z-10',
        'top-0',
        'inset-x-0',
        'py-[26px]',
        'backdrop-blur',
        { 'bg-none backdrop-blur-none' : $nuxt.$route.path.includes('airdrop') },
      ]"
    >
      <nav
        :class="[
          'flex',
          'flex-1',
          'items-center',
          'justify-center',
        ]"
      >
        <div
          :class="[
            'flex-grow',
            'mx-[24px]',
          ]"
        />
        <div
          :class="[
            'flex',
            'flex-shrink',
            'justify-center',
            'items-center',
            'p-[4px]',
            'mx-auto',
            'h-[48px]',
            'bg-shade-gray',
            'rounded-[14px]',
          ]"
        >
          <MenuButton
            :text="$t('AppHeader.tabBar.button.depub')"
            :to="localeLocation({ name: 'index' })"
          />
          <MenuButtonDivider />
          <MenuButton
            :text="$t('AppHeader.tabBar.button.publishing')"
            :to="localeLocation({ name: 'works' })"
          />
          <MenuButtonDivider />
          <MenuButton
            :text="$t('AppHeader.tabBar.button.stake')"
            target="_blank"
            rel="noopener"
            href="https://stake.like.co"
          >
            <template #append>
              <IconOpenInNew class="w-[12px]" />
            </template>
          </MenuButton>
        </div>
        <Button
          :to="localeLocation({ name: 'airdrop' })"
          :text="$t('AirDrop.button')"
          preset="primary"
          text-preset="h5"
          size="large"
          :class="['ml-[16px]']"
          :style="{ color: '#FFFFFF', backgroundColor: '#C69F67'}"
        >
          <template #prepend>
            <IconClaim class="w-[20px]" />
          </template>
        </Button>
        <div
          :class="[
            'flex',
            'flex-1',
            'justify-end',
            'flex-grow',
            'mx-[24px]',
          ]"
        >
          <Button
            preset="secondary"
            :text="$t('AppHeader.login.button')"
            :title="currentAddress || $t('AppHeader.login.button')"
            @click="onClickLoginKeplr"
          >
            <template v-if="currentAddress">
              <div class="max-w-[148px] overflow-hidden overflow-ellipsis">{{ currentAddress }}</div>
            </template>
          </Button>
        </div>
      </nav>
    </div>
    <div 
      v-if="isTestnet"
      :class="[
        'fixed',
        'top-[0px]',
        'w-full',
        'z-50',
      ]"
    >
      <IconDangerStripe />
    </div>
  </header>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing'
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { IS_TESTNET } from '~/constant'

const signerModule = namespace('signer')
const keplrModule = namespace('keplr')

@Component
export default class AppHeader extends Vue {
  @signerModule.Getter('getAddress') currentAddress!: string
  @signerModule.Action updateSignerInfo!: (arg0: {
    signer: OfflineSigner | null
    address: string
  }) => void

  @keplrModule.Getter('getWalletAddress') keplrWallet!: string
  @keplrModule.Getter('getSigner') keplrSigner!: OfflineSigner | null
  @keplrModule.Action initKeplr!: () => Promise<boolean>

  // eslint-disable-next-line class-methods-use-this
  get isTestnet() {
    return !!IS_TESTNET
  }

  async onClickLoginKeplr() {
    await this.initKeplr()
    await this.updateSignerInfo({
      signer: this.keplrSigner,
      address: this.keplrWallet,
    })
  }
}
</script>
