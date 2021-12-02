<template>
  <div
    :class="[
      'flex',
      'flex-col',
      'items-center',
      'border-[3px]',
      'border-airdrop-gold',
      'rounded-[24px]',
      'w-[300px]',
      'p-[32px]',
      'overflow-hidden',
    ]"
  >
    <img
      :class="[
        'absolute',
        'top-0',
        'h-full',
      ]"
      src="/images/airdrop/background_sm.png"
    />
    <div
      :class="[
        'flex',
        'flex-col',
        'items-center',
        'z-[2]',
      ]"
    >
      <img class="w-[190px]" src="/images/airdrop/title_LikeCoin.png" />
      <Label
        :class="[
          'text-dark-gray',
          'my-[24px]',
          'w-[240px]',
        ]"
        :text="$t('AirDrop.content.prelaunch')"
        preset="h5"
      />
      <Button
        :to="localeLocation({ name: 'airdrop' })"
        preset="secondary"
        :text="$t('AirDrop.button.claim')"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class AirdropInfoCard extends Vue {}
</script>
