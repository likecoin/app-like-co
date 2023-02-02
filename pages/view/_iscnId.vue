<template>
  <Page
    v-if="!record"
    class="justify-center"
  >
    <Card>
      <Label :text="$t('general.loading')" />
    </Card>
  </Page>
  <div v-else-if="isPopupLayout">
    <div v-if="isShowMintButton" class="flex justify-center w-full bg-like-cyan-light">
      <Button
        preset="plain"
        :to="localeLocation({ name: 'nft-iscn-iscnId', params: { iscnId: iscnId }, query: mintQueries })"
        class="text-like-green"
        :text="$t('NFTPortal.button.mintContinueLong')"
      />
    </div>
    <Page>
      <IscnUploadedInfo
        :class="[
          'w-full',
          'max-w-[640px]',
        ]"
        :owner="owner"
        :iscn-id="iscnId"
        :iscn-hash="txHash"
        :record="record"
        :exif-info="exifInfo"
      >
        <template #footer>
          <div
            :class="[
              'flex',
              'justify-end',
            ]"
          >
            <Button
              :class="['w-min', 'mr-[8px]']"
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
            <Button
              v-if="isShowMintButton"
              :class="['w-min', 'mr-[8px]']"
              preset="secondary"
              :text="$t('NFTPortal.button.mintContinue')"
              :to="localeLocation({ name: 'nft-iscn-iscnId', params: { iscnId: iscnId }, query: mintQueries })"
            />
            <Button
              v-else
              preset="outline"
              class="w-min"
              :text="$t('general.closeWindow')"
              @click="closeWindow"
            />
          </div>
        </template>
      </IscnUploadedInfo>
    </Page>
  </div>
  <div v-else>
    <div v-if="isShowMintButton" class="flex justify-end w-full">
      <Button
        preset="secondary"
        :to="localeLocation({ name: 'nft-iscn-iscnId', params: { iscnId: iscnId }, query: mintQueries })"
        class="text-like-green"
        :text="$t('NFTPortal.button.mint')"
      />
    </div>
    <Page
      :class="[
        'w-full',
        'max-w-[960px]',
        'mt-[16px]',
        'mx-auto',
        'mb-[32px]',
      ]"
      :flex-layout-class="[
        'flex-nowrap',
        'flex-col',
        'items-start',
        'lg:flex-row',
      ]"
      >
      <div
        :class="[
          'relative',

          'flex',
          'lg:block',

          'flex-col',

          'items-center',

          'w-full',
          'max-w-full',
          'lg:max-w-[280px]',
          'lg:mr-[32px]',
        ]"
      >
        <ClientOnly>
          <LazyIscnCard
            :key="`${record.id}-portrait`"
            :class="[
              'hidden',
              'lg:block',
              'flex-shrink-0',
              'w-[280px]',
            ]"
            :record="record"
            orientation="portrait"
            :is-animated="true"
          />
          <LazyIscnCard
            :key="`${record.id}-landscape`"
            :class="[
              'w-full',
              'lg:absolute',
              'lg:opacity-0',
              'lg:pointer-events-none',
            ]"
            :record="record"
            :is-animated="true"
            orientation="landscape"
          />
          <Button
            v-if="viewContentURL"
            class="mx-auto mt-[16px]"
            preset="outline"
            :text="$t('NFTPortal.button.viewContent')"
            @click="onClickViewContent"
          >
            <template #append>
              <IconOpenInNew class="w-[12px]" />
            </template>
          </Button>
        </ClientOnly>
        <MetadataCard
          v-if="type ==='Image' || type === 'Photo'"
          :img-src="imgSrc"
          :filtered-exif="exifInfo"
          :class="[
            'mt-[16px]',
            'sm:mt-0',
            'lg:mt-[16px]',
            'sm:ml-[16px]',
            'lg:ml-0',
          ]"
        />
      </div>
      <div
        :class="[
          'w-full',
          'mt-[16px]',
          'lg:mt-0',
        ]"
      >
        <InfoCard :label-text="type" :timestamp="recordData.recordTimestamp">
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
            <Link
              :class="[
                'text-[14px]',
                'break-all',
                'cursor-pointer',
              ]"
              :to="localeLocation({ name: 'search-keyword', query: { owner } })">
              {{ owner }}
            </Link>
          </FormField>
          <FormField :label="$t('iscn.meta.transaction')" class="mb-[12px]">
            <Link
              v-if="txHash"
              :class="[
                'text-[14px]',
                'break-all',
              ]"
              :href="transactionsURL">
              {{ txHash }}
            </Link>
            <ProgressIndicator
              v-else
              class="my-[4px]"
              preset="thin"
            />
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
            <Keyword
              v-for="item in keywords"
              :key="item.key"
              :keyword="item"
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
              :text="getStakeholderDisplayName(index) | ellipsis"
              @click="showStakeholder(index)"
            />
          </FormField>
          <FormField
            v-if="version"
            :label="$t('iscn.meta.version')"
            class="mb-[12px]"
          >
            {{ version }}
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
                <Link
                  :class="'text-[16px] cursor-pointer'"
                  :to="localeLocation({ name: 'search-keyword', query: { stakeholder_name: stakeholderInfo.authorName }})"
                >
                  {{ stakeholderInfo.authorName }}
                </Link>
              </FormField>
              <FormField
                v-if="stakeholderInfo.likerId"
                :label="$t('iscn.meta.stakeholders.likerId')"
                class="w-[50%] my-[12px] cursor-pointer"
              >
                <Link :to="localeLocation({ name: 'search-keyword', query: { stakeholder_id: stakeholderInfo.likerId } })">{{
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
                  (wallet.type === 'cosmos' || wallet.type === 'like')
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
            <IconDone />
          </template>
        </Snackbar>
      </div>
    </Page>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import qs from 'querystring'
// eslint-disable-next-line import/no-extraneous-dependencies
import { MetaInfo } from 'vue-meta'
import { API_LIKER_NFT_MINT } from '~/constant/api'
import { isCosmosTransactionHash } from '~/utils/cosmos'
import { getIPFSUrlFromISCN } from '~/utils/cosmos/iscn'
import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type'
import {
  ISCN_PREFIX,
  BIG_DIPPER_TX_BASE_URL,
  ISCN_RAW_DATA_ENDPOINT,
  ISCN_TX_RAW_DATA_ENDPOINTS,
  WALLET_TYPE_REPLACER,
  IPFS_VIEW_GATEWAY_URL,
} from '~/constant'
import { logTrackerEvent } from '~/utils/logger'
import { ellipsis } from '~/utils/ui'

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
  head() {
    let title = ''
    if (this.$route.query.layout === 'popup') {
      title = this.$t('page.iscnId.popup.title') as string
    } else {
      title = (this as ViewIscnIdPage).name || this.$t('page.iscnId.default.title') as string
    }
    const description =
      (this as ViewIscnIdPage).metadata?.description || this.$t('page.iscnId.default.description')
    return {
      title,
      meta: [
        {
          hid: 'og:title',
          property: 'og:title',
          content: title,
        },
        {
          hid: 'description',
          name: 'description',
          content: description,
        },
        {
          hid: 'og:description',
          property: 'og:description',
          content: description,
        },
      ],
    } as MetaInfo
  },
  filters: { ellipsis },
  layout({ query }) {
    switch (query.layout) {
      case 'popup':
        return query.layout

      default:
        return 'default'
    }
  },
  async fetch({ params, store, error }) {
    try {
      await store.dispatch('iscn/fetchISCNById', params.iscnId)
    } catch (err) {
      error(err as Error)
    }
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
    contributionType: '',
  }

  isPreminted = !this.isPopupLayout // assume popup is not preminted

  @iscnModule.Getter getISCNById!: (arg0: string) => ISCNRecordWithID
  @iscnModule.Action fetchISCNById!: (arg0: string) => Promise<{
    records: ISCNRecordWithID[]
    owner: string
    latestVersion: Long.Long
  } | null>

  @iscnModule.Action fetchISCNByTx!: (
    arg0: string
  ) => Promise<{ records: ISCNRecordWithID[] }>

  get isShowMintButton() {
    return !this.isPreminted
  }

  get isPopupLayout() {
    return this.$route.query.layout === 'popup'
  }

  get mintQueries() {
    return this.$route.query;
  }

  get record() {
    return this.getISCNById(this.iscnId)
  }

  get recordData() {
    return this.record?.data
  }

  get metadata() {
    return this.recordData?.contentMetadata
  }

  get type() {
    return this.metadata && this.metadata['@type']
  }

  get imgSrc() {
    return (
      getIPFSUrlFromISCN(this.getISCNById(this.iscnId))
    )
  }

  get name() {
    return this.metadata?.name || this.metadata?.title
  }

  get keywords(): Array<string> {
    return this.metadata.keywords ? this.metadata.keywords.split(',') : []
  }

  get stakeholders() {
    return this.recordData?.stakeholders
  }

  get transactionsURL() {
    return `${BIG_DIPPER_TX_BASE_URL}${this.txHash}`
  }

  get rawDataURL() {
    return `${ISCN_RAW_DATA_ENDPOINT}${this.iscnId}`
  }

  get version() {
    return this.recordData?.recordVersion
  }

  get viewContentURL() {
    const arURL = this.recordData.contentFingerprints.find(a => a.startsWith('ar://'));
    if (arURL) return `https://arweave.net/${arURL.slice(5)}`
    const ipfsURL = this.recordData.contentFingerprints.find(a => a.startsWith('ipfs://'));
    if (ipfsURL) return `${IPFS_VIEW_GATEWAY_URL}/${ipfsURL.slice(7)}`
    const httpsURL = this.recordData.contentFingerprints.find(a => a.startsWith('https://'));
    if (httpsURL) return httpsURL;
    return '';
  }

  created() {
    const { iscnId } = this.$route.params
    if (iscnId && iscnId.startsWith(ISCN_PREFIX)) {
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
    this.getMintInfo()
    if (!this.getISCNById(this.iscnId) || !this.owner) {
      const res = await this.fetchISCNById(this.iscnId)
      if (res) {
        this.iscnId = res.records[0].id // To replace prefix with full id
        this.owner = res.owner
      }
    }
    if (!this.getISCNById(this.iscnId)) {
      this.$nuxt.error({ statusCode: 404, message: ErrorMessage.statusCode404 })
      return
    }
    this.exifInfo = this.showExifInfo()
    this.fetchTxHash().then(txHash => { this.txHash = txHash; });
  }

  async fetchTxHash() {
    const datas = await Promise.all(
      ISCN_TX_RAW_DATA_ENDPOINTS.map((url: string) =>
        this.$axios.get(`${url}'${this.iscnId}'`),
      ),
    );

    const data = datas.find(d => !!(d?.data?.tx_responses?.length));
    if (!data) {
      return undefined;
    }
    return data?.data?.tx_responses[0]?.txhash;
  }

  onClickViewContent() {
    window.open(this.viewContentURL, '_blank');
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

  getStakeholderDisplayName(index: number) {
    const stakeholder = this.stakeholders[index].entity || this.stakeholders[index];
    return stakeholder.name
      || stakeholder['@id']
      || stakeholder.contributionType?.replace('http://schema.org/', '')
      || 'unknown';
  }

  showStakeholder(index: number) {
    logTrackerEvent(this, 'ISCNView', 'ShowStakeholder', this.iscnId, 1);
    this.isOpenAuthorDialog = true
    const stakeholder = this.stakeholders[index].entity || this.stakeholders[index]

    if (stakeholder) {
      const { contributionType, description: authorDescription, name: authorName } = stakeholder
      const likerId = stakeholder.url?.includes('like.co') || ''
        ? stakeholder.url.slice(16)
        : ''

      const authorWalletAddresses = stakeholder.identifier?.map((a: any) => ({
        address: a.value,
        type: this.getKeyByValue(WALLET_TYPE_REPLACER, a.propertyID),
      })) || []

      if (!authorWalletAddresses.length && stakeholder['@id']) {
        authorWalletAddresses.push({
          type: 'cosmos',
          address: stakeholder['@id'],
        })
      }

      const authorUrls = stakeholder.sameAs || []
      if (stakeholder.url) {
        authorUrls.push(stakeholder.url)
      }
      this.stakeholderInfo = {
        likerId,
        authorDescription,
        authorWalletAddresses,
        authorUrls,
        authorName,
        contributionType: contributionType?.replace('http://schema.org/', ''),
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
    if (type === 'cosmos' || type === 'like') {
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

  // eslint-disable-next-line class-methods-use-this
  closeWindow() {
    window.close()
  }

  async getMintInfo() {
    try {
      const { data } = await this.$axios.get(API_LIKER_NFT_MINT, {
        params: {
          iscn_id: this.iscnId,
        },
        paramsSerializer: (params) => qs.stringify(params),
      })
      this.isPreminted = !!data.classId
    } catch (err) {
      this.isPreminted = false
      // eslint-disable-next-line no-console
      console.error(err)
    }
  }
}
</script>
