<template>
  <div
    :class="[
      'flex',
      'flex-col',
      'items-center',
      'w-full',
    ]"
  >
    <img
      :class="['my-[32px]', 'w-[300px]']"
      src="/images/airdrop/title_Checker.png"
    />
    <div
      :class="[
        'flex',
        'flex-col',
        'items-center',
        'bg-light-gray',
        'pt-[24px]',
        'pb-[56px]',
        'px-[56px]',
        'w-full',
      ]"
    >
      <Label
        :class="['font-extrabold', 'text-like-green']"
        :text="$t('AirDrop.label.Comingsoon')"
        preset="h2"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator'

export default class AirdropPage extends Vue {}
</script>
