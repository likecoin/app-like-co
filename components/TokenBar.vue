<template>
  <div
    :class="[
      'flex',
      'flex-nowrap',
      'w-min',
    ]"
  >
    <Label
      :class="['whitespace-nowrap', 'mr-[24px]']"
      :text="$t('HomePage.label.getToken')"
      preset="h6"
    />
    <Button
      class="mr-[24px]"
      preset="tertiary"
      text-preset="h6"
      size="mini"
      href="https://app.osmosis.zone/"
      :text="$t('HomePage.button.osmosis')"
    />
    <Button
      class="mr-[24px]"
      preset="tertiary"
      text-preset="h6"
      size="mini"
      href="https://app.liquid.com/exchange/LIKEUSDT"
      :text="$t('HomePage.button.liquid')"
    />
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class TokenBar extends Vue {}
</script>
