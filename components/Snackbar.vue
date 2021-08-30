<template>
  <div :class="containerWrapperClasses">
    <Label
      class="w-min"
      :text="text"
      :content-class="contentWrapperClasses"
      :prepend-class="prependClass"
      :append-class="appendWrapperClasses"
      :preset="textPreset"
    >
      <template #prepend>
        <IconError v-if="isError" />
        <slot v-else name="prepend" />
      </template>
      <slot />
      <template #append>
        <IconClose />
      </template>
    </Label>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Snackbar extends Vue {

  // Inner text of the label
  @Prop(String) readonly text!: string

  // Switch to warning style if set to true
  @Prop(Boolean) readonly isError!: boolean

  // Class of the content wrapper
  @Prop([
    String,
    Array,
  ]) readonly contentClass!: string | [] | undefined

  // Class of the prepend wrapper
  @Prop([
    String,
    Array,
  ]) readonly prependClass!: string | [] | undefined

  // Class of the append wrapper
  @Prop([
    String,
    Array,
    ]) readonly appendClass!: string | [] | undefined

  // Preset of the label that affects the label style
  @Prop(String) readonly textPreset!: string | undefined

  get containerWrapperClasses(): any {
    return [
      'w-min',
      'pt-[18px]',
      'pb-[18px]',
      'pl-[24px]',
      'pr-[27px]',
      'rounded-[24px]',
      this.isError ? 'bg-red text-white' : 'bg-white',
    ]
  }

  get contentWrapperClasses(): any {
    return [
      'whitespace-nowrap',
      this.contentClass,
      ]
  }

  get appendWrapperClasses(): any {
    return [
      'ml-[50px]',
      'cursor-pointer',
      { 'text-like-green': !this.isError },
      this.appendClass,
    ]
  }
}
</script>
