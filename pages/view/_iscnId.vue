<template>
  <Page
    v-if="!record"
    class="justify-center"
  >
    <Card>
      <Label :text="$t('general.loading')" />
    </Card>
  </Page>
  <Page v-else>
    <div
      :class="[
        'container',
        'flex',
        'flex-row',
        'flex-nowrap',
        'items-start',
        'w-min',
        'mx-auto',
        'mt-[16px]',
        'mb-[30px]',
      ]"
    >
      <div class="mr-[32px]">
        <MetadataCard v-if="imgSrc" :img-src="imgSrc" />
      </div>
      <div>
        <InfoCard :label-text="type" :time-stamp="record.recordTimestamp">
          <template #icon>
            <ISCNTypeIcon :type="type" />
          </template>
          <FormField
            :label="$t('iscn.meta.name')"
            content-type="strong"
            class="mb-[12px]"
          >
            {{ metadata.name || metadata.title }}
          </FormField>
          <FormField :label="$t('iscn.meta.description')" class="mb-[12px]">
            {{ metadata.description }}
          </FormField>
          <FormField :label="$t('iscn.meta.id')" class="mb-[12px]">
            {{ iscnId }}
          </FormField>
          <FormField
            :label="$t('iscn.meta.content.fingerprints')"
            class="mb-[12px]"
          >
            <Link to="/">
              {{ contentFingerprintLink }}
              <IconNorthEast class="ml-[4px]" />
            </Link>
          </FormField>
          <FormField :label="$t('iscn.meta.tags.title')" class="mb-[12px]">
            <Tag v-for="item in keywordsArray" :key="item.key" :text="item" class="mr-[8px]" />
          </FormField>
        </InfoCard>
        <InfoCard :label-text="$t('iscn.meta.metadata.title')">
          <template #icon>
            <IconMetadata />
          </template>
          <FormField :label="$t('iscn.meta.owner')" class="mb-[12px]">
            <div class="font-normal text-[16px] leading-[22px]">
              {{ owner }}
            </div>
            <div class="font-semibold">
              {{ record.stakeholders[0].entity.name }}
            </div>
          </FormField>
          <FormField :label="$t('iscn.meta.version')" class="mb-[12px]">
            {{ metadata.version }}
          </FormField>
          <FormField :label="$t('iscn.meta.url')" class="mb-[12px]">
            <Link to="/">
              {{ metadata.url }}
              <IconNorthEast class="ml-[4px]" />
            </Link>
          </FormField>
          <FormField :label="$t('iscn.meta.usage.info')" class="mb-[12px]">
            <Link to="/">
              {{ metadata.usageInfo }}
              <IconNorthEast class="ml-[4px]" />
            </Link>
          </FormField>
        </InfoCard>
      </div>
    </div>
  </Page>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

import { isCosmosTransactionHash } from '~/utils/cosmos'
import { getIPFSUrlFromISCN } from '~/utils/cosmos/iscn/view'
import { parsedISCNRecord } from '~/utils/cosmos/iscn'
import { ISCN_PREFIX } from '~/constant'

const iscnModule = namespace('iscn')

export enum ErrorMessage {
  statusCode400 = 'not iscn id or tx hash',
  statusCode404 = 'iscn id not found',
}

@Component
export default class ViewIscnIdPage extends Vue {
  owner = ''
  iscnId = ''

  @iscnModule.Getter getISCNById!: (arg0: string) => parsedISCNRecord
  @iscnModule.Action fetchISCNById!: (arg0: string) => Promise<{
    records: parsedISCNRecord[]
    owner: string
    latestVersion: Long.Long
  } | null>

  @iscnModule.Action fetchISCNByTx!: (
    arg0: string
  ) => Promise<{ records: parsedISCNRecord[] }>

  get record() {
    return this.getISCNById(this.iscnId)?.data
  }

  get metadata() {
    return this.record && (this.record as any).contentMetadata
  }

  get type() {
    return this.metadata && this.metadata['@type']
  }

  get imgSrc() {
    return (
      (this.type === 'Image' || this.type === 'Photo') &&
      getIPFSUrlFromISCN(this.getISCNById(this.iscnId))
    )
  }

  get contentFingerprintLink() {
    return this.record.contentFingerprints.length > 1
      ? this.record.contentFingerprints[1].slice(7)
      : this.record.contentFingerprints[0].slice(7)
  }

  get keywordsArray(){
    return this.metadata.keywords.split(',');
  }

  created() {
    const { iscnId } = this.$route.params
    if (iscnId.startsWith(ISCN_PREFIX)) {
      this.iscnId = iscnId
    }
  }

  async mounted() {
    if (!this.iscnId) {
      const param = this.$route.params.iscnId
      if (!isCosmosTransactionHash(param)) {
        this.$nuxt.error({
          statusCode: 400,
          message: ErrorMessage.statusCode400,
        })
        return
      }
      const res = await this.fetchISCNByTx(param)
      if (!res) {
        this.$nuxt.error({
          statusCode: 400,
          message: ErrorMessage.statusCode400,
        })
        return
      }
      this.iscnId = res.records[0].id
      this.$router.replace({ params: { iscnId: this.iscnId } })
    }
    if (!this.getISCNById(this.iscnId) || !this.owner) {
      const res = await this.fetchISCNById(this.iscnId)
      if (res) this.owner = res.owner
    }
    if (!this.getISCNById(this.iscnId)) {
      this.$nuxt.error({ statusCode: 404, message: ErrorMessage.statusCode404 })
    }
  }
}
</script>
