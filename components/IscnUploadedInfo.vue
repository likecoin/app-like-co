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
        :text="$t('IscnUploaded.guide.title')"
        class="text-medium-gray mt-[12px] mb-[28px]"
      />
      <!-- ISCN card -->
      <ClientOnly v-if="record">
        <LazyIscnCard
          class="mb-[16px]"
          :record="record"
          :is-animated="true"
          orientation="landscape"
        />
      </ClientOnly>
      <!--
      <div class="flex flex-row justify-center items-center my-[16px]">
        <Button circle size="small" preset="tertiary" class="mx-[8px]">
          <IconUploadMini />
        </Button>
        <Button circle size="small" preset="tertiary" class="mx-[8px]">
          <IconDownload />
        </Button>
        <Button circle size="small" preset="tertiary" class="mx-[8px]">
          <IconShare />
        </Button>
      </div>
      -->
      <slot name="card-footer" />
      <Divider class="mb-[24px]" />
      <div
        :class="[
          'sm:flex',
          'items-start',
          'justify-between',
          'mb-[28px]',
        ]"
      >
        <Label
          :text="type"
          tag="div"
          preset="p5"
          content-class="font-semibold whitespace-nowrap text-like-green"
          prepend-class="text-like-green"
        >
          <template #prepend>
            <ISCNTypeIcon :type="type" />
          </template>
        </Label>
        <Label
          :text="recordTimestamp"
          :class="[
            'mt-[8px]',
            'sm:mt-0',
          ]"
          tag="div"
          preset="p6"
          content-class="text-medium-gray"
        />
      </div>
      <FormField
        v-if="name"
        :label="$t('iscn.meta.name')"
        content-type="strong"
        class="mb-[12px]"
      >
        {{ name }}
      </FormField>
      <FormField
        v-if="description"
        :label="$t('iscn.meta.description')"
        class="mb-[12px]"
      >
        {{ description }}
      </FormField>
      <Divider class="mb-[12px]" />
      <FormField
        v-if="owner"
        :label="$t('iscn.meta.owner')"
        :class="[
          'mb-[12px]',
          'text-[14px]',
        ]"
      >
        {{ owner }}
      </FormField>
      <FormField
        :label="$t('iscn.meta.transaction')"
        class="mb-[12px]"
      >
        <Link
          v-if="iscnHash"
          :class="[
            'text-[14px]',
            'break-all',
          ]"
          :href="transactionsURL"
        >
          {{ iscnHash }}
        </Link>
        <ProgressIndicator
          v-else
          class="my-[4px]"
          preset="thin"
        />
      </FormField>
      <IconDiverMini
        :class="[
          'mb-[12px]',
          'text-shade-gray',
        ]"
      />
      <FormField
        v-if="iscnId"
        :label="$t('iscn.meta.id')"
        :class="[
          'mb-[12px]',
          'text-[14px]',
        ]"
      >
        <Link
          :to="localeLocation({
            name: 'view-iscnId',
            params: { iscnId: iscnId },
          })"
          class="text-[14px]"
        >
          {{ iscnId }}
        </Link>
      </FormField>
      <FormField
        v-if="contentFingerprints"
        :label="$t('iscn.meta.content.fingerprints')"
        class="mb-[12px]"
      >
        <ContentFingerprintLink
          v-for="item in contentFingerprints"
          :key="item.key"
          :item="item"
          :class="[
            'mb-[8px]',
            'break-all',
            'text-[14px]',
          ]"
        />
      </FormField>
      <Divider class="mb-[24px]" />
      <FormField
        v-if="keywords"
        :label="$t('iscn.meta.tags.title')"
        class="mb-[12px]"
      >
        <Keyword
          v-for="item in keywords"
          :key="item.key"
          :keyword="item"
          :class="[
            'mr-[8px]',
            'mb-[4px]',
          ]"
        />
      </FormField>
      <slot name="footer" />
    </Card>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type'
import { BIG_DIPPER_TX_BASE_URL } from '~/constant'

@Component
export default class IscnUploadedInfo extends Vue {
  @Prop(String) readonly owner!: string
  @Prop(String) readonly iscnId!: string
  @Prop(String) readonly iscnHash!: string
  @Prop({ default: null }) readonly record: ISCNRecordWithID | null | undefined
  @Prop({ default: null }) readonly exifInfo: any | null | undefined
  @Prop(Number) readonly step: number | undefined

  get recordData() {
    return this.record?.data
  }

  get metadata() {
    return this.recordData?.contentMetadata
  }

  get type() {
    return this.metadata && this.metadata['@type']
  }

  get name() {
    return this.metadata?.name || this.metadata?.title
  }

  get description() {
    return this.metadata?.description || ''
  }

  get transactionsURL() {
    return `${BIG_DIPPER_TX_BASE_URL}${this.iscnHash}`
  }

  get keywords(): Array<string> {
    return this.metadata?.keywords.split(',') || []
  }

  get contentFingerprints() {
    return this.recordData?.contentFingerprints || ''
  }

  get recordTimestamp() {
    return this.recordData?.recordTimestamp || ''
  }
}
</script>
