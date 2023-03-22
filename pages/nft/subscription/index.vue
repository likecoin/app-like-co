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
    <div v-if="isSubscriber">
      <Button @click="onSettings">
          Manage Subscription
      </Button>
    </div>
    <div v-else>
      <Button @click="onSubscribe">
          New Subscription
      </Button>
    </div>
  </Page>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { getNewSubscriptionApi } from '~/constant/api'

const subscriptionModule = namespace('subscription')
const walletModule = namespace('wallet')

@Component
export default class NFTSubscriptionPage extends Vue {
  @subscriptionModule.Getter('getAddressIsSubscriber') isSubscriber!: boolean
  @subscriptionModule.Action signSubscriptionPortal!: () => Promise<any>

  @walletModule.Getter('getWalletAddress') address!: string

  async onSubscribe() {
    const { data } = await this.$axios.post(getNewSubscriptionApi(this.address));
    window.location.href = data.url
  }

  async onSettings() {
    const { url } = await this.signSubscriptionPortal()
    if (url) window.location.href = url
  }
}
</script>
