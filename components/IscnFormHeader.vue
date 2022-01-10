<template>
  <div
    :class="[
      'flex',
      'flex-row',
      'items-start',
      'justify-between',
    ]"
  >
    <Label
      class="w-min"
      :text="$t('UploadForm.title.registerISCN')"
      tag="div"
      preset="p5"
      valign="middle"
      content-class="font-semibold whitespace-nowrap text-like-green"
      prepend-class="text-like-green"
    >
      <template #prepend>
        <IconRegister />
      </template>
    </Label>
    <div
      v-if="step"
      :class="[
        'flex',
        'flex-col',
        'items-end',
      ]"
    >
      <Stepper :step="step" />
      <Label
        preset="p6"
        :text="$t('Registration.step', { step: step, total: 4 })"
        class="text-medium-gray"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class IscnFormHeader extends Vue {
  @Prop(Number) readonly step: number | undefined
}
</script>
