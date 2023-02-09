<template>
  <div
    :class="[
      'w-full',
      'flex',
      'flex-col',
      'sm:flex-row',
      'items-center',
      'justify-center',
      'px-[44px]',
      'py-[32px]',
      'my-[16px]',
      'text-medium-gray',
    ]"
  >
    <IconAttention class="mr-[12px] w-[32px]" />
    <a
      :href="LIKER_LAND_APP_URI"
    >
      <Label
        class="whitespace-pre-line text-dark-gray underline"
        :text="$t('NFTPortal.attention.openApp')"
      >
        <template #prepend>
          <IconLikerLandApp :class="['inline', 'w-[32px]', 'h-[32px]']" />
        </template>
      </Label>
    </a>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { LIKER_LAND_APP_URI } from '~/constant';

@Component
export default class OpenLikerLandApp extends Vue {
  // eslint-disable-next-line class-methods-use-this
  get LIKER_LAND_APP_URI() {
    return LIKER_LAND_APP_URI;
  }
}
</script>
