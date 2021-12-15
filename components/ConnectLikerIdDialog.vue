<template>
  <Dialog
    :header-text="$t('ConnectLikerIdDialog.title')"
    :open="!!walletConnectURI"
    @toggle="handleDialogToggle"
  >
    <template #header-prepend>
      <IconSignIn />
    </template>
    <div
      :class="[
        'flex',
        'items-center',
      ]"
    >
      <ol
        :class="[
          'list-decimal',
          'mx-[24px]'
        ]"
      >
        <li
          v-for="(step, i) in steps"
          :key="i"
          :class="{ 'mt-[16px]': i > 0 }"
        >
          <Label preset="p5">{{ step }}</Label>
        </li>
      </ol>
      <div
        :class="[
          'relative',
        ]"
      >
        <QRCodeView
          :class="[
            'absolute',
            'm-[27px]',
          ]"
          :value="walletConnectURI"
          :size="138"
        />
        <WalletConnectQRCodeFrame
          :class="[
            'w-[192px]',
            'text-[#3B99FC]',
          ]"
        />
      </div>
    </div>
  </Dialog>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { namespace } from 'vuex-class'

const walletModule = namespace('wallet')

@Component
export default class ConnectLikerIdDialog extends Vue {
  @walletModule.Getter('getWalletConnectURI') walletConnectURI!: string
  @walletModule.Mutation('setWalletConnectURI') setWalletConnectURI!: (uri: string) => void

  get steps() {
    return [
      this.$t('ConnectLikerIdDialog.step.1'),
      this.$t('ConnectLikerIdDialog.step.2'),
      this.$t('ConnectLikerIdDialog.step.3'),
    ]
  }

  handleDialogToggle(isOpened: boolean) {
    if (!isOpened) {
      this.setWalletConnectURI('')
    }
  }
}
</script>
