<!-- Please remove this file from your project -->
<template>
  <header class="mb-[100px]">
    <div
      :class="[
        'fixed',
        'z-10',
        'top-0',
        'inset-x-0',
        'py-[24px]',
        'backdrop-blur',
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
          <div
            v-if="currentAddress"
            :class="[
              'relative',
              'w-[180px]',
            ]"
          >
            <Button
              preset="secondary"
              :title="currentAddress"
            >
              <template
                v-if="isWalletFromLikerLikerApp"
                #prepend
              >
                <IconWalletConnectLogo />
              </template>
              <div
                :class="[
                  isWalletFromLikerLikerApp ? 'w-[116px]' : 'w-[148px]',
                  'overflow-hidden',
                  'overflow-ellipsis',
                ]"
              >{{ currentAddress }}</div>
            </Button>
            <Button
              :class="[
                'absolute',
                'inset-0',
                'hover:opacity-100',
                'opacity-0',
                'w-full',
              ]"
              preset="secondary"
              :text="$t('AppHeader.button.signOut')"
              :title="$t('AppHeader.button.signOut')"
              @click="handleClickSignOutButton"
            >
              <template #prepend>
                <IconSignOut />
              </template>
            </Button>
          </div>
          <Button
            v-else
            preset="secondary"
            :text="$t('AppHeader.button.connectWallet')"
            :title="$t('AppHeader.button.connectWallet')"
            @click="isConnectWalletDialogOpened = true"
          />
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
    <ConnectWalletDialog
      :is-opened="isConnectWalletDialogOpened"
      @quit="handleConnectWalletButtonClose"
      @close="handleConnectWalletButtonClose"
    />
    <ConnectLikerIdDialog />
  </header>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing'

import {
  IS_TESTNET,
  CONNECT_WALLET_TYPES,
} from '~/constant'

const signerModule = namespace('signer')
const walletModule = namespace('wallet')

@Component
export default class AppHeader extends Vue {
  @signerModule.Getter('getAddress') currentAddress!: string
  @signerModule.Action('reset') resetSigner!: () => void
  @signerModule.Action updateSignerInfo!: (arg0: {
    signer: OfflineSigner | null
    address: string
  }) => void

  @walletModule.Getter('getType') walletType!: string | null
  @walletModule.Getter('getWalletAddress') walletAddress!: string
  @walletModule.Getter('getSigner') signer!: OfflineSigner | null
  @walletModule.Action initIfNecessary!: () => Promise<boolean>
  @walletModule.Action('reset') resetWallet!: () => void

  isConnectWalletDialogOpened = false

  // eslint-disable-next-line class-methods-use-this
  get isTestnet() {
    return !!IS_TESTNET
  }

  // eslint-disable-next-line class-methods-use-this
  get connectWalletTypes() {
    return CONNECT_WALLET_TYPES
  }

  get isWalletFromLikerLikerApp() {
    return this.walletType === 'likerland_app';
  }

  async mounted() {
    const isInited = await this.initIfNecessary();
    if (isInited) {
      this.updateSignerInfo({
        address: this.walletAddress,
        signer: this.signer,
      })
    }
  }

  handleConnectWalletButtonClose() {
    this.isConnectWalletDialogOpened = false
  }

  handleClickSignOutButton() {
    this.resetWallet();
    this.resetSigner();
  }
}
</script>
