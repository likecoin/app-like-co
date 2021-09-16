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
        <MetadataCard :img-src="imgSrc" class="w-[280px]" />
      </div>
      <div>
        <InfoCard :label-text="type" :time-stamp="record.recordTimestamp">
          <template #icon>
            <ISCNTypeIcon :type="type" />
          </template>
          <FormField
            v-if="name"
            :label="$t('iscn.meta.name')"
            content-type="strong"
            class="mb-[12px]"
          >
            {{ name }}
          </FormField>
          <FormField
            v-if="metadata.description"
            :label="$t('iscn.meta.description')"
            class="mb-[12px]"
          >
            {{ metadata.description }}
          </FormField>
          <FormField
            v-if="owner"
            :label="$t('iscn.meta.owner')"
            class="mb-[12px]"
          >
            <Label :text="owner" tag="div" preset="p6" />
          </FormField>
          <FormField :label="$t('iscn.meta.transaction')" class="mb-[12px]">
            <Link class="text-[14px]" :href="transactionsURL">
              {{ txHash }}
            </Link>
          </FormField>
          <IconDiverMini class="my-[12px]" />
          <FormField
            v-if="iscnId"
            :label="$t('iscn.meta.id')"
            class="mb-[12px]"
          >
            <Label :text="iscnId" tag="div" preset="p6" />
          </FormField>
          <FormField
            :label="$t('iscn.meta.content.fingerprints')"
            class="mb-[12px]"
          >
            <ContentFingerprintLink
              v-for="item in record.contentFingerprints"
              :key="item.key"
              :item="item"
              class="mb-[8px] break-all text-[14px]"
            />
          </FormField>
          <IconDiverMini class="my-[12px]" />
          <FormField :label="$t('iscn.meta.tags.title')" class="mb-[12px]">
            <Tag
              v-for="item in keywords"
              :key="item.key"
              :text="item"
              class="mr-[8px] mb-[4px]"
            />
          </FormField>
        </InfoCard>
        <InfoCard :label-text="$t('iscn.meta.metadata.title')">
          <template #icon>
            <IconMetadata />
          </template>
          <FormField
            :label="$t('iscn.meta.stakeholders')"
            class="mb-[12px]"
            content-classes="flex flex-row items-center"
          >
            <Button
              v-for="(stakeholder, index) in stakeholders"
              :key="stakeholder.key"
              class="mr-[8px]"
              size="mini"
              preset="secondary"
              tag="div"
              text-preset="h6"
              type="button"
              :text="stakeholders[index].entity.name"
              @click="showStakeholder(index)"
            />
          </FormField>
          <FormField
            v-if="metadata.version"
            :label="$t('iscn.meta.version')"
            class="mb-[12px]"
          >
            {{ metadata.version }}
          </FormField>
          <FormField
            v-if="metadata.url"
            :label="$t('iscn.meta.url')"
            class="mb-[12px]"
          >
            <Link class="text-[14px]" :href="metadata.url">
              {{ metadata.url }}
            </Link>
          </FormField>
          <FormField
            v-if="metadata.usageInfo"
            :label="$t('iscn.meta.usage.info')"
            class="mb-[12px]"
          >
            <Link class="text-[14px]" :href="metadata.usageInfo">
              {{ metadata.usageInfo }}
            </Link>
          </FormField>
          <Button
            class="w-min"
            preset="outline"
            tag="a"
            text-preset="h5"
            type="button"
            content-class="font-medium ml-[-4px]"
            prepend-class="font-bold"
            :href="rawDataURL"
          >
            <template #prepend>
              <IconInfo />
            </template>
            {{ $t('iscn.meta.rawData') }}
          </Button>
        </InfoCard>
        <!-- Dialog -->
        <Dialog
          v-model="isOpenAuthorDialog"
          :has-padding="false"
          preset="custom"
        >
          <Card class="flex flex-col w-[616px]">
            <Label
              class="w-min mb-[16px]"
              :text="$t('iscn.meta.stakeholders')"
              tag="div"
              preset="p5"
              valign="middle"
              content-class="font-semibold whitespace-nowrap text-like-green"
              prepend-class="text-like-green"
            >
              <template #prepend>
                <IconMetadata />
              </template>
            </Label>
            <!-- name -->
            <div class="flex flex-row items-center justify-between flex-nowrap">
              <FormField
                v-if="stakeholderInfo.authorName"
                content-type="strong"
                :label="$t('iscn.meta.creator.name')"
                class="w-[50%] my-[12px]"
              >
                <Label :text="stakeholderInfo.authorName" tag="div" preset="p4" />
              </FormField>
              <FormField
                v-if="stakeholderInfo.likerId"
                :label="$t('iscn.meta.stakeholders.likerId')"
                class="w-[50%] my-[12px]"
              >
                <Link :href="likerIdURL">{{
                  stakeholderInfo.likerId
                }}</Link>
              </FormField>
            </div>
            <FormField
              v-if="stakeholderInfo.authorDescription"
              :label="$t('iscn.meta.stakeholders.description')"
              class="w-[50%] my-[12px]"
            >
              <Label
                :text="stakeholderInfo.authorDescription"
                tag="div"
                preset="p5"
              />
            </FormField>
            <IconDiverMini class="my-[12px]" />
            <!-- url -->
            <FormField
              v-if="stakeholderInfo.authorUrl"
              :label="$t('iscn.meta.stakeholders.url')"
            >
              <Link
                v-for="url in stakeholderInfo.authorUrl"
                :key="url.key"
                :href="url"
                >{{ url }}</Link
              >
            </FormField>
            <IconDiverMini class="my-[12px]" />
            <!-- wallet address -->
            <FormField
              v-if="stakeholderInfo.authorWalletAddress"
              :label="$t('iscn.meta.stakeholders.wallet')"
              content-classes="flex flex-row"
              >
              <Button
                v-for="wallet in stakeholderInfo.authorWalletAddress"
                :key="wallet.address"
                class="mr-[8px] mb-[4px]"
                size="mini"
                preset="tertiary"
                tag="div"
                text-preset="h6"
                type="button"
                content-class="font-medium ml-[-4px]"
                prepend-class="font-bold"
              >
                <template #prepend>{{
                  wallet.type === 'cosmos'
                    ? $t('iscn.meta.stakeholders.wallet.LIKE')
                    : $t('iscn.meta.stakeholders.wallet.ETH')
                }}</template>
                {{ wallet.address | ellipsis }}
              </Button>
            </FormField>
          </Card>
        </Dialog>
        <Snackbar
          v-model="isOpenCopiedAlert"
          :text="$t('iscn.meta.stakeholders.wallet.copied')"
          preset="success"
          :timeout="2000"
        />
      </div>
    </div>
  </Page>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

