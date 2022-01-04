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
        <ClientOnly>
          <LazyIscnCard
            :key="record.id"
            class="w-[280px]"
            :record="record"
            orientation="portrait"
            :is-animated="true"
          />
        </ClientOnly>
        <MetadataCard
          v-if="metadata.exifInfo"
          :img-src="imgSrc"
          :filtered-exif="exifInfo"
          :class="[
            'w-[280px]',
            'mt-[16px]',
          ]"
        />
      </div>
      <div>
        <InfoCard :label-text="type" :time-stamp="recordData.recordTimestamp">
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
            <Link
              :class="[
                'text-[14px]',
                'break-all',
              ]"
              :href="transactionsURL">
              {{ txHash }}
            </Link>
          </FormField>
          <Divider class="my-[12px]" />
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
              v-for="item in recordData.contentFingerprints"
              :key="item.key"
              :item="item"
              class="mb-[8px] break-all text-[14px]"
            />
          </FormField>
          <Divider class="my-[12px]" />
          <FormField
            v-if="keywords.length"
            :label="$t('iscn.meta.tags.title')"
            class="mb-[12px]"
          >
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
              :text="(stakeholders[index].entity || {}).name"
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
            <Link
              :class="[
                'text-[14px]',
                'break-all',
              ]"
              :href="metadata.url"
            >
              {{ metadata.url }}
            </Link>
          </FormField>
          <FormField
            v-if="metadata.usageInfo"
            :label="$t('iscn.meta.usage.info')"
            class="mb-[12px]"
          >
            <Link
              :class="[
                'text-[14px]',
                'break-all',
              ]"
              :href="metadata.usageInfo"
            >
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
                <Link :href="stakeholderInfo.likerId">{{
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
            <Divider
              v-if="stakeholderInfo.authorUrls.length"
              class="my-[12px]"
            />
            <!-- url -->
            <FormField
              v-if="stakeholderInfo.authorUrls.length"
              :label="$t('iscn.meta.stakeholders.url')"
            >
              <Link
                v-for="url in stakeholderInfo.authorUrls"
                :key="url"
                :href="url"
                class="break-all"
                >{{ url }}</Link
              >
            </FormField>
            <Divider
              v-if="stakeholderInfo.authorWalletAddresses.length"
              class="my-[12px]"
            />
            <!-- wallet address -->
            <FormField
              v-if="stakeholderInfo.authorWalletAddresses.length"
              :label="$t('iscn.meta.stakeholders.wallet')"
              content-classes="flex flex-row"
            >
              <Button
                v-for="wallet in stakeholderInfo.authorWalletAddresses"
                :key="wallet.address"
                class="mr-[8px] mb-[4px]"
                size="mini"
                preset="tertiary"
                tag="div"
                text-preset="h6"
                type="button"
                content-class="font-medium ml-[-4px]"
                prepend-class="font-bold"
                @click="handleCopy(wallet.address, wallet.type)"
              >
                <IconCoin
                  class="mr-[4px]"
                  :type="wallet.type"
                />
                {{
                  wallet.type === 'cosmos'
                    ? wallet.address.replace(/(did:|:)/g, '')
                    : wallet.address.split(`did:${wallet.type}:`).join('') | ellipsis
                }}
              </Button>
            </FormField>
          </Card>
        </Dialog>
        <Snackbar
          v-model="isOpenCopiedAlert"
          :text="$t('iscn.meta.stakeholders.wallet.copied')"
          preset="success"
          :timeout="2000"
        >
          <template #prepend>
            <IconDone/>
          </template>
        </Snackbar>
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
  ISCN_PREFIX,
  BIG_DIPPER_TX_BASE_URL,
  ISCN_RAW_DATA_ENDPOINT,
  ISCN_TX_RAW_DATA_ENDPOINT,
  WALLET_TYPE_REPLACER,
} from '~/constant'
import { logTrackerEvent } from '~/utils/logger';

const iscnModule = namespace('iscn')

export enum ErrorMessage {
  statusCode400 = 'not iscn id or tx hash',
  statusCode404 = 'iscn id not found',
}

export enum ExifList {
  artist = 'artist',
  camera = 'camera',
  date = 'date',
  exposure = 'exposure',
  flash = 'flash',
  format = 'format',
  lens = 'lens',
  size = 'size',
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
  exifInfo = {}
  stakeholderInfo = {
    authorWalletAddresses: [],
    authorDescription: '',
    likerId: '',
    authorName: '',
    authorUrls: [],
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

  get record() {
    return this.getISCNById(this.iscnId)
  }

  get recordData() {
    return this.record?.data
  }

  get metadata() {
    return this.recordData && this.recordData.contentMetadata
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
    return this.recordData.stakeholders
  }

  get transactionsURL() {
    return `${BIG_DIPPER_TX_BASE_URL}${this.txHash}`
  }

  get rawDataURL() {
    return `${ISCN_RAW_DATA_ENDPOINT}${this.iscnId}`
  }

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
    this.exifInfo = this.showExifInfo()
  }

  async fetchTxHash() {
    const res = await this.$axios.get(
      `${ISCN_TX_RAW_DATA_ENDPOINT}${this.iscnId}`,
    )
    const txHash = this.getTxHash(res.data.txs)
    return txHash
  }

  showExifInfo() {
    logTrackerEvent(this, 'ISCNView', 'ShowExifInfo', this.iscnId, 1);
    const { exifInfo } = this.metadata
    let exif
    if (exifInfo) {
      exif = {
        [ExifList.format]: exifInfo.Format,
        [ExifList.artist]: exifInfo.Artist,
        [ExifList.camera]:
          exifInfo.Make && exifInfo.Model
            ? `${exifInfo.Make} ${exifInfo.Model}`
            : undefined,
        [ExifList.lens]:
          exifInfo.LensMake && exifInfo.LensModel
            ? `${exifInfo.LensMake} ${exifInfo.LensModel}`
            : undefined,
        [ExifList.exposure]:
          exifInfo.ExposureProgram &&
          exifInfo.ExposureTime &&
          exifInfo.FNumber &&
          exifInfo.ISO
            ? `${exifInfo.ExposureProgram}, 1/${(
                1 / exifInfo.ExposureTime
              ).toFixed(0)} s, f/${exifInfo.FNumber.toFixed(1)}, ISO ${
                exifInfo.ISO
              }`
            : undefined,
        [ExifList.flash]: exifInfo.Flash,
        [ExifList.date]: exifInfo.CreateDate,
        [ExifList.size]: exifInfo.Size,
      }
      exif = JSON.parse(JSON.stringify(exif))
    }
    return exif
  }

  // eslint-disable-next-line class-methods-use-this
  getTxHash(items: any) {
    const targetItem = items.find((item: any) =>
      item.logs.find((log: any) =>
        log.events.find((event: any) =>
          event.attributes.some(
            (attribute: any) =>
              attribute.key === 'action' &&
              attribute.value === 'create_iscn_record',
          ),
        ),
      ),
    )
    return targetItem ? targetItem.txhash : undefined
  }

  showStakeholder(index: number) {
    logTrackerEvent(this, 'ISCNView', 'ShowStakeholder', this.iscnId, 1);
    this.isOpenAuthorDialog = true
    const stakeholders = this.stakeholders[index].entity

    if (this.stakeholders[index].entity?.identifier) {
      const { description: authorDescription, name: authorName } = stakeholders
      const likerId = stakeholders!.url.includes('like.co')
        ? stakeholders.url.slice(16)
        : ''
      const authorWalletAddresses = stakeholders.identifier.map((a: any) => ({
        address: a.value,
        type: this.getKeyByValue(WALLET_TYPE_REPLACER, a.propertyID),
      }))
      const authorUrls = stakeholders.sameAs
      this.stakeholderInfo = {
        likerId,
        authorDescription,
        authorWalletAddresses,
        authorUrls,
        authorName,
      }
    } else {
      const authorWalletAddresses: any = []
      if (stakeholders['@id']) {
        authorWalletAddresses.push({
          type: 'cosmos',
          address: stakeholders['@id'],
        })
      }
      const authorUrls: any = []
      if (stakeholders.url) {
        authorUrls.push(stakeholders.url)
      }
      this.stakeholderInfo = {
        likerId: '',
        authorDescription: '',
        authorWalletAddresses,
        authorUrls,
        authorName: stakeholders.name,
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getKeyByValue(object: any, value: string) {
    return Object.keys(object).find((key) => object[key] === value)
  }

  // eslint-disable-next-line class-methods-use-this
  handleCopy(address: string, type: string) {
    logTrackerEvent(this, 'ISCNView', 'CopyWalletAddress', this.iscnId, 1);
    let text = ''
    if (type === 'cosmos') {
      text = address.replace(/(did:|:)/g, '')
    } else {
      text = address.replace(new RegExp(`(did:|${type}:|:)`, 'g'), '')
    }
    const copyText = document.createElement('p')
    copyText.textContent = text
    document.body.appendChild(copyText)

    const selection = document.getSelection()
    const range = document.createRange()

    range.selectNode(copyText)
    selection!.removeAllRanges()
    selection!.addRange(range)
    document.execCommand('copy')
    this.isOpenCopiedAlert = true

    selection!.removeAllRanges()
    document.body.removeChild(copyText)
  }
}
</script>
