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
          v-for="(i18nKey, i) in stepI18nKeys"
          :key="i"
          :class="{ 'mt-[16px]': i > 0 }"
        >
          <Label preset="p5">
            <i18n :path="i18nKey" tag="div">
              <template #likerlandAppLogo>
                <IconLikerLandApp
                  :class="[
                    'inline',
                    'w-[32px]',
                    'h-[32px]',
                  ]"
                />
              </template>
              <template #likerlandAppQRCodeIcon>
                <IconLikerLandAppQRCode
                  :class="[
                    'inline',
                    'w-[24px]',
                    'h-[24px]',
                  ]"
                />
              </template>
            </i18n>
          </Label>
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

  // eslint-disable-next-line class-methods-use-this
  get stepI18nKeys() {
    return [
      'ConnectLikerIdDialog.step.1',
      'ConnectLikerIdDialog.step.2',
      'ConnectLikerIdDialog.step.3',
    ]
  }

  handleDialogToggle(isOpened: boolean) {
    if (!isOpened) {
      this.setWalletConnectURI('')
    }
  }
}
</script>
