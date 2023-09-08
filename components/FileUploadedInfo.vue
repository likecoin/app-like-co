<template>
  <Card
    :class="[
      'p-[32px]',
      'border-[2px]',
      'border-like-cyan',
    ]"
    :has-padding="false"
  >
    <!-- header -->
    <IscnFormHeader :step="step" :total-step="4"/>
    <!-- guide title -->
    <Label
      :text="$t('FileUploaded.guide.title')"
      class="text-medium-gray mt-[12px] mb-[28px]"
    />

    <Divider class="mb-[12px]" />

    <FormField
      v-if="ipfsHash"
      :label="$t('iscn.meta.ipfsHash')"
      content-type="strong"
      class="mb-[12px]"
    >
      <a
        :href="`https://ipfs.io/ipfs/${ipfsHash}`"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ ipfsHash }}
      </a>
    </FormField>
    <FormField
      v-if="arweaveId"
      :label="$t('iscn.meta.arweaveId')"
      content-type="strong"
      class="mb-[12px]"
    >
      <a
        :href="`https://arweave.net/${arweaveId}`"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ arweaveId }}
      </a>
    </FormField>
  </Card>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class FileUploadedInfo extends Vue {
  @Prop(String) readonly ipfsHash!: string
  @Prop(String) readonly arweaveId!: string
  @Prop(Number) readonly step: number | undefined
}
</script>
