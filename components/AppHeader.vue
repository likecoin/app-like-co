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
              href="https://dao.like.co/validators"
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
                  v-if="isUsingMobileApp"
                  #prepend
                >
                  <IconWalletConnectLogo />
                </template>
                <div
                  :class="[
                    isUsingMobileApp ? 'w-[116px]' : 'w-[148px]',
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
import logTrackerEvent, { setLoggerUser } from '~/utils/logger'

import { IS_TESTNET } from '~/constant'

const walletModule = namespace('wallet')
const bookApiModule = namespace('book-api')

@Component
export default class AppHeader extends Vue {
  @walletModule.Getter('getType') walletType!: string | null
  @walletModule.Action('disconnectWallet') disconnectWallet!: () => void
  @walletModule.Action('openConnectWalletModal') openConnectWalletModal!: (params: { language: string, fullPath?: string }) => Promise<any>
  @walletModule.Action('initWallet') initWallet!: (params: { method: any, accounts: any, offlineSigner?: any }) => Promise<any>
  @walletModule.Action('signMessageMemo') signMessageMemo!: (action: string, permissions?: string[]) => Promise<any>
  @walletModule.Getter('getWalletAddress') currentAddress!: string
  @walletModule.Getter('getSigner') signer!: any
  @bookApiModule.Action('authenticate') authenticate!: ({inputWallet = '', signature = {}}: {inputWallet?: string, signature?: any}) => Promise<any>
  @bookApiModule.Action('clearSession') clearSession!: () => void

  isLoading = false

  // eslint-disable-next-line class-methods-use-this
  get isTestnet() {
    return !!IS_TESTNET
  }

  get isUsingMobileApp() {
    return this.walletType?.includes('mobile') || this.walletType?.includes('walletconnect') || this.isUsingLikerLandApp
  }

  get isUsingLikerLandApp() {
    return this.walletType === 'likerland-app'
  }

  handleClickSignOutButton() {
    this.disconnectWallet();
  }

  async handleConnectWalletButtonClick() {
    this.isLoading = true
    const connection = await this.openConnectWalletModal({
      language: this.$i18n.locale.split('-')[0],
      fullPath: this.$route.fullPath,
    })
    try {
      if (connection) {
      const { method, accounts } = connection
      logTrackerEvent(
        this,
        'user',
        `connected_wallet_${method}`,
        'connected_wallet',
        1,
      )
      setLoggerUser(this, {
        wallet: accounts[0].address,
        method,
      })
      await this.initWallet(connection)
      if (!this.currentAddress || !this.signer) return
      const signature = await this.signMessageMemo('authorize', [
        'read:nftbook',
        'write:nftbook',
        'read:nftcollection',
        'write:nftcollection',
      ])
      if (!signature) { return }
      await this.authenticate({inputWallet:this.currentAddress, signature})
    }
    } catch (error) {
      this.disconnectWallet()
      this.clearSession()
      // eslint-disable-next-line no-console
      console.error('handleConnectWalletButtonClick error', error)
    }
    this.isLoading = false
  }
}
</script>
