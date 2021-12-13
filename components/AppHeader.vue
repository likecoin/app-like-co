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
            v-if="currentAddress"
            preset="secondary"
            :title="currentAddress"
          >
            <div class="max-w-[148px] overflow-hidden overflow-ellipsis">{{ currentAddress }}</div>
          </Button>
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
    <Dialog
      v-model="isConnectWalletDialogOpened"
      preset="custom"
    >
      <Label
        preset="h5"
        class="text-like-green"
        :text="$t('AppHeader.button.connectWallet')"
      >
        <template #prepend>
          <IconSignIn />
        </template>
      </Label>
      <ul class="mt-[24px]">
        <li
          v-for="(type, i) in connectWalletTypes"
          :key="type"
          :class="{
            'mt-[8px]': i > 0,
          }"
        >
          <ConnectWalletButton
            class="w-full"
            :type="type"
            @click="handleConnectWalletButtonClick"
          />
        </li>
      </ul>
    </Dialog>
    <ConnectLikerIdDialog />
  </header>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import {
  IS_TESTNET,
  CONNECT_WALLET_TYPES,
} from '~/constant'

const signerModule = namespace('signer')

@Component
export default class AppHeader extends Vue {
  @signerModule.Getter('getAddress') currentAddress!: string

  isConnectWalletDialogOpened = false

  // eslint-disable-next-line class-methods-use-this
  get isTestnet() {
    return !!IS_TESTNET
  }

  // eslint-disable-next-line class-methods-use-this
  get connectWalletTypes() {
    return CONNECT_WALLET_TYPES
  }

  handleConnectWalletButtonClick() {
    this.isConnectWalletDialogOpened = false
  }
}
</script>
