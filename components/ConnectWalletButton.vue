<template>
  <button
    :class="[
      'block',
      'border-[4px]',
      'border-shade-gray',
      'hover:border-like-cyan',
      'rounded-[16px]',
      'p-[24px]',
      'group',
      'hover:bg-like-cyan-extralight',
      'transition-colors',
      'cursor-pointer',
    ]"
    :title="title"
    @click="handleClick"
  >
    <Label
      :class="[
        'group-hover:text-like-green',
        'transition-colors',
      ]"
      preset="h4"
      :text="title"
    >
      <template #prepend>
        <IconKeplr v-if="type === 'keplr'" />
        <IconLikerLand v-else-if="type === 'likerland_app'" />
      </template>
    </Label>
    <Label
      class="mt-[12px]"
      :text="description"
    />
  </button>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { logTrackerEvent, updateSentryUser, setTrackerUser } from '~/utils/logger'

const signerModule = namespace('signer')
const walletModule = namespace('wallet')

@Component
export default class ConnectWalletButton extends Vue {
  @Prop(String) readonly type!: string

  @signerModule.Action updateSignerInfo!: (arg0: {
    signer: OfflineSigner | null
    address: string
  }) => void

  @walletModule.Getter('getWalletAddress') keplrWallet!: string
  @walletModule.Getter('getSigner') keplrSigner!: OfflineSigner | null
  @walletModule.Action initKeplr!: () => Promise<boolean>
  @walletModule.Action initWalletConnect!: () => Promise<boolean>

  get title() {
    switch (this.type) {
      case 'keplr':
        return this.$t('ConnectWalletButton.keplr.title');

      case 'likerland_app':
        return this.$t('ConnectWalletButton.likerland_app.title');

      default:
        return '';
    }
  }

  get description() {
    switch (this.type) {
      case 'keplr':
        return this.$t('ConnectWalletButton.keplr.description');

      case 'likerland_app':
        return this.$t('ConnectWalletButton.likerland_app.description');

      default:
        return '';
    }
  }

  async handleClick() {
    this.$emit('click', this.type)
    switch (this.type) {
      case 'keplr':
        logTrackerEvent(this, 'General', 'ConnectKeplr', '', 1);
        await this.initKeplr();
        break;
      case 'likerland_app':
        logTrackerEvent(this, 'General', 'ConnectLikerLandApp', '', 1);
        await this.initWalletConnect();
        break;
      default:
        return;
    }
    this.updateSignerInfo({
      signer: this.keplrSigner,
      address: this.keplrWallet,
    });
    setTrackerUser(this, { wallet: this.keplrWallet });
    updateSentryUser(this, { wallet: this.keplrWallet });
    logTrackerEvent(this, 'General', 'ConnectWalletSuccess', this.keplrWallet, 1);
  }
}
</script>
