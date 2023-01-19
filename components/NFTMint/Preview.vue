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
        'w-full'
      ]"
    >
      <div v-if="isLoading">
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
        <div class="relative">
          <img v-if="imgSrc" :alt="name" :src="imgSrc" />
          <div v-else class="flex py-[60px] items-center justify-center bg-shade-gray">
            <img class="w-[30px]" :alt="$t('NFTPortal.errorMessage.noImage')" src="~assets/images/no-image.png" />
          </div>
          <button
            class="absolute right-3 bottom-3"
            @click="openImagePicker"
          >
            <IconEdit />
          </button>
          <input
            ref="imagePicker"
            class="hidden"
            type="file"
            accept="image/*"
            @change="onEditImage"
          >
        </div>
        <div class="flex flex-col m-0 p-[16px] bg-shade-gray">
          <Label preset="h5" :text="name" />
          <Label v-if="description" preset="p6" class="mt-[8px]">{{
            description | ellipsis
          }}</Label>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

import { ellipsisDescription } from '~/utils/ui'

@Component({
  filters: { ellipsisDescription }})
export default class NFTMintPreview extends Vue {
  @Prop(String) readonly name!: string | undefined

  @Prop(String) readonly description!: string | undefined

  @Prop(String) readonly imgSrc!: string | undefined

  @Prop({ default: false }) readonly isLoading!: boolean | undefined


  openImagePicker() {
    (this.$refs.imagePicker as HTMLBaseElement)?.click();
  }

  onEditImage(event: Event) {
    if (!event.target) return;
    const { files } = event.target as HTMLInputElement;
    if (files && files[0]) {
      const [file] = Object.values(files);
      this.$emit('edit-image', file);
    }
  }
}
</script>