<template>
  <Page :class="['justify-start', 'bg-light-gray']">
    <!-- Container -->
    <div
      :class="[
        'mx-auto',
        'flex',
        'flex-col',
        'items-center',
        'min-w-[1440px]',
        'w-full',
        'h-full',
        'bg-gradient-to-b',
        'from-white',
        'to-light-gray',
        'mt-[-100px]',
      ]"
    >
      <img
        :class="[
          'absolute',
          'z-[0]',
          'min-w-[1440px]',
          'max-w-[1440px]',
        ]"
        src="/images/airdrop/background.png"
      />
      <img
        id="planet1"
        :class="[
          'absolute',
          'top-[260px]',
          'left-[60%]',
          'z-[8]',
          'w-[340px]',
        ]"
        src="/images/airdrop/planet_1.png"
      />
      <img
        id="planet2"
        :class="[
          'absolute',
          'top-[560px]',
          'left-[6%]',
          'z-[8]',
          'w-[276px]',
        ]"
        src="/images/airdrop/planet_2.png"
      />
      <div
        :class="[
          'relative',
          'z-[5]',
          'overflow-hidden',
          'flex flex-col',
          'items-center',
          'justify-center',
          'mx-auto',
          'mt-[380px]',
          'mb-[32px]',
          'min-w-[936px]',
          'max-w-[970px]',
          'box-border',
          'bg-white',
          'rounded-[24px]',
          'border-[2px]',
          'border-airdrop-gold',
        ]"
      >
        <AirdropMissions :address="claimmableAddress" />
      </div>
      <!-- follow LikeCoin -->
      <SubscriptionCard class="mb-[150px]" preset="both" />
      <!-- get tokens -->
      <div
        :class="[
          'flex',
          'w-full',
          'justify-between',
          'px-[24px]',
          'mb-[24px]'
        ]"
      >
        <InformationBar/>
        <TokenBar/>
      </div>
    </div>
  </Page>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

const signerModule = namespace('signer')

@Component({
  layout: 'wallet',
})
export default class AirdropMissionsPage extends Vue {
  @signerModule.Getter('getAddress') claimmableAddress!: string
}
</script>

<style>
@media only screen and (max-width: 1440px) {
  #planet1 {
    left: 880px
  }
  #planet2 {
    left: 30px
  }
}
</style>
