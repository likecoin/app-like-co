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