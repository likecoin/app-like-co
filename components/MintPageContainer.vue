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
    <div
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
                href="https://forms.gle/dwhq6Dny3DnDUEzg9"
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
        <AttentionsOpenLikerLandApp v-if="isUsingLikerLandApp" />
        <AttentionsLedger v-if="!isUsingLikerLandApp" />
        <AlertsSignFailed />
      </div>
    </div>
  </Page>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

const walletModule = namespace('wallet')

@Component
export default class Min5PageContainer extends Vue {
  @walletModule.Getter('getType') walletType!: string | null

  get isUsingLikerLandApp() {
    return this.walletType === 'likerland_app'
  }
}
</script>