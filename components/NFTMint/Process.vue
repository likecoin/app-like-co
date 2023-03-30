<template>
  <div class="flex-col items-center justify-center mb-[32px]">

    <!-- Pending Text  -->
    <div class="flex flex-col items-center justify-center mb-[32px]">
      <Label
        v-if="hasError"
        :text="errorMessage ? errorMessage : $t('SearchPage.error')"
        class="w-full break-normal whitespace-normal text-red"
        align="center"
      >
        <template #prepend>
          <IconError class="w-[20px]" />
        </template>
      </Label>
      <Label
        v-else
        :class="[
          'text-medium-gray',
          { 'text-like-green': formattedStatusTitle === 'Completed!' },
          'font-600',
          'text-center',
          'mb-[12px]',
        ]"
        :preset="formattedStatusTitle === 'Completed!' ? 'h3' : 'h4'"
        align="center"
        :text="formattedStatusTitle"
      />
      <model-viewer
        v-if="nftModelUrl"
        :alt="$t('NFTPortal.label.modelViewer')"
        :src="nftModelUrl"
        class="mb-[12px]"
        auto-rotate
        auto-rotate-delay="500"
        xr-environment
        shadow-intensity="1"
        camera-controls
        camera-orbit="315deg 60deg 100m"
        @click.once="onClickModelViewer"
      />
    </div>

    <!-- Results -->
    <div :class="wrapperClasses">
      <Label :text="$t('NFTPortal.label.Iscn')" :class="labelClasses" />
      <NuxtLink
        :to="localeLocation({ name: 'view-iscnId', params: { iscnId: iscnId } })"
        target="_blank"
      >
        <Label class="underline text-like-green">
          {{ iscnId | ellipsis }}
          <template v-if="iscnId" #prepend>
            <IconCheck />
          </template>
        </Label>
      </NuxtLink>
    </div>

    <div :class="wrapperClasses">
      <Label :text="$t('NFTPortal.label.AR')" :class="labelClasses" />
      <Label :class="['text-medium-gray', { 'text-like-green': arId }]">
        {{ arIdStatusText | ellipsis }}
        <template #prepend>
          <IconCheck v-if="arId" />
          <IconEdit v-else-if="state === 'uploading'" />
        </template>
      </Label>
    </div>

    <div :class="wrapperClasses">
      <Label :text="$t('NFTPortal.label.classId')" :class="labelClasses" />
      <Label :class="['text-medium-gray', { 'text-like-green': classId }]">
        {{ classIdStatusText | ellipsis }}
        <template #prepend>
          <IconCheck v-if="classId" />
          <IconEdit v-else-if="state === 'creating'" />
        </template>
      </Label>
    </div>

    <div :class="wrapperClasses">
      <Label :text="$t('NFTPortal.label.mint')" :class="labelClasses" />
      <Label :class="['text-medium-gray', { 'text-like-green': !!nftLink }]">
        {{ nftIdStatusText | ellipsis }}
        <template #prepend>
          <IconCheck v-if="nftLink" />
          <IconEdit v-else-if="state === 'minting'" />
        </template>
      </Label>
    </div>

    <FormField v-if="nftLink" :label="$t('NFTPortal.label.iframe')">
      <div
        class="
          w-full
          bg-shade-gray
          px-[16px]
          py-[8px]
          rounded-[12px]
        "
      >
        {{ nftIframeCode }}
      </div>
    </FormField>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import logTrackerEvent from '~/utils/logger'
import { ellipsis } from '~/utils/ui'
import { IS_TESTNET } from '~/constant'

const walletModule = namespace('wallet')

export enum MintState {
  UPLOADING = 'uploading',
  CREATING = 'creating',
  MINTING = 'minting',
  DONE = ''
}

@Component({
  filters: { ellipsis }})
export default class UploadForm extends Vue {
  @walletModule.Getter('getType') walletType!: string | null

  @Prop(String) readonly iscnId!: string

  @Prop(String) readonly arId!: string

  @Prop(String) readonly classId!: string

  @Prop(String) readonly nftLink!: string

  @Prop(String) readonly nftModelUrl!: string

  @Prop(String) readonly txStatus!: string

  @Prop(String) readonly errorMessage!: string

  @Prop(String) readonly state!: MintState

  @Prop({ default: false }) readonly hasError!: boolean

  get arIdStatusText() {
    if (this.arId) return ` ar://${this.arId}`
    if (!this.arId && this.state === MintState.UPLOADING) return this.$t('NFTPortal.loadingMessage.preparing')
    return this.$t('NFTPortal.loadingMessage.wait')
  }

  get classIdStatusText() {
    if (this.classId) return this.classId
    if (!this.classId && this.state === MintState.CREATING) return this.$t('NFTPortal.loadingMessage.preparing')
    return this.$t('NFTPortal.loadingMessage.wait')
  }

  get nftIframeCode() {
    return `<iframe width="360" height="480" src=https://button.${IS_TESTNET ? 'rinkeby.' : ''}like.co/in/embed/nft?class_id=${this.classId}></iframe>`;
  }

  get nftIdStatusText() {
    if (this.nftLink) return this.$t('NFTPortal.url.loadingMessage.done')
    if (!this.nftLink && this.state === MintState.MINTING) return this.$t('NFTPortal.loadingMessage.preparing')
    return this.$t('NFTPortal.loadingMessage.wait')
  }

  get formattedStatusTitle() {
    switch (this.txStatus) {
      // the sign case is used when separating sign from broadcast
      case 'sign':
        switch (this.walletType) {
          case 'keplr':
          case 'keplr-mobile':
            return this.$t('NFTPortal.loadingMessage.keplr')

          case 'liker-id':
            return this.$t('NFTPortal.loadingMessage.likerId')

          case 'cosmostation':
            return this.$t('NFTPortal.loadingMessage.cosmostation')

          default:
            return undefined
        }
      case 'processing':
        return this.$t('NFTPortal.loadingMessage.processing')
      case 'completed':
        return this.$t('NFTPortal.loadingMessage.completed')
      default:
        return this.$t('NFTPortal.loadingMessage.processing')
    }
  }

  // eslint-disable-next-line class-methods-use-this
  get wrapperClasses() {
    return [
      'flex',
      'items-center',
      'gap-[32px]',
      'mb-[16px]',
    ]
  }

  // eslint-disable-next-line class-methods-use-this
  get labelClasses() {
    return [
      'text-medium-gray',
      '!text-[14px]',
      'w-[90px]',
    ]
  }

  onClickModelViewer() {
    logTrackerEvent(this, 'IscnMintNFT', 'ClickModelViewer', this.classId, 1);
  }
}
</script>
