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
        <IconLikerLand v-else-if="type === 'likerId'" />
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

const signerModule = namespace('signer')
const keplrModule = namespace('keplr')

@Component
export default class ConnectWalletButton extends Vue {
  @Prop(String) readonly type!: string

  @signerModule.Action updateSignerInfo!: (arg0: {
    signer: OfflineSigner | null
    address: string
  }) => void

  @keplrModule.Getter('getWalletAddress') keplrWallet!: string
  @keplrModule.Getter('getSigner') keplrSigner!: OfflineSigner | null
  @keplrModule.Action initKeplr!: () => Promise<boolean>
  @keplrModule.Action initWalletConnect!: () => Promise<boolean>

  get title() {
    switch (this.type) {
      case 'keplr':
        return this.$t('ConnectWalletButton.keplr.title');

      case 'likerId':
        return this.$t('ConnectWalletButton.likerId.title');

      default:
        return '';
    }
  }

  get description() {
    switch (this.type) {
      case 'keplr':
        return this.$t('ConnectWalletButton.keplr.description');

      case 'likerId':
        return this.$t('ConnectWalletButton.likerId.description');

      default:
        return '';
    }
  }

  async handleClick() {
    this.$emit('click', this.type)
    switch (this.type) {
      case 'keplr':
        await this.initKeplr();
        break;
      case 'likerId':
        await this.initWalletConnect();
        break;
      default:
        return;
    }
    this.updateSignerInfo({
      signer: this.keplrSigner,
      address: this.keplrWallet,
    });
  }
}
</script>
