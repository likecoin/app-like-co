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
          :disabled="isMobileViews"
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
import { CONNECT_WALLET_TYPES } from '~/constant'

@Component
export default class ConnectWalletDialog extends Vue {
  @Prop({ default: false }) readonly isOpened!: boolean

  isMobileViews: boolean = false;

  mounted(){
    if (window.innerWidth <= 640) {
      this.isMobileViews = true
    }
  }

  // eslint-disable-next-line class-methods-use-this
  get connectWalletTypes() {
    return CONNECT_WALLET_TYPES
  }
}
</script>
