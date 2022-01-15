<template>
  <RootLayout>
    <AppHeader />
    <Nuxt class="min-h-full" />
    <div
      :class="[
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'z-10',
        { 'lg:hidden': !isDesktopViewMode },
        { 'bg-white lg:bg-light-gray': $nuxt.$route.path.includes('airdrop') },
      ]"
    >
      <Button
        v-if="$nuxt.$route.path !== '/'"
        :class="[
          'mt-[16px]',
          'underline',
          'decoration-1',
        ]"
        preset="plain"
        text-preset="h5"
        :text="$t('AirDrop.button.homepage')"
        :to="localeLocation({ name: 'index' })"
      >
        <template #prepend>
          <IconArrowLeft class="w-[20px]" />
        </template>
      </Button>
      <Button
        :class="['mt-[26px]', 'text-medium-gray']"
        preset="outline"
        text-preset="h7"
        size="mini"
        :text="viewModeButtonText"
        @click="handleChangeViewModeButtonClick"
      />
    </div>
    <AppFooter />
  </RootLayout>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

const uiModule = namespace('ui')

@Component
export default class DefaultLayout extends Vue {
  @uiModule.Getter isDesktopViewMode!: boolean
  @uiModule.Action enableDesktopViewMode!: () => void
  @uiModule.Action enableMobileViewMode!: () => void

  get viewModeButtonText() {
    if (this.isDesktopViewMode) {
      return this.$t('HomePage.button.viewMode.mobile')
    }
    return this.$t('HomePage.button.viewMode.desktop')
  }

  handleChangeViewModeButtonClick() {
    if (this.isDesktopViewMode) {
      this.enableMobileViewMode()
    } else {
      this.enableDesktopViewMode()
    }
  }
}
</script>
