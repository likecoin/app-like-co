<template>
  <Dialog
    :open="isOpen"
    :has-close-button="false"
    @close="$emit('close')"
  >
    <div
      :class="[
        'flex',
        'flex-col',
        'justify-center',
        'items-start',
        'w-full',
        'max-w-[600px]',
      ]"
    >
      <Label
        preset="h4"
        :class="['text-like-green']"
        :text="$t('AirDrop.label.warningMessage.title')"
      />

      <Label
        preset="h5"
        :class="['whitespace-pre-line', 'mt-[36px]', 'text-dark-gray']"
        :text="$t('AirDrop.label.warningMessage.tips')"
      >
        <template #prepend>
          <IconAttention />
        </template>
      </Label>

      <Label
        preset="p5"
        :class="['whitespace-pre-line', 'mt-[12px]', 'text-dark-gray']"
        :text="$t('AirDrop.label.warningMessage.tip1')"
      >
        <template #prepend>
          <IconDot />
        </template>
      </Label>

      <Label
        preset="p5"
        :class="['whitespace-pre-line', 'mt-[8px]', 'text-dark-gray']"
        :text="$t('AirDrop.label.warningMessage.tip2')"
      >
        <template #prepend>
          <IconDot />
        </template>
      </Label>

      <Label
        preset="p5"
        :class="[
          'whitespace-pre-line',
          'leading-[24px]',
          'mt-[24px]',
          'text-dark-gray',
        ]"
      >
        <i18n path="AirDrop.label.warningMessage.help" tag="div">
          <template #discord>
            <a
              v-t="$t('AirDrop.label.discord')"
              :class="['underline', 'text-like-green', 'font-medium']"
              href="http://discord.gg/likecoin"
              target="_blank"
            />
          </template>
          <template #doc>
            <a
              v-t="$t('AirDrop.label.here')"
              :class="['underline', 'text-like-green', 'font-medium']"
              href="https://docs.like.co/airdrop"
              target="_blank"
            />
          </template>
        </i18n>
      </Label>
    </div>
    <div :class="['w-full', 'flex', 'justify-center', 'mt-[48px]']">
      <Button
        preset="gradient"
        :text="$t('AirDrop.button.backClaim')"
        @click="$emit('close')"
      />
    </div>
  </Dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class AirdropEntryDialog extends Vue {
  // Show/Hide dialog.
  @Prop({ default: false }) readonly isOpen!: boolean
}
</script>
