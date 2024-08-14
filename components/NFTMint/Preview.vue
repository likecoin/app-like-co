<template>
  <div class="flex flex-col items-center gap-[12px]">
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
            <img v-if="imgSrc" class="w-full bg-black" :alt="name" :src="imgSrc" />
            <div v-else class="flex py-[60px] items-center justify-center bg-shade-gray">
              <img class="w-[30px]" :alt="$t('NFTPortal.errorMessage.noImage')" src="~assets/images/no-image.png" />
            </div>
            <Button
              v-if="isImageEdited"
              class="absolute right-3 top-3"
              preset="secondary"
              size="mini"
              :circle="true"
              @click="onResetImage"
            >
              <IconUndo />
            </Button>
            <Button
              v-else-if="!isShowEditImageToolbar"
              class="absolute right-3 top-3"
              preset="secondary"
              size="mini"
              :circle="true"
              @click="isShowEditImageToolbar = true"
            >
              <IconEdit />
            </Button>
            <template v-else>
              <Button
                class="absolute right-3 top-3"
                preset="secondary"
                size="mini"
                :circle="true"
                @click="openImagePicker"
              >
                <IconUploadMini />
              </Button>
            </template>
            <input
              ref="imagePicker"
              class="hidden"
              type="file"
              accept="image/*"
              @change="onEditImage"
            >
          </div>
          <div class="flex flex-col m-0 p-[16px] bg-shade-gray">
            <Label v-if="!isEditingName" preset="h5" :text="name">
              <template #append>
                <Button
                  preset="plain"
                  size="mini"
                  :circle="true"
                  @click="onClickEditName"
                >
                  <IconEdit />
                </Button>
              </template>
            </Label>
            <input
              v-else
              ref="nameInput"
              :value="name"
              @keydown="onEnterBlur"
              @blur="onInputName"
            />
            <Label v-if="!isEditingDescription" preset="p6" class="mt-[8px]">
              {{ (description || defaultDescription) | ellipsisDescription }}
              <template #append>
                <Button
                  preset="plain"
                  size="mini"
                  :circle="true"
                  @click="onClickEditDescription"
                >
                  <IconEdit />
                </Button>
              </template>
            </Label>
            <textarea
              v-else
              ref="descriptionInput"
              :value="description"
              @blur="onInputDescrption"
            />
          </div>
        </div>
      </div>
    </div>
    <div v-if="shouldShowNoUrlWarning" class=" bg-[#FCF1DC] px-[20px] py-[4px] rounded-[3px]">
      <i18n path="NFTPortal.errorMessage.metadata.noURL" class="text-[12px] text-[#fd8b4d]">
         <template #more>
            <a class="font-semibold underline" href="https://github.com/likecoin/iscn-specs/blob/master/schema/contentMetadata/README.md?plain=1#L54" target="_blank">{{ $t('NFTPortal.errorMessage.metadata.noURL.learnMore') }}</a>
         </template>
      </i18n>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

import { ellipsisDescription } from '~/utils/ui'

@Component({
  filters: { ellipsisDescription }})
export default class NFTMintPreview extends Vue {
  @Prop(String) readonly name!: string | undefined

  @Prop(String) readonly description!: string | undefined

  @Prop(String) readonly imgSrc!: string | undefined

  @Prop({ default: false }) readonly isLoading!: boolean | undefined

  @Prop({ default: false }) readonly shouldShowNoUrlWarning!: boolean | undefined

  isEditingName = false
  isEditingDescription = false
  isShowEditImageToolbar = false
  isImageEdited = false

  get defaultDescription() {
    return this.$t('NFTPortal.label.defaultDescription');
  }

  @Watch('imgSrc')
  onImgSrcChange() {
    this.isShowEditImageToolbar = false;
  }

  // eslint-disable-next-line class-methods-use-this
  onEnterBlur(e: any) {
    if (e.keyCode === 13) {
      e.target.blur();
    }
  }

  onClickEditName() {
    this.isEditingName = true
    this.$nuxt.$nextTick(() => (this.$refs.nameInput as HTMLInputElement)?.focus())
  }

  onClickEditDescription() {
    this.isEditingDescription = true;
    this.$nuxt.$nextTick(() => (this.$refs.descriptionInput as HTMLInputElement)?.focus())
  }

  onInputName(e: any) {
    this.$emit('edit-name', e.target?.value);
    this.isEditingName = false;
  }

  onInputDescrption(e: any) {
    this.$emit('edit-description', e.target?.value);
    this.isEditingDescription = false;
  }

  openImagePicker() {
    (this.$refs.imagePicker as HTMLBaseElement)?.click();
  }

  onResetImage() {
    this.$emit('reset-image');
    this.isImageEdited = false;
  }

  onEditImage(event: Event) {
    if (!event.target) return;
    const { files } = event.target as HTMLInputElement;
    if (files && files[0]) {
      const [file] = Object.values(files);
      this.$emit('edit-image', file);
      this.isImageEdited = true;
    }
  }
}
</script>
