<template>
  <div class="flex flex-col mx-auto mt-[40px] w-min mb-[100px]">
    <Button
      :to="localeLocation({ name: 'index' })"
      preset="plain"
      tag="div"
      :text="$t('UploadForm.button.back')"
      class="text-dark-gray"
    >
      <template #prepend>
        <IconArrowLeft />
      </template>
    </Button>
    <Card
      :class="[
        'p-[32px]',
        'border-[2px]',
        'border-like-cyan',
      ]"
      :has-padding="false"
    >
      <!-- header -->
      <div class="flex flex-row items-start justify-between">
        <Label
          class="w-min"
          :text="$t('IscnUploaded.title')"
          tag="div"
          preset="p5"
          valign="middle"
          content-class="font-semibold whitespace-nowrap text-like-green"
          prepend-class="text-like-green"
        >
          <template #prepend>
            <IconDone />
          </template>
        </Label>
        <div class="flex flex-col items-end">
          <Stepper :step=4 />
          <Label preset="p6" text="Step 4/4" class="text-medium-gray" />
        </div>
      </div>
      <!-- guide title -->
      <Label
        :text="$t('IscnUploaded.guide.title')"
        class="text-medium-gray mt-[12px] mb-[28px]"
      />
      <!-- ISCN card -->
      <ClientOnly v-if="record">
        <IscnCard
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
      <div
        :class="[
          'flex',
          'justify-center',
        ]"
      >
        <Button
          :class="[
            'mt-[16px]',
            'mb-[28px]',
          ]"
          preset="secondary"
          :text="$t('IscnUploaded.button.new')"
          :to="localeLocation({ name: 'new' })"
        >
          <template #prepend>
            <IconAddToISCN class="w-[20px]" />
          </template>
        </Button>
      </div>
      <IconDiverMini class="mb-[24px]" />
      <div
        :class="[
          'flex',
          'items-start',
          'justify-between',
        ]"
      >
        <Label
          :class="[
            'w-min',
            'mb-[28px]',
          ]"
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
      <IconDiverMini class="mb-[12px]" />
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
        v-if="iscnHash"
        :label="$t('iscn.meta.transaction')"
        class="mb-[12px]"
      >
        <Link 
          class="text-[14px]"
          :href="transactionsURL"
        >
          {{ iscnHash }}
        </Link>
      </FormField>
      <IconDiverMini class="mb-[12px]" />
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
      <IconDiverMini class="mb-[24px]" />
      <FormField
        v-if="keywords"
        :label="$t('iscn.meta.tags.title')"
        class="mb-[12px]"
      >
        <Tag
          v-for="item in keywords"
          :key="item.key"
          :text="item"
          :class="[
            'mr-[8px]',
            'mb-[4px]',
          ]"
        />
      </FormField>
    </Card>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type'
import { BIG_DIPPER_TX_BASE_URL } from '~/constant'

const signerModule = namespace('signer')
const iscnModule = namespace('iscn')

@Component
export default class IscnUploadedInfo extends Vue {
  @Prop({ default: false }) readonly isImage!: boolean
  @Prop({ default: null }) readonly exifInfo: any | null | undefined
  @Prop(String) readonly ipfsHash!: string
  @Prop(String) readonly iscnId!: string
  @Prop(String) readonly iscnHash!: string

  @signerModule.Getter('getAddress') currentAddress!: string
  @iscnModule.Action queryISCNByAddress!: (
    arg0: string
  ) => ISCNRecordWithID[] | PromiseLike<ISCNRecordWithID[]>

  records: ISCNRecordWithID[] | null = null

  get record() {
    return this.records ? this.records[this.records.length - 1] : null
  }

  get name() {
    return this.record ? this.record.data.contentMetadata.name : ''
  }

  get description() {
    return this.record ? this.record.data.contentMetadata.description : ''
  }

  get isPhoto() {
    return this.exifInfo && this.exifInfo.ExifImageWidth
  }

  get type() {
    if (this.isPhoto) return 'Photo'
    if (this.isImage) return 'Image'
    return 'CreativeWork'
  }

  get ipfs() {
    return `ipfs://${this.ipfsHash}`
  }

  get transactionsURL() {
    return `${BIG_DIPPER_TX_BASE_URL}${this.iscnHash}`
  }

  get keywords() {
    return this.record ? this.record.data.contentMetadata.keywords : ''
  }

  get owner() {
    return this.currentAddress
  }

  get contentFingerprints() {
    return this.record ? this.record.data.contentFingerprints : ''
  }

  get recordTimestamp() {
    return this.record ? this.record.data.recordTimestamp : ''
  }

  async mounted() {
    this.records = await this.queryISCNByAddress(this.currentAddress)
  }
}
</script>
