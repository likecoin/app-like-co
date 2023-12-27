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
            @submit="onSubmitUpload"
            @arweaveUploaded="onArweaveIdUpload"
          />
        </FormField>
        <div v-if="step === 2">
          <FormField
            :label="$t('iscn.meta.content.fingerprints')"
            class="mb-[12px]"
          >
            <ContentFingerprintLink
              v-for="ipfs of uploadIpfsList"
              :key="ipfs"
              :item="formatIpfs(ipfs)"
            />
            <ContentFingerprintLink
              v-for="ar of uploadArweaveIdList"
              :key="ar"
              :item="formatArweave(ar)"
            />
            <ContentFingerprintLink
              v-for="(f, i) in customContentFingerprints"
              :key="f + i"
              :item="f"
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
            <span v-if="formattedSameAsList.length" class="mr-[8px] mb-[4px]">
              <Button
                size="mini"
                preset="secondary"
                tag="div"
                text-preset="h6"
                type="button"
                :text="`${formattedSameAsList.length} urls`"
                @click="handleOpenSameAsDialog()"
              />
            </span>
            <Button
              v-else
              type="button"
              class="mb-[4px]"
              size="mini"
              preset="secondary"
              content-class="py-[4px]"
              @click="handleOpenSameAsDialog()"
            >
              <IconAddMini />
            </Button>
          </FormField>
        </div>
      </div>

      <!-- default content fingerprint -->
      <div
        v-else-if="contentFingerprints.length"
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
          'hover:bg-[rgba(0,0,0,0.3)]',
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
          <Label class="text-[26px] text-white font-bold">Re-Upload data</Label>
        </div>
        <FormField
          v-if="contentFingerprints.length"
          :label="$t('iscn.meta.content.fingerprints')"
          class="mb-[12px]"
        >
          <ContentFingerprintLink
            v-for="item in contentFingerprints"
            :key="item.key"
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
            :key="item.key"
            :item="item"
            :class="['mb-[8px]', 'break-all', 'text-[14px]']"
          />
        </FormField>
      </div>
      <div class="flex justify-end items-center my-[20px]">
        <ProgressIndicator v-if="isSubmitLoading" />
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

    <Dialog
      v-model="isOpenSameAsDialog"
      :has-padding="false"
      preset="custom"
      :is-disabled-backdrop-click="true"
    >
      <Card
        :class="[
          'flex',
          'flex-col',
          'w-[616px]',
          'max-h-[75vh]',
          'pb-[40px]',
          'overflow-y-scroll',
          'scrollbar-hidden',
        ]"
      >
        <Label
          class="w-min mb-[16px]"
          :text="$t('IscnRegisterForm.sameAsDialog.title')"
          tag="div"
          preset="p5"
          valign="middle"
          content-class="font-semibold whitespace-nowrap text-like-green"
          prepend-class="text-like-green"
        >
          <template #prepend>
            <IconAdd />
          </template>
        </Label>
        <SameAsFieldList
          :name="name"
          :url-options="contentFingerprintOptions"
          :file-records="uploadFileRecords"
          :current-list="sameAsList"
          @onConfirm="confirmSameAsChange"
        />
      </Card>
    </Dialog>
  </Card>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { OfflineSigner } from '@cosmjs/proto-signing'
import { ISCN_PREFIX } from '~/constant'
import { logTrackerEvent } from '~/utils/logger'
import { updateISCNRecord } from '~/utils/cosmos/iscn/sign'

const walletModule = namespace('wallet')

