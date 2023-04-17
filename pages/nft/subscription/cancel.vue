<template>
  <Page :class="[
    'flex',
    'flex-col',
    'relative',
    'items-center',
    'justify-center',
    'px-[20px]',
    'pt-[38px]',
    'lg:p-[16px]',
  ]">
    Subscription Canceled
  </Page>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { SITE_URL } from '@/constant';

@Component
export default class NFTSubscriptionCacnel extends Vue {
  // eslint-disable-next-line class-methods-use-this
  mounted() {
    setTimeout(() => {
      window.location.href = `${SITE_URL}/nft/url`;
    }, 3000);
  }
}
</script>
