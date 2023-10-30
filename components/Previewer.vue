<template>
  <div
    :class="[
      'flex',
      'justify-center',
      { 'w-[138px]': size === 'large' },
      { 'w-[48px]': size === 'small' },
      'mr-[16px]',
      'overflow-hidden'
    ]"
  >
    <img
      v-if="isImage"
      :class="[
        'w-full',
        'h-auto',
        'object-contain',
        'rounded-[8px]',
      ]"
      :src="fileData"
    />
    <IconFile v-else class="text-dark-gray" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Previewer extends Vue {
  @Prop({ default: false }) readonly isImage!: boolean
  @Prop(String) readonly fileData: string | undefined
  @Prop({ default: 'large' }) readonly size: string | undefined
}
</script>
