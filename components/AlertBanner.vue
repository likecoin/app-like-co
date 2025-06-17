<template>
  <div
    v-if="isOpen"
    class="flex items-center p-[16px] pl-[24px] gap-[8px]"
    :style="{ backgroundImage: 'linear-gradient(78deg, #d2f0f0, #f0e6b4)' }"
  >
    <div
      class="flex flex-col lg:flex-row flex-grow items-center lg:justify-between gap-[16px]"
    >
      <div class="text-center lg:text-left">
        <slot />
      </div>

      <div
        v-if="primaryButtonText || secondaryButtonText"
        class="flex gap-[8px] flex-shrink-0"
      >
        <Button
          v-if="secondaryButtonText"
          preset="outline"
          :text="secondaryButtonText"
          :href="secondaryButtonHref"
          :to="secondaryButtonTo"
          @click.native="$emit('click-secondary-button', $event)"
        />
        <Button
          v-if="primaryButtonText"
          preset="secondary"
          :text="primaryButtonText"
          :href="primaryButtonHref"
          :to="primaryButtonTo"
          @click.native="$emit('click-primary-button', $event)"
        />
      </div>
    </div>

    <ButtonV2
      preset="plain"
      class="flex-shrink-0"
      size="mini"
      :circle="true"
      @click="handleClickCloseButton"
    >
      <IconClose />
    </ButtonV2>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class AlertBanner extends Vue {
  @Prop({ type: String, default: '' }) primaryButtonText!: string;
  @Prop({ type: String, default: '' }) primaryButtonHref!: string;
  @Prop({ type: Object, default: undefined }) primaryButtonTo!: object | undefined;
  @Prop({ type: String, default: '' }) secondaryButtonText!: string;
  @Prop({ type: String, default: '' }) secondaryButtonHref!: string;
  @Prop({ type: Object, default: undefined }) secondaryButtonTo!: object | undefined;

  isOpen: boolean = true;

  handleClickCloseButton(event: Event): void {
    this.isOpen = false;
    this.$emit('close', event);
  }
}
</script>