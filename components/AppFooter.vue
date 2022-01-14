<template>
  <footer
    :class="[
      'flex',
      'justify-between',
      'w-full',
      'px-[24px]',
      'pb-[24px]',
      { 'bg-white' : $nuxt.$route.path.includes('airdrop') },
      'lg:bg-light-gray',
      'lg:mt-[30px]',
    ]"
  >
    <InformationBar />
    <TokenBar
      :class="[
        'hidden',
        'lg:flex',
      ]"
    />
  </footer>
</template>