@Component({
  async asyncData({ params, store, error, redirect }) {
    try {
      const { iscnId } = params
      if (iscnId && iscnId.startsWith(ISCN_PREFIX)) {
        const res = await store.dispatch('iscn/fetchISCNById', iscnId)
        if (res) {
          return {
            iscnId: res.records[0].id,
            iscnOwner: res.owner,
            iscnRecord: res.records[0].data,
          }
        }
      } else {
        redirect({ name: 'index' })
      }
    } catch (err) {
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
  shouldShowUploadSection: boolean = false
  uploadFileRecords: any = null
  uploadArweaveIdList: string[] = []
  uploadIpfsList: string[] = []
  sameAsList: any = []

  step: number = 1
  customContentFingerprints: string[] = []
  contentFingerprintInput: string = ''
  isOpenSameAsDialog: boolean = false
  isSubmitLoading: boolean = false

  get formattedSameAsList() {
    return this.sameAsList.map(
      (sameAs: { filename: any; filetype: any; url: any }) => {
        if (sameAs.filename && sameAs.filetype) {
          return `${sameAs.url}?name=${sameAs.filename}.${sameAs.filetype}`
        }
        return ''
      },
    )
  }

  get shouldDisableSubmit() {
    return Boolean(this.step === 1 && this.shouldShowUploadSection)
  }

  get contentFingerprintOptions() {
    const array = []
    if (this.uploadArweaveIdList) {
      array.push(
        ...this.uploadArweaveIdList.map((id: string) => this.formatArweave(id)),
      )
    }
    if (this.uploadIpfsList.length) {
      array.push(...this.uploadIpfsList.map((ipfs) => this.formatIpfs(ipfs)))
    }
    if (this.customContentFingerprints.length) {
      array.push(...this.customContentFingerprints)
    }
    return array
  }

  get payload() {
    return {
      name: this.name,
      description: this.description,
      keywords: this.contentMetadata.keywords,
      url: this.contentMetadata.url,
      contentFingerprints: [
        ...this.contentFingerprints,
        ...this.customContentFingerprints,
      ],
      stakeholders: this.iscnRecord?.stakeholders,
      type: this.contentMetadata['@type'],
      usageInfo: this.contentMetadata.usageInfo,
      recordNotes: this.iscnRecord?.recordNotes,
      contentMetadata: {
        ...this.contentMetadata,
        name: this.name,
        description: this.description,
        sameAs: this.sameAsList.length ? this.sameAsList : this.sameAs,
      },
    }
  }

  mounted() {
    if (this.iscnRecord) {
      this.contentMetadata = this.iscnRecord?.contentMetadata
      this.name = this.contentMetadata.name
      this.description = this.contentMetadata.description
      this.contentFingerprints = this.iscnRecord?.contentFingerprints || []
      this.sameAs = this.contentMetadata.sameAs || []
    }
  }

  handleClickUpload() {
    this.shouldShowUploadSection = true
  }

  onArweaveIdUpload({ arweaveId }: { arweaveId: string }) {
    logTrackerEvent(this, 'ISCNEdit', 'ISCNFileUploadToARSuccess', arweaveId, 1)
  }

  formatIpfs(ipfsHash: string) {
    return this.$t('IscnRegisterForm.ipfs.link', { hash: ipfsHash })
  }

  formatArweave(arweaveId: string) {
    return this.$t('IscnRegisterForm.arweave.link', { arweaveId })
  }

  addContentFingerprint() {
    this.customContentFingerprints.push(this.contentFingerprintInput)
    this.contentFingerprintInput = ''
  }

  handleOpenSameAsDialog() {
    this.isOpenSameAsDialog = true
  }

  confirmSameAsChange(value: any) {
    logTrackerEvent(this, 'ISCNEdit', 'ConfirmSameAsChange', '', 1)
    this.sameAsList = value
    this.isOpenSameAsDialog = false
  }

  onSubmitUpload({
    fileRecords,
  }: {
    fileRecords: any[]
    arweaveIds: string[]
  }) {
    this.contentFingerprints = []
    if (fileRecords && fileRecords.length) {
      this.uploadFileRecords = [...fileRecords]
      this.uploadIpfsList = fileRecords.map((file) => file.ipfsHash)
      this.uploadArweaveIdList = fileRecords.map((file) => file.arweaveId)

      this.contentFingerprints = [
        ...fileRecords.map((file) => file.fileSHA256),
        ...this.uploadIpfsList,
        ...this.uploadArweaveIdList,
      ]
    }
    logTrackerEvent(this, 'ISCNEdit', 'ISCNConfirmFile', '', 1)
    this.step = 2
  }

  async onSubmitUpdate() {
    this.isSubmitLoading = true
    await this.initIfNecessary()
    const result = await updateISCNRecord(
      this.signer,
      this.address,
      this.iscnId,
      this.payload,
    )
    this.isSubmitLoading = false

    if (result) {
      this.$router.replace(
        this.localeLocation({
          name: 'view-iscnId',
          params: { iscnId: this.iscnId },
        })!,
      )
    }
  }
}
</script>
