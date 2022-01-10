<template>
  <RootLayout
    class="py-[40px]"
    bg-class="bg-like-green"
  >
    <!--
      TODO: Set AppHeader to hidden for now, need to refactor logic
      from AppHeader to RootLayout or other ghost component
    -->
    <AppHeader class="hidden" />
    <Nuxt />
  </RootLayout>
</template>
