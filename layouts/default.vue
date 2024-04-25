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
        'lg:hidden',
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
export default class DefaultLayout extends Vue {
  // eslint-disable-next-line class-methods-use-this
  async mounted() {
    // Remove these if we use PWA again
    // Deregister service workers, delete all cache
    try {
      if (window.navigator && window.navigator.serviceWorker) {
        const registrations = await window.navigator.serviceWorker.getRegistrations();
        if (registrations?.length) {
          registrations.forEach(registration => {
            registration.unregister();
          });
        }
      }
      if (window.caches) {
        const keyList = await window.caches.keys();
        if (keyList?.length) {
          await Promise.all(keyList.map(key => caches.delete(key)));
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }
}
</script>
