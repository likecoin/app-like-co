<template>
  <Page
    :class="[
      'relative',
      'justify-start',
      'items-center',
      'bg-light-gray',
      'mt-[-100px]',
      'pt-[100px]',
    ]"
  >
    <div
      :class="[
        'flex',
        'flex-col',
        'flex-grow',
        'items-center',
        'w-full',
        'mt-[-100px]',
        'mx-auto',
        'bg-gradient-to-b',
        'from-white',
        'to-light-gray',
      ]"
    >
      <img
        :class="[
          'absolute',
          'z-[0]',
          'max-w-[1440px]',
        ]"
        src="/images/airdrop/background.png"
      />
      <img
        id="planet1"
        :class="[
          'absolute',
          'top-[260px]',
          'right-[6%]',
          'z-[8]',
          'w-[340px]',
          'hidden',
          'lg:block'
        ]"
        src="/images/airdrop/planet_1.png"
      />
      <img
        id="planet2"
        :class="[
          'absolute',
          'top-[560px]',
          'left-[8%]',
          'z-[8]',
          'w-[276px]',
          'hidden',
          'lg:block'
        ]"
        src="/images/airdrop/planet_2.png"
      />
      <div
        :class="[
          'z-[5]',
          'w-full',
          'h-full',
          'bg-repeat'
        ]"
        :style="{
          backgroundImage: `url(/images/airdrop/background_cross.svg)`,
        }"
      >
        <div
          :class="[
            'z-[5]',
            'overflow-hidden',
            'flex',
            'flex-col',
            'items-center',
            'justify-center',
            'mx-auto',
            'mt-[380px]',
            'mb-[32px]',
            'min-w-[936px]',
            'max-w-[970px]',
            'min-h-[300px]',
            'box-border',
            'bg-white',
            'rounded-[24px]',
            'border-[2px]',
            'border-airdrop-gold',
          ]"
        >
          <nuxt />
        </div>

        <SubscriptionCard
          class="mb-[48px]"
          :preset="subscriptionCardPreset"
        />
        <Label
          v-if="!!shouldShowTentative"
          :class="[
            'text-center',
            'mb-[220px]',
            'w-[800px]',
            'mx-auto',
            'text-medium-gray'
          ]"
          :text="$t('AirDrop.content.tentative')"
          preset="p5"
        />

        <footer
          :class="[
            'absolute',
            'bottom-[24px]',
            'flex',
            'justify-between',
            'w-full',
            'px-[24px]',
          ]"
        >
          <InformationBar />
          <TokenBar />
        </footer>
      </div>
    </div>
  </Page>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
// eslint-disable-next-line import/no-extraneous-dependencies
import { MetaInfo } from 'vue-meta'
import { namespace } from 'vuex-class'

const signerModule = namespace('signer')

@Component({
  head() {
    const title = this.$t('page.airdrop.checker.title')
    return {
      title,
      meta: [
        {
          hid: 'og:image',
          property: 'og:image',
          content: 'https://app.like.co/images/og/airdrop.png',
        },
      ],
    } as MetaInfo
  },
})
export default class AirdropCheckPage extends Vue {
  @signerModule.Getter('getAddress') currentAddress!: string
  
  get subscriptionCardPreset() {
    return this.$route.name === this.localeRoute({ name: 'airdrop-check' })?.name
      ? 'community'
      : 'both'
  }

  get shouldShowTentative() {
    return (
      this.$route.name === this.localeRoute({ name: 'airdrop-check' })?.name &&
      this.currentAddress
    )
  }
}
</script>
