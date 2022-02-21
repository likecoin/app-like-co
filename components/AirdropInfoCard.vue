<template>
  <div
    :class="[
      'flex',
      'flex-col',
      'relative',
      'items-center',
      'rounded-[24px]',
      'p-[32px]',
      'pb-[40px]',
      'overflow-hidden',
    ]"
  >
    <img
      :class="[
        'absolute',
        'top-0',
        'w-full',
        'h-full',
        'object-cover'
      ]"
      src="/images/airdrop/background_sm.png"
    />
    <div
      :class="[
        'flex',
        'flex-col',
        'items-center',
        'z-[2]',
        'h-full',
        'justify-between'
      ]"
    >
      <img class="w-[190px]" src="/images/airdrop/title_LikeCoin.png" />
      <Label
        :class="[
          'text-dark-gray',
          'my-[34px]',
        ]"
        :text="$t('AirDrop.content.prelaunch')"
        preset="h5"
      />
      <Button
        :to="localeLocation({ name: 'airdrop' })"
        preset="outline"
        :text="$t('AirDrop.button.claim')"
        :style="{ border: '2px solid #D1AB79', color: '#D1AB79' }"
      >
        <template #prepend>
          <IconClaim />
        </template>
      </Button>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class AirdropInfoCard extends Vue {}
</script>
