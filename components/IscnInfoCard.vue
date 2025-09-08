<template>
  <div
    :class="[
      'flex',
      'items-center',
      'w-[696px]',
      'rounded-[24px]',
      'bg-like-green',
      'ml-[32px]',
      'relative',
      'overflow-hidden',
    ]"
  >
    <img
      :class="[
        'absolute',
        'top-0',
        'w-full',
        'h-full',
        'z-0',
        'object-cover',
      ]"
      loading='lazy'
      src="/images/airdrop/image.png"
    />
    <div
      :class="[
        'flex',
        'items-center',
        'h-full',
        'p-[32px]',
      ]"
    >
      <div :class="['flex', 'flex-col']">
        <Label
          :text="$t('HomePage.label.register')"
          preset="h1"
          :class="[
            'text-transparent',
            'font-bold',
            'font-display',
            'bg-gradient-to-r',
            'from-[#D2F0F0]',
            'to-[#F0E6B4]',
            'bg-clip-text',
            'mb-[8px]'
          ]"
        />
        <Label
          :text="$t('HomePage.content.register')"
          preset="h4"
          class="text-white"
        />
        <div
          :class="[
            'grid',
            'grid-cols-2',
            'gap-x-[24px]',
            'gap-y-[24px]',
            'my-[44px]',
          ]"
        >
          <div v-for="item in contentTypes" :key="item">
            <Label
              :text="item"
              :class="['text-like-cyan', 'w-max']"
              preset="h5"
            >
              <template #prepend>
                <IconDone />
              </template>
            </Label>
          </div>
        </div>
        <div
          :class="[
            'flex',
            'flex-wrap',
            'gap-[8px]',
          ]"
        >
          <Button
            :text="$t('HomePage.button.learnmore')"
            preset="outline"
            :class="['!text-like-cyan-light', 'w-max','z-10',]"
            :style="{ border: '2px solid #AAF1E7' }"
            href="https://docs.like.co/developer/international-standard-content-number-iscn"
          >
            <template #append>
              <IconOpenInNew class="w-[12px]" />
            </template>
          </Button>
          <Button
            :text="$t('HomePage.button.writingNft')"
            preset="outline"
            :class="['!text-like-cyan-light', 'w-max','z-10',]"
            :style="{ border: '2px solid #AAF1E7' }"
            href="https://liker.land"
          >
            <template #append>
              <IconOpenInNew class="w-[12px]" />
            </template>
          </Button>
        </div>
      </div>
      <div class="ml-[76px] z-10">
        <div
          :class="[
            'p-[8px]',
            'border-[1px]',
            'border-white',
            'rounded-[20px]',
            'my-[12px]'
          ]"
        >
          <Button
            preset="primary"
            :text="$t('HomePage.register.button')"
            :to="localeLocation({ name: 'new' })"
            class="text-like-green"
            :style="{ backgroundColor: '#AAF1E7', color: '#28646E' }"
          >
            <template #prepend>
              <IconAddToISCN class="w-[20px]" />
            </template>
            <template #append>
              <IconArrowRight class="w-[20px]" />
            </template>
          </Button>
        </div>
        <div
          :class="[
            'p-[8px]',
            'my-[12px]'
          ]"
        >
        <!-- hidden for now -->
          <Button
            class="hidden"
            preset="primary"
            :text="$t('HomePage.button.nftPortal')"
            :to="localeLocation({ name: 'nft-url' })"
            :style="{ color: '#FFFFFF', backgroundColor: '#C69F67' }"
          >
            <template #prepend>
              <IconAddToISCN class="w-[20px]" />
            </template>
            <template #append>
              <IconArrowRight class="w-[20px]" />
            </template>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class IscnInfoCard extends Vue {
  contentTypes = [
    'Photos',
    'PDF',
    'Articles',
    'Pictures',
    'Text',
    'Creative works',
  ]
}
</script>
