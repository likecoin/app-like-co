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
        { 'bg-white lg:bg-light-gray': $route.path.includes('airdrop') },
      ]"
    >
      <Button
        v-if="$route.path !== '/'"
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
    </div>
    <AppFooter />
  </RootLayout>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class DefaultLayout extends Vue {}
</script>
