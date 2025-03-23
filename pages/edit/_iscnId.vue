<template>
  <Card class="p-[32px] w-full max-w-[780px] mx-auto" :has-padding="false">
    <Label
      :text="$t('IscnEditInfo.title')"
      class="text-like-green font-bold my-[12px]"
    >
      <template #prepend>
        <IconEdit />
      </template>
    </Label>
    <form @submit.prevent="onSubmitUpdate">
      <FormField :label="$t('IscnRegisterForm.label.iscn')" class="my-[12px]">
        <TextField
          v-model="name"
          :placeholder="$t('IscnRegisterForm.placeholder.iscn')"
        />
      </FormField>
      <FormField
        :label="$t('IscnRegisterForm.label.description')"
        class="mb-[12px]"
      >
        <TextField
          v-model="description"
          :is-textarea="true"
          :placeholder="$t('IscnRegisterForm.placeholder.description')"
        />
      </FormField>

      <!-- upload content fingerprint -->
      <div
        v-if="shouldShowUploadSection"
        :label="$t('iscn.meta.content.fingerprints')"
        class="mb-[12px]"
      >
        <FormField
          v-if="step === 1"
          :label="$t('iscn.meta.content.fingerprints')"
          class="mb-[12px]"
        >
          <IscnUploadForm
            mode="edit"
            :iscn-id="iscnId"
            @submit="onSubmitUpload"
            @arweaveUploaded="onArweaveIdUpload"
          />
        </FormField>
        <div v-if="step === 2">
          <FormField
            v-if="shouldShowDRMOption"
            :label="$t('IscnRegisterForm.label.drm')"
            class="mb-[12px]"
          >
            <CheckBox v-model="isUseArweaveLinkChecked">
              {{ $t('IscnRegisterForm.label.drm.details') }}
            </CheckBox>
          </FormField>
          <FormField
            :label="$t('iscn.meta.content.fingerprints')"
            class="mb-[12px]"
          >
            <ContentFingerprintLink
              v-for="item in contentFingerprintLinks"
              :key="item"
              :item="item"
              :class="['mb-[8px]', 'break-all', 'text-[14px]']"
            />
            <div :class="['flex', 'mt-[12px]', 'gap-[8px]']">
              <TextField v-model="contentFingerprintInput" class="w-full" />
              <Button
                preset="secondary"
                type="button"
                @click="addContentFingerprint"
              >
                <IconAddMini />
              </Button>
            </div>
          </FormField>
          <FormField
            :label="$t('IscnRegisterForm.label.sameAs')"
            content-classes="flex flex-row flex-wrap"
          >
            <SameAsFieldList
              :name="name"
              :url-options="contentFingerprintLinks"
              :file-records="uploadFileRecords"
              :current-list="sameAsList"
              @on-update="(value) => (sameAsList = value)"
            />
          </FormField>
        </div>
      </div>

      <!-- default content fingerprint -->
      <div
        v-else-if="contentFingerprintLinks.length"
        :class="[
          'relative',
          'rounded-[12px]',
          'border-dashed',
          'border-[2px]',
          'border-like-green',
          'p-[20px]',

          'cursor-pointer',
          'transition',
          'duration-100',

          'group',
          'hover:bg-[rgba(0,0,0,0.4)]',
        ]"
      >
        <div
          :class="[
            'absolute',
            'top-0',
            'left-0',

            'items-center',
            'justify-center',
            'w-full',
            'h-full',

            'hidden',
            'group-hover:flex',
            'transition',
            'duration-100',
          ]"
          @click="handleClickUpload"
        >
          <Label
            class="text-[26px] text-white font-bold"
            :text="$t('IscnEditInfo.reUpload')"
          />
        </div>
        <FormField
          v-if="contentFingerprintLinks.length"
          :label="$t('iscn.meta.content.fingerprints')"
          class="mb-[12px]"
        >
          <ContentFingerprintLink
            v-for="item in contentFingerprintLinks"
            :key="item"
            :item="item"
            :class="['mb-[8px]', 'break-all', 'text-[14px]']"
          />
        </FormField>
        <FormField
          v-if="sameAs.length"
          :label="$t('iscn.meta.content.sameAs')"
          class="mb-[12px]"
        >
          <ContentFingerprintLink
            v-for="item in sameAs"
            :key="item"
            :item="item"
            :class="['mb-[8px]', 'break-all', 'text-[14px]']"
          />
        </FormField>
      </div>

      <Divider class="my-[12px]" />
      <div v-if="shouldShowMoreSettings" class="flex flex-col">
        <FormField
          :label="$t('IscnRegisterForm.label.license')"
          class="mb-[12px]"
        >
          <TextField
            v-model="license"
            :placeholder="$t('iscn.meta.license.placeholder')"
          />
        </FormField>
        <FormField :label="$t('IscnRegisterForm.label.url')">
          <TextField
            v-model="url"
            :placeholder="$t('IscnRegisterForm.placeholder.url')"
          />
        </FormField>
        <template v-if="type === 'Book'">
          <FormField
            :label="$t('IscnRegisterForm.label.thumbnailUrl')"
          >
            <TextField
              v-model="thumbnailUrl"
              :placeholder="$t('IscnRegisterForm.placeholder.thumbnailUrl')"
            />
          </FormField>
          <FormField
            :label="$t('IscnRegisterForm.label.isbn')"
          >
            <TextField
              v-model="isbn"
              :placeholder="$t('IscnRegisterForm.placeholder.isbn')"
            />
          </FormField>
          <FormField
            :label="$t('IscnRegisterForm.label.publisher')"
          >
            <TextField
              v-model="publisher"
              :placeholder="$t('IscnRegisterForm.placeholder.publisher')"
            />
          </FormField>
          <FormField
            :label="$t('IscnRegisterForm.label.datePublished')"
          >
            <input
              v-model="datePublished"
              type="date"
            />
          </FormField>
        </template>
      </div>
      <div v-else class="flex items-center justify-center">
        <Button
          preset="tertiary"
          size="mini"
          @click.prevent="() => (shouldShowMoreSettings = true)"
        >
          <div class="flex justify-center items-center gap-[6px]">
            <IconAdd />
            {{ $t('IscnRegisterForm.button.more.settings') }}
          </div>
        </Button>
      </div>
      <div class="flex justify-end items-center my-[20px]">
        <div
          v-if="isSubmitLoading"
          class="flex flex-col items-center justify-center gap-[4px]"
        >
          <ProgressIndicator />
          <Label class="text-medium-gray" :text="$t('IscnEditInfo.updating')" />
        </div>

        <Button
          v-else
          :text="$t('IscnEditInfo.button.confirm')"
          :is-disabled="shouldDisableSubmit"
          type="submit"
          :preset="step !== 2 ? 'tertiary' : 'secondary'"
        >
          <template #append>
            <IconArrowRight />
          </template>
        </Button>
      </div>
    </form>

    <Snackbar v-model="shouldShowAlert" :text="errorMessage" preset="warn" />
  </Card>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { OfflineSigner } from '@cosmjs/proto-signing'
