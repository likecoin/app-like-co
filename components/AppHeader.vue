<!-- Please remove this file from your project -->
<template>
  <div>
    <header
      :class="[
        'hidden',
        'mb-[100px]',
        'lg:block',
      ]"
    >
      <div
        :class="[
          'fixed',
          'z-10',
          'top-0',
          'inset-x-0',
          'py-[24px]',
          'bg-gradient-to-b',
          'from-white',
          'to-transparent'
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
              :text="$t('AppHeader.tabBar.button.publish')"
              :to="localeLocation({ name: 'index' })"
            />
            <MenuButtonDivider />
            <MenuButton
              :text="$t('AppHeader.tabBar.button.mint')"
              :to="localeLocation({ name: 'nft' })"
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
            @click="handleConnectWalletButtonClick"
          />
          </div>
        </nav>
      </div>
    </header>
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
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

import { IS_TESTNET } from '~/constant'

const signerModule = namespace('signer')
const walletModule = namespace('wallet')

@Component
export default class AppHeader extends Vue {
  @walletModule.Getter('getType') walletType!: string | null
  @walletModule.Action('toggleConnectDialog') toggleConnectWalletDialog!: (isShow: boolean) => void
  @walletModule.Action('reset') resetWallet!: () => void

  @signerModule.Getter('getAddress') currentAddress!: string
  @signerModule.Action('reset') resetSigner!: () => void

  // eslint-disable-next-line class-methods-use-this
  get isTestnet() {
    return !!IS_TESTNET
  }

  get isWalletFromLikerLikerApp() {
    return this.walletType === 'likerland_app';
  }

  handleClickSignOutButton() {
    this.resetWallet();
    this.resetSigner();
  }

  handleConnectWalletButtonClick() {
    this.toggleConnectWalletDialog(true)
  }
}
</script>
