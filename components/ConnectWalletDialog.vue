<template>
  <Dialog
    :open="!!isOpened"
    preset="custom"
    is-disabled-backdrop-click=true
    @close="$emit('quit')"
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
          @click="$emit('close')"
        />
      </li>
    </ul>
    <AttentionsMobileNotSupported v-if="isMobileViews" />
  </Dialog>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { isMobile } from '@walletconnect/browser-utils';
import { CONNECT_WALLET_TYPES } from '~/constant'

@Component
export default class ConnectWalletDialog extends Vue {
  @Prop({ default: false }) readonly isOpened!: boolean

  // eslint-disable-next-line class-methods-use-this
  get isMobileViews() {
    return isMobile()
  }

  // eslint-disable-next-line class-methods-use-this
  get connectWalletTypes() {
    return CONNECT_WALLET_TYPES
  }
}
</script>