import { isCosmosTransactionHash } from '~/utils/cosmos'
import { getIPFSUrlFromISCN } from '~/utils/cosmos/iscn'
import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type'
import {
  LIKER_LAND_URL,
  ISCN_PREFIX,
  BIG_DIPPER_TRANSACTIONS,
  ISCN_TX_RAW_DATA_ENDPOINT,
} from '~/constant'

const iscnModule = namespace('iscn')

export enum ErrorMessage {
  statusCode400 = 'not iscn id or tx hash',
  statusCode404 = 'iscn id not found',
}

@Component({
  filters: {
    ellipsis(value: any) {
      const len: number = value.length
      const dots = '...'
      if (!value) return ''
      if (value.length > 15) {
        return value.substring(0, 10) + dots + value.substring(len - 5, len)
      }
      return value
    },
  },
})
export default class ViewIscnIdPage extends Vue {
  owner = ''
  iscnId = ''
  txHash = ''
  url = ''
  isOpenAuthorDialog = false
  isOpenCopiedAlert = false
  stakeholderInfo = {
    authorWalletAddress: [],
    authorDescription: '',
    id: '',
    likerId: '',
    authorName: '',
    authorUrl: [],
  }

  @iscnModule.Getter getISCNById!: (arg0: string) => ISCNRecordWithID
  @iscnModule.Action fetchISCNById!: (arg0: string) => Promise<{
    records: ISCNRecordWithID[]
    owner: string
    latestVersion: Long.Long
  } | null>

  @iscnModule.Action fetchISCNByTx!: (
    arg0: string
  ) => Promise<{ records: ISCNRecordWithID[] }>

  created() {
    const { iscnId } = this.$route.params
    if (iscnId.startsWith(ISCN_PREFIX)) {
      this.iscnId = iscnId
    }
  }

  async mounted() {
    this.txHash = await this.fetchTxHash()
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

  get name() {
    return this.metadata.name || this.metadata.title
  }

  get keywords(): Array<string> {
    return this.metadata.keywords ? this.metadata.keywords.split(',') : []
  }

  get stakeholders() {
    return this.record.stakeholders
  }

  get likerIdURL() {
    return `${LIKER_LAND_URL}${this.stakeholderInfo.likerId}`
  }

  get transactionsURL() {
    return `${BIG_DIPPER_TRANSACTIONS}${this.txHash}`
  }

  get rawDataURL() {
    return `${ISCN_TX_RAW_DATA_ENDPOINT}${this.iscnId}`
  }

  async fetchTxHash() {
    const txHash = await this.$axios.get(`${ISCN_TX_RAW_DATA_ENDPOINT}${this.iscnId}`)
      .then((res) =>this.getTxHash(res.data.txs))
    return txHash
  }

  // eslint-disable-next-line class-methods-use-this
  getTxHash(item: any) {
    let txhash = ''
    item.forEach((element: any, i: any) => {
      element.logs.forEach((logs: any) => {
        logs.events.forEach((events: any) => {
          events.attributes.forEach((attributes: any) => {
            if (
              attributes.key === 'action' &&
              attributes.value === 'create_iscn_record'
            ) {
              txhash = item[i].txhash
            }
          })
        })
      })
    })
    return txhash
  }

  showStakeholder(index: number) {
    this.isOpenAuthorDialog = true
    this.stakeholderInfo.id = this.stakeholders[index].entity.id
    this.stakeholderInfo.likerId = this.stakeholders[index].entity.likerId
    this.stakeholderInfo.authorDescription =
      this.stakeholders[index].entity.authorDescription
    this.stakeholderInfo.authorWalletAddress =
      this.stakeholders[index].entity.authorWalletAddress
    this.stakeholderInfo.authorUrl = this.stakeholders[index].entity.url
    this.stakeholderInfo.authorName = this.stakeholders[index].entity.name
  }
}
</script>
