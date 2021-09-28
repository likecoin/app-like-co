<template>
  <Portal
    v-if="isOpen"
    to="dialog"
  >
    <div :class="rootClasses">
      <div
        :class="[
          'fixed',
          'inset-0',
          'bg-medium-gray',
          'bg-opacity-25',
          'backdrop-filter',
          'backdrop-blur-lg',
        ]"
        @click="close"
      />
      <div
        :class="[
          'fixed',
          'top-[15vh]',
        ]"
      >
        <Button
          :class="[
            'absolute',
            'z-1',
            'bottom-full',
            'mb-[8px]',
            'text-like-green',
            'bg-shade-gray',
            'shadow-popup',
          ]"
          preset="plain"
          :circle="true"
          @click="close"
        >
          <IconClose />
        </Button>
        <Card
          class="shadow-popup"
          :has-padding="hasPadding"
        >
          <template v-if="isBasic">
            <Label
              class="font-bold text-like-green"
              tag="header"
              preset="h5"
              align="left"
              :text="headerText"
            >
              <template v-if="$slots['header-prepend']" #prepend>
                <slot name="header-prepend" />
              </template>
            </Label>
            <div class="mt-[24px]">
              <template v-if="text">{{ text }}</template>
              <slot v-else />
            </div>
          </template>
          <slot v-else />
        </Card>
      </div>
    </div>
  </Portal>
</template>

<script lang="ts">
import { Vue, Component, Prop, ModelSync } from 'vue-property-decorator'

export enum DialogPreset {
  Basic = 'preset',
  Custom = 'custom',
}

@Component
export default class Dialog extends Vue {
  // Preset of the dialog.
  @Prop({ default: DialogPreset.Basic }) readonly preset!: DialogPreset

  // Vertically center the dialog.
  @Prop({ default: true }) readonly isVerticallyCenter!: boolean

  // Has padding around the dialog content.
  @Prop({ default: true }) readonly hasPadding!: boolean

  // Header text.
  @Prop({ default: '' }) readonly headerText!: string

  // Content text.
  @Prop({ default: '' }) readonly text!: string

  // Show/Hide dialog.
  @ModelSync('open', 'toggle', { type: Boolean, default: false }) isOpen!: boolean

  get isBasic() {
    return this.preset === DialogPreset.Basic
  }

  get isCustom() {
    return this.preset === DialogPreset.Custom
  }

  get rootClasses() {
    return [
      'absolute',
      'inset-x-0',
      'top-0',
      'flex',
      'justify-center',
      'min-h-screen',
      'px-[8px]',
      'py-[80px]',
      this.isVerticallyCenter ? 'items-center' : 'pt-[100px]',
    ]
  }

  close() {
    this.isOpen = false
  }
}
</script>
