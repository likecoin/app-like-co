<template>
  <div
    :class="[
      'flex',
      'flex-col',
      'justify-center',
      'items-center',
      'mx-auto',
      'p-[32px]',
      'border-2',
      'border-like-cyan',
      'bg-repeat-space',
      'rounded-[24px]',
      'overflow-hidden',
    ]"
    :style="{
      backgroundImage: `url(/images/NFT/background_cross.svg)`,
    }"
  >
    <Label
      preset="h5"
      class="bg-white text-like-green mb-[12px]"
      :text="$t('NFTPortal.label.preview')"
    >
      <template #prepend>
        <IconEye />
      </template>
    </Label>
    <div
      :class="[
        'flex',
        'flex-col',
        'justify-center',
        'items-center',
        'border-[1px]',
        'p-[16px]',
        'bg-white',
        'border-shade-gray',
        'rounded-[16px]',
      ]"
    >
      <div v-if="isLoading" class="w-full">
        <ProgressIndicator preset="thin" />
      </div>
      <div
        v-else
        :class="[
          'flex',
          'flex-col',
          'w-full',
          'rounded-[8px]',
          'overflow-hidden',
        ]"
      >
        <img alt="og image" :src="imgSrc" />
        <div class="flex flex-col m-0 p-[16px] bg-shade-gray">
          <Label preset="h5" :text="name" />
          <Label preset="p6" class="mt-[8px]">{{
            description | ellipsis
          }}</Label>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component({
  filters: {
    ellipsis(value: any) {
      const len: number = value.length
      const dots = '...'
      if (!value) return ''
      if (value.length > 50) {
        return value.substring(0, 40) + dots + value.substring(len - 5, len)
      }
      return value
    },
  },
})
export default class NFTPreviewCard extends Vue {
  @Prop(String) readonly name!: string | undefined

  @Prop(String) readonly description!: string | undefined

  @Prop(String) readonly imgSrc!: string | undefined

  @Prop({ default: false }) readonly isLoading!: boolean | undefined
}
</script>