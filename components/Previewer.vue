<template>
  <div class="flex justify-center w-[138px] max-h-[150px] mr-[16px]">
    <img v-if="isImage" class="object-contain rounded-[8px]" :src="fileData" />
    <IconFile v-else class="text-dark-gray" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Previewer extends Vue {
  @Prop({ default: false }) readonly isImage!: boolean
  @Prop(String) readonly fileData: string | undefined
}
</script>