import { BigNumber } from 'bignumber.js';
import { ISCN_PREFIX, ISCN_GAS_FEE, UPDATE_ISCN_GAS_MULTIPLIER } from '~/constant'
import { logTrackerEvent } from '~/utils/logger'
import { signISCN } from '~/utils/cosmos/iscn/sign'
import { extractIscnIdPrefix, formatArweave, formatIpfs } from '~/utils/ui'
import { LIKE_CO_API_ROOT } from '~/constant/api';

const walletModule = namespace('wallet')

@Component({
  async asyncData({ params, store, error, redirect }) {
    try {
      const { iscnId } = params
      if (iscnId && iscnId.startsWith(ISCN_PREFIX)) {
        const res: any = await store.dispatch('iscn/fetchISCNById', iscnId)
        if (res) {
          return {
            iscnId: res.records[0].id,
            iscnOwner: res.owner,
            iscnRecord: res.records[0].data,
            latestVersion: res.latestVersion.low,
          }
        }
      } else {
        redirect({ name: 'index' })
        return {}
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      error(err as Error)
    }
    return {}
  },
})
export default class EditIscnPage extends Vue {
  @walletModule.Getter('getWalletAddress') address!: string
  @walletModule.Getter('getSigner') signer!: OfflineSigner
  @walletModule.Action('initIfNecessary') initIfNecessary!: () => Promise<any>

  iscnOwner: string = ''
  iscnId: string = ''
  iscnRecord: any = null
  name: string = ''
  description: string = ''
  contentFingerprints: string[] = []
  sameAs: string[] = []
  contentMetadata: any = null
  type: string = ''
  license: string = ''
  url: string = ''
  thumbnailUrl: string = ''
  isbn: string = ''
  publisher: string = ''
  datePublished: string = ''

  isUseArweaveLinkChecked = false
  shouldShowUploadSection: boolean = false
  shouldShowMoreSettings: boolean = false
  uploadFileRecords: any = null
  uploadIpfsHashList: string[] = []
  uploadArweaveInfoList: any[] = []
  sameAsList: any = []

  step: number = 1
  customContentFingerprints: string[] = []
  contentFingerprintInput: string = ''
  isSubmitLoading: boolean = false
  shouldShowAlert: boolean = false
  errorMessage: string = ''

  latestVersion: number | string = ''

  get isUseArweaveLink() {
    return this.shouldShowDRMOption && this.isUseArweaveLinkChecked
  }

  get uploadArweaveLinkList() {
    return this.uploadArweaveInfoList.map((info) => info.link).filter(Boolean)
  }

  get combinedArweaveLinks(): string[] {
    if (this.isUseArweaveLink) {
      return this.uploadArweaveLinkList
    }
    return this.uploadArweaveInfoList.map((info) => formatArweave(info.id, info.key) as string)
  }

  get formattedSameAsList() {
    if (this.sameAsList.length) {
      return this.sameAsList.map(
        (sameAs: { filename: any; filetype: any; url: any }) => {
          if (sameAs.filename && sameAs.filetype) {
            const url = new URL(sameAs.url)
            url.searchParams.set('name', `${sameAs.filename}.${sameAs.filetype}`)
            return url.toString()
          }
          return ''
        },
      )
    }
    return this.sameAs
  }

  get shouldDisableSubmit() {
    return Boolean(this.step === 1 && this.shouldShowUploadSection)
  }

  get contentFingerprintLinks() {
    if (this.contentFingerprints.length) {
      return this.contentFingerprints
    }
    const array: string[] = []
    if (this.combinedArweaveLinks.length) {
      array.push(...this.combinedArweaveLinks)
    }
    if (!this.isUseArweaveLinkChecked && this.uploadIpfsHashList.length) {
      array.push(...this.uploadIpfsHashList.map((ipfs) => formatIpfs(ipfs) as string))
    }
    if (this.customContentFingerprints.length) {
      array.push(...this.customContentFingerprints)
    }
    return array
  }

  get shouldShowDRMOption() {
    return this.uploadArweaveLinkList.filter(Boolean).length
  }

  get payload() {
    return {
      ...this.contentMetadata,
      name: this.name,
      description: this.description,
      keywords: this.contentMetadata.keywords,
      url: this.url,
      contentFingerprints: this.contentFingerprintLinks,
      stakeholders: this.iscnRecord?.stakeholders,
      type: this.type,
      usageInfo: this.license,
      thumbnailUrl: this.thumbnailUrl,
      isbn: this.isbn,
      publisher: this.publisher,
      datePublished: this.datePublished,
      recordNotes: this.iscnRecord?.recordNotes,
      sameAs: this.formattedSameAsList,
      version: (Number(this.latestVersion) + 1).toString(),
    }
  }

  mounted() {
    if (this.iscnRecord) {
      this.contentMetadata = this.iscnRecord?.contentMetadata
      this.name = this.contentMetadata.name
      this.description = this.contentMetadata.description
      this.contentFingerprints = this.iscnRecord?.contentFingerprints || []
      this.sameAs = this.contentMetadata.sameAs || []
      this.type = this.contentMetadata['@type'] || ''
      this.license = this.contentMetadata.usageInfo || ''
      this.url = this.contentMetadata.url || ''
      this.thumbnailUrl = this.contentMetadata.thumbnailUrl || ''
      this.isbn = this.contentMetadata.isbn || ''
      this.publisher = this.contentMetadata.publisher || ''
      this.datePublished = this.contentMetadata.datePublished ? new Date(this.contentMetadata.datePublished).toISOString().split('T')[0] || '' : ''
      this.isUseArweaveLinkChecked = !!this.contentFingerprints.find(
        link => link.startsWith(LIKE_CO_API_ROOT),
      )
    }
  }

  handleClickUpload() {
    this.shouldShowUploadSection = true
  }

  onArweaveIdUpload({ arweaveId }: { arweaveId: string }) {
    logTrackerEvent(this, 'ISCNEdit', 'ISCNFileUploadToARSuccess', arweaveId, 1)
  }

  addContentFingerprint() {
    this.customContentFingerprints.push(this.contentFingerprintInput)
    this.contentFingerprintInput = ''
  }

  onSubmitUpload({
    fileRecords,
    arweaveInfos,
  }: {
    fileRecords: any[]
    arweaveInfos: any[]
  }) {
    this.contentFingerprints = []
    if (fileRecords && fileRecords.length) {
      this.uploadFileRecords = [...fileRecords]
      this.uploadIpfsHashList = fileRecords.map((record) => record.ipfsHash).filter(Boolean)
    }
    if (arweaveInfos && arweaveInfos.length) {
      this.uploadArweaveInfoList = [...arweaveInfos]
    }
    logTrackerEvent(this, 'ISCNEdit', 'ISCNConfirmFile', '', 1)
    this.step = 2
  }

  async onSubmitUpdate() {
    this.isSubmitLoading = true
    try {
      await this.initIfNecessary()
      if (!this.signer) {
        throw new Error('No signer found')
      }
      const result = await signISCN(this.payload, this.signer, this.address, {
        iscnId: this.iscnId,
        gas: new BigNumber(ISCN_GAS_FEE).multipliedBy(UPDATE_ISCN_GAS_MULTIPLIER).toFixed(0),
      })
      if (result) {
        this.$router.replace(
          this.localeLocation({
            name: 'view-iscnId',
            params: { iscnId: extractIscnIdPrefix(this.iscnId) },
          })!,
        )
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      this.shouldShowAlert = true
      this.errorMessage = (error as Error).toString()
    }

    this.isSubmitLoading = false
  }
}
</script>
