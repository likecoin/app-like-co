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
        'mx-auto',
        'px-[16px]',
        'bg-white',
        'sm:px-[24px]',
        'lg:bg-gradient-to-b',
        'lg:from-white',
        'lg:to-light-gray',
        'lg:mt-[-100px]',
      ]"
    >
      <!-- backgroung images -->
      <img
        :class="[
          'hidden',
          'absolute',
          'z-[0]',
          'w-full',
          'top-[100px]',
          'max-w-[1280px]',

          'sm:block',
          'lg:top-[-50px]',
          '2xl:top-0',
          '2xl:max-w-[1440px]',
        ]"
        src="/images/airdrop/background.png"
      />
      <img
        :class="[
          'absolute',
          'z-[0]',
          'top-[100px]',
          'w-full',
          'sm:hidden',
        ]"
        src="/images/airdrop/background_sm.png"
      />
      <img
        :class="[
          'absolute',
          'z-[0]',
          'top-[150px]',
          'w-full',
          'max-w-[189px]',
          'sm:hidden',
        ]"
        src="/images/airdrop/title_LikeCoin.png"
      />
      <div
        :class="[
          'bg-no-repeat',
          'z-[5]',
          'w-full',
          'h-full',
          'lg:bg-repeat',
        ]"
        :style="{
          backgroundImage: `url(/images/airdrop/background_cross.svg)`,
        }"
      >
        <div
          :class="[
            'z-[5]',
            'relative',
            'flex',
            'flex-col',
            'items-center',
            'justify-center',
            'mx-auto',
            'mt-[180px]',
            'mb-[32px]',
            'box-border',
            'bg-white',
            'rounded-[24px]',
            'border-[2px]',
            'border-airdrop-gold',
            'sm:mt-[30%]',
            'lg:min-w-[936px]',
            'lg:max-w-[970px]',
            'lg:min-h-[300px]',
            'lg:mt-[300px]',
            '2xl:mt-[380px]',
          ]"
        >
          <!-- planet -->
          <img
            id="planet1"
            :class="[
              'hidden',
              'absolute',
              'top-[0px]',
              'translate-y-[-50%]',
              'right-[0]',
              'w-[30%]',
              'max-w-[340px]',
              'sm:block',
            ]"
            src="/images/airdrop/planet_1.png"
          />
          <img
            id="planet2"
            :class="[
              'hidden',
              'absolute',
              'top-[180px]',
              'left-[0]',
              'translate-x-[-80%]',
              'w-[30%]',
              'max-w-[276px]',
              'sm:block',
            ]"
            src="/images/airdrop/planet_2.png"
          />
          <div
            :class="[
              'overflow-hidden',
              'h-full',
              'w-full',
              'rounded-[24px]'
            ]"
          >
            <nuxt />
          </div>
        </div>

        <SubscriptionCard
          class="mb-[48px]"
          :preset="subscriptionCardPreset"
        />
        <Label
          v-if="!!shouldShowTentative"
          :class="[
            'text-center',
            'mb-[120px]',
            'w-full',
            'max-w-[800px]',
            'mx-auto',
            'text-medium-gray',
            'sm:mb-[120px]',
          ]"
          :text="$t('AirDrop.content.tentative')"
          preset="p5"
        />
      </div>
      <div
        :class="[
          'flex',
          'flex-col',
          'items-center',
          'justify-center',
          'z-10',
          'lg:hidden',
        ]"
      >
        <Button
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
          :class="[
            'mt-[26px]',
            'text-medium-gray',
          ]"
          preset="outline"
          text-preset="h7"
          size="mini"
          :text="$t('HomePage.button.desktop')"
        />
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
    return this.$route.name ===
      this.localeRoute({ name: 'airdrop-check' })?.name ||
      this.$route.name === this.localeRoute({ name: 'airdrop' })?.name
      ? 'community'
      : 'both'
  }

  get shouldShowTentative() {
    return (
      this.$route.name === this.localeRoute({ name: 'airdrop-check' })?.name
    )
  }
}
</script>
