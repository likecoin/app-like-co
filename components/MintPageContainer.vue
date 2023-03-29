<template>
  <Page
    :class="[
      'flex',
      'flex-col',
      'relative',
      'items-center',
      'justify-center',
      'px-[20px]',
      'pt-[38px]',
      'lg:p-[16px]',
    ]"
  >
    <!-- Email block -->
    <div
      v-if="!hasSubmittedEmail"
      :class="[
        'flex',
        'items-start',
        'justify-start',
        'gap-[8px]',
        'px-[12px]',
        'py-[8px]',
        'bg-[#f1fbff]',
        'border-[1px]',
        'border-[#caedff]',
        'rounded-[12px]',
        'mb-[24px]',
        'w-full',
        'max-w-[600px]',
      ]"
    >
      <IconAttention class="flex-shrink-0 text-[#a9d3e2]" />
      <div class="flex flex-col">
        <Label preset="p6" class="whitespace-pre-line">
          <i18n path="NFTPortal.label.input.email" tag="div">
            <template #link>
              <a
                v-t="$t('NFTPortal.label.input.link')"
                :class="['underline', 'text-like-green']"
                :href="googleFormUrl"
                target="_blank"
              />
            </template>
          </i18n>
        </Label>
      </div>
    </div>
    <slot />
    <div class="flex flex-col max-w-[600px]">
      <div class="mt-[-20px]">
        <AttentionsOpenLikerLandApp v-if="isUsingLikerLandApp && isStateTransaction" />
        <AttentionsLedger v-if="!isUsingLikerLandApp" />
        <AlertsSignFailed />
      </div>
    </div>
  </Page>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

const walletModule = namespace('wallet')

@Component
export default class Min5PageContainer extends Vue {
  @walletModule.Getter('getType') walletType!: string | null
  @walletModule.Getter('getHasSubmittedEmail') hasSubmittedEmail!: string | null
  @walletModule.Getter('getWalletAddress') address!: string | null

  @Prop({ default: false }) readonly isStateTransaction: boolean | undefined


  get isUsingLikerLandApp() {
    return this.walletType === 'likerland_app'
  }

  get googleFormUrl() {
    return `https://docs.google.com/forms/d/e/1FAIpQLSeS_mRGIh_aQxyeBizA092DN9TJSavNbXr7XTZayMluwU4PAA/viewform?usp=pp_url&entry.1671031518=${this.address}`
  }
}
</script>