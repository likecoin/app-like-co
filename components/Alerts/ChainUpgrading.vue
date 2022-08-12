<template>
  <Dialog
    :open="isOpen"
    :has-close-button="false"
    :header-text="$t('ChainUpgrade.header')"
    @close="$emit('close')"
  >
    <div
      :class="[
        'text-left',
        'whitespace-pre-line',
        'leading-8',
        'pt-[18px]',
        'pb-[24px]',
      ]"
    >
      <i18n path="ChainUpgrade" tag="div">
        <template #announcement>
          <a
            v-t="`announcement`"
            :class="['underline', 'text-like-green', 'font-medium']"
            href="https://blog.like.co/likecoin-chain-upgrade-laichikok-overview/"
            target="_blank"
          />
        </template>
      </i18n>
    </div>
  </Dialog>
</template>
<script lang="ts">
import { Vue, Component, ModelSync } from 'vue-property-decorator'

@Component
export default class ChainUpgrading extends Vue {
  @ModelSync('open', 'toggle', { type: Boolean, default: false })
  isOpen!: boolean
}
</script>