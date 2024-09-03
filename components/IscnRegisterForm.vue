<template>
  <div :class="['flex', 'flex-col']">
    <Card class="p-[32px]" :has-padding="false">
      <!-- header -->
      <IscnFormHeader :step="step" :total-step="4" />
      <Label
        :text="$t('IscnRegisterForm.guide.review')"
        class="text-medium-gray my-[12px]"
      />
      <!-- review metadata -->
      <div
        :class="[
          'flex',
          'w-[584px]',
          'flex-row',
          'justify-start',
          'items-center',
          'p-[32px]',
          'mb-[12px]',
          'border-[2px]',
          'border-dashed',
          'border-shade-gray',
          'rounded-[12px]',
          'text-medium-gray',
        ]"
      >
        <template v-if="fileRecords.length">
          <div
            v-if="fileRecords.length"
            class="flex flex-col items-center w-full"
          >
            <table class="w-full">
              <tbody class="w-full">
                <tr
                  v-for="(
                    { isFileImage, fileData, fileName, fileSize, exifInfo },
                    index
                  ) of fileRecords"
                  :key="fileName"
                  class="border-b-shade-gray border-b-[1px] text-dark-gray hover:bg-light-gray transition-colors w-full"
                >
                  <td class="py-[4px]">
                    <Previewer
                      :is-image="isFileImage"
                      :file-data="fileData"
                      size="small"
                    />
                  </td>
                  <td class="py-[4px]">
                    <div
                      :class="[
                        'flex',
                        'flex-col',
                        'items-stretch',
                        'justify-start',
                      ]"
                    >
                      <Label
                        :text="fileName"
                        preset="h5"
                        :class="['font-semibold', 'text-dark-gray']"
                      />
                      <Label
                        :text="`${Math.round(fileSize * 0.001)} KB`"
                        preset="h6"
                        :class="['font-normal', 'text-medium-gray', 'mt-[8px]']"
                      />
                    </div>
                  </td>
                  <td class="py-[4px]">
                    <div
                      class="flex gap-[8px] items-center justify-end ml-[4px]"
                    >
                      <div
                        v-if="exifInfo"
                        :class="['cursor-pointer']"
                        @click="handleClickExifInfo(index)"
                      >
                        <IconInfo />
                      </div>
                      <div v-if="exifInfo || isFileImage">
                        <input
                          v-model="isRegisterNumbersProtocolAsset"
                          type="checkbox"
                          name="numbers"
                          disabled
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div
              v-if="uploadStatus === 'loading'"
              :class="['flex', 'items-center', 'mt-[32px]']"
            >
              <ProgressIndicator />
              <div
                class="ml-[12px]"
                v-text="$t('IscnRegisterForm.label.uploading')"
              />
            </div>
            <Label
              v-else
              :class="['w-min', 'mt-[32px]']"
              :text="$t('IscnRegisterForm.title.ready')"
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
          </div>
        </template>
        <div v-else>
          {{ $t('IscnRegisterForm.label.emptyFile') }}
        </div>
      </div>
      <!-- type -->
      <div class="flex justify-between mb-[12px]">
        <FormField :label="$t('IscnRegisterForm.label.type')">
          <Selector
            class="h-[40px] w-[160px]"
            :options="typeOptions"
            :placeholder="defaultType"
            @input="setType"
          />
        </FormField>
        <FormField v-if="isBookType" :label="$t('IscnRegisterForm.label.language')">
          <Selector
            class="h-[40px] w-[160px]"
            :options="languageOptions"
            :placeholder="defaultLanguage"
            @input="setLanguage"
          />
        </FormField>
      </div>

      <Divider class="my-[12px]" />
      <!-- form fieldset -->
      <div>
        <form @submit.prevent="onSubmit">
          <FormField
            :label="$t('IscnRegisterForm.label.iscn')"
            class="my-[12px]"
          >
            <TextField
              v-model="name"
              :error-message="validateField(name, charactersLimit.name, true)"
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
              :error-message="
                validateField(description, charactersLimit.description, true)
              "
              :placeholder="$t('IscnRegisterForm.placeholder.description')"
            />
          </FormField>
          <FormField
            :label="$t('IscnRegisterForm.label.author')"
            content-classes="flex flex-row flex-wrap"
          >
            <span v-if="author.name" class="mr-[8px]">
              <Button
                size="mini"
                preset="secondary"
                tag="div"
                text-preset="h6"
                type="button"
                :text="author.name"
                @click="editAuthor({ type: 'author' })"
              />
            </span>
            <Button
              v-else
              type="button"
              size="mini"
              preset="secondary"
              content-class="py-[4px]"
              @click="handleOpenAuthorDialog({ type: 'author' })"
            >
              <IconAddMini />
            </Button>
          </FormField>
          <FormField
            :label="$t('IscnRegisterForm.label.stakeholder')"
            content-classes="flex flex-row flex-wrap"
          >
            <!-- add author -->
            <span
              v-for="(author, index) in authors"
              :key="index"
              class="mr-[8px] mb-[4px]"
            >
              <Button
                size="mini"
                preset="secondary"
                tag="div"
                text-preset="h6"
                type="button"
                :text="author.name"
                @click="editAuthor({ type: 'stakeholder', index })"
              />
            </span>
            <Button
              type="button"
              class="mb-[4px]"
              size="mini"
              preset="secondary"
              content-class="py-[4px]"
              @click="handleOpenAuthorDialog({ type: 'stakeholder' })"
            >
              <IconAddMini />
            </Button>
          </FormField>
          <!-- add tags -->
          <FormField
            :label="$t('IscnRegisterForm.label.tags')"
            content-classes="flex flex-row flex-wrap"
          >
            <EditableTagList
              v-model="tags"
              :characters-limit="charactersLimit.tagContent"
              :tags-limit="charactersLimit.tagNumber"
            />
          </FormField>
          <Divider class="my-[12px]" />
          <FormField
            v-if="type === 'Book'"
            :label="$t('IscnRegisterForm.label.sameAs')"
            content-classes="flex flex-row flex-wrap"
          >
            <SameAsFieldList
              :name="name"
              :url-options="contentFingerprintLinks"
              :file-records="fileRecords"
              :current-list="sameAsList"
              @on-update="(value) => (sameAsList = value)"
            />
          </FormField>
          <FormField
            :label="$t('IscnRegisterForm.label.license')"
            class="mb-[12px]"
          >
            <Selector
              class="h-[40px] w-[320px] mb-[8px]"
              :options="licenseOptions"
              :placeholder="license"
              direction="top"
              @input="setLicense"
            />
            <TextField
              v-if="license === 'Other'"
              v-model="customLicense"
              :placeholder="$t('iscn.meta.license.placeholder')"
            />
          </FormField>
          <!-- fingerPrint -->
          <FormField
            :label="$t('IscnRegisterForm.label.fingerprints')"
            class="mb-[12px]"
          >
            <ContentFingerprintLink
              v-for="ipfs of ipfsHashList"
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
            <div
              v-if="shouldShowContentFingerprintInput"
              :class="[
                'flex',
                { 'mt-[12px]': customContentFingerprints.length },
                'gap-[8px]',
              ]"
            >
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
            :label="$t('IscnRegisterForm.label.registrant')"
            class="mb-[12px]"
          >
            <div class="font-normal text-[16px] leading-[22px]">
              {{ address }}
            </div>
          </FormField>
          <Divider class="my-[12px]" />
          <div v-if="shouldShowMoreSettings" class="flex flex-col">
            <FormField :label="$t('IscnRegisterForm.label.url')">
              <TextField
                v-model="url"
                :placeholder="$t('IscnRegisterForm.placeholder.url')"
              />
            </FormField>
            <FormField
              v-if="type === 'Book'"
              :label="$t('IscnRegisterForm.label.isbn')"
            >
              <TextField
                v-model="isbn"
                :placeholder="$t('IscnRegisterForm.placeholder.isbn')"
              />
            </FormField>
            <FormField
              v-if="shouldShowUploadToNumbers"
              :label="$t('IscnRegisterForm.label.numbersProtocol')"
              class="mb-[12px]"
            >
              <CheckBox v-model="isRegisterNumbersProtocolAsset">
                <i18n path="IscnRegisterForm.label.numbersProtocol.details">
                  <Link
                    place="link"
                    href="https://www.numbersprotocol.io/"
                    :is-inline="true"
                    >{{
                      $t('IscnRegisterForm.label.numbersProtocol.details.link')
                    }}</Link
                  >
                </i18n>
              </CheckBox>
            </FormField>
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
          <!-- submit -->
          <div class="flex flex-row justify-end pt-[24px] text-medium-gray">
            <Label :text="formattedRegisterFee" class="mx-[24px]" />
            <div v-if="uploadStatus === 'loading'">
              <Button
                :text="$t('IscnRegisterForm.button.loading')"
                preset="outline"
                is-disabled="true"
              >
                <template #append>
                  <IconArrowRight />
                </template>
              </Button>
            </div>
            <div
              v-else-if="uploadStatus"
              :class="['flex', 'flex-col', 'items-end']"
            >
              <ProgressIndicator />
              <div :class="['text-[12px]', 'mt-[4px]']">
                {{ formattedUploadStatus }}
              </div>
            </div>
            <div v-else :class="['flex', 'flex', 'items-end', 'gap-[12px]']">
              <Button
                :text="$t('IscnRegisterForm.button.register')"
                type="submit"
                preset="secondary"
              >
                <template #append>
                  <IconArrowRight />
                </template>
              </Button>
            </div>
          </div>
        </form>
      </div>
      <!-- Snackbar -->
      <Snackbar v-model="isOpenWarningSnackbar" preset="warn">
        {{ errorMsg }}
        <Link
          v-if="error === 'INSUFFICIENT_BALANCE'"
          :class="['text-white', 'ml-[2px]']"
          nofollow="true"
          href="https://app.osmosis.zone/?from=USDC&to=LIKE"
        >
          {{ $t('IscnRegisterForm.error.buy') }}
        </Link>
      </Snackbar>
      <!-- Dialogs -->
      <Dialog
        v-model="isOpenFileInfoDialog"
        :has-padding="false"
        preset="custom"
      >
        <MetadataCard
          :class="[
            'w-[616px]',
            'max-h-[75vh]',
            'overflow-y-scroll',
            'scrollbar-hidden',
          ]"
          :img-src="displayImageSrc"
          :all-exif="displayExifInfo"
        />
      </Dialog>
      <Dialog
        v-model="isOpenAuthorDialog"
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
            'pb-[80px]',
            'overflow-y-scroll',
            'scrollbar-hidden',
          ]"
        >
          <Label
            class="w-min mb-[16px]"
            :text="authorDialogTitle"
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
          <!-- name -->
          <FormField
            class="mb-[24px]"
            content-classes="flex flex-row flex-nowarp items-top"
            :label="$t('IscnRegisterForm.label.name')"
          >
            <TextField
              v-model="authorName"
              :error-message="
                validateField(authorName, charactersLimit.authorName, true)
              "
              :size="40"
              class="w-[219px]"
              :placeholder="$t('IscnRegisterForm.placeholder.name')"
            />
          </FormField>
          <FormField
            class="mb-[16px]"
            :label="$t('IscnRegisterForm.label.likerID')"
          >
            <TextField
              v-model="likerId"
              :size="40"
              :error-message="
                validateField(
                  likerId,
                  charactersLimit.likerId,
                  false,
                  charactersLimit.likerIdLeast
                )
              "
              :placeholder="$t('IscnRegisterForm.placeholder.likerID')"
            />
          </FormField>
          <FormField
            :label="$t('IscnRegisterForm.label.description')"
            class="mb-[24px]"
          >
            <TextField
              v-model="authorDescription"
              :is-textarea="true"
              :error-message="
                validateField(
                  authorDescription,
                  charactersLimit.authorDescription
                )
              "
              :placeholder="$t('IscnRegisterForm.placeholder.description')"
            />
          </FormField>
          <!-- url -->
          <FormField
            class="mb-[24px]"
            :label="$t('IscnRegisterForm.label.url')"
          >
            <TextFieldList
              v-model="authorUrl"
              :size="40"
              :text="$t('IscnRegisterForm.label.url')"
              :placeholder="$t('IscnRegisterForm.placeholder.url')"
            />
          </FormField>
          <!-- wallet address -->
          <FormField :label="$t('IscnRegisterForm.label.wallet')">
            <WalletFieldList v-model="authorWalletAddress" />
          </FormField>
          <!-- submit btn -->
          <div class="flex flex-row self-end">
            <Button
              type="button"
              size="small"
              preset="secondary"
              content-class="font-semibold"
              :text="$t('IscnRegisterForm.button.confirm')"
              @click.prevent="confirmAuthorChange"
            />
            <Button
              v-if="activeEditingAuthorIndex >= 0"
              class="ml-[8px]"
              type="button"
              size="small"
              preset="tertiary"
              @click="deleteAuthor"
            >
              <IconDelete />
            </Button>
          </div>
        </Card>
      </Dialog>

      <Dialog
        v-model="isOpenSignDialog"
        :header-text="signDialogHeaderText"
        :is-disabled-backdrop-click="true"
        :has-close-button="!isUploadingArweave"
        @close="handleSignDialogClose"
      >
        <template #header-prepend>
          <IconStar class="w-[20px]" />
        </template>
        <ProgressIndicator
          v-if="isUploadingArweave"
          class="mx-auto mb-[24px]"
        />
        <div class="text-center text-medium-gray text-[24px] font-500">
          {{ signDialogMessage }}
        </div>
        <pre
          v-if="signDialogError"
          :class="[
            'mt-[12px]',
            'p-[8px]',
            'bg-red',
            'bg-opacity-20',
            'rounded-[8px]',
            'text-red',
            'text-[12px]',
            'font-400',
          ]"
          >{{ signDialogError }}</pre
        >
        <div v-if="isUploadingArweave">
          <Divider class="mt-[12px] mb-[8px]" />
          <span
            v-t="'IscnRegisterForm.signDialog.sign.arweave.uploading'"
            class="whitespace-pre-line"
          />
        </div>
        <template v-if="!isUploadingArweave">
          <Divider class="my-[12px]" />
          <Label
            class="text-[14px] font-400"
            :text="`${signDialogFee} / ${totalFee}`"
          >
            <template #prepend>
              <span
                v-t="'IscnRegisterForm.signDialog.fee'"
                class="min-w-[64px] mr-[8px] text-[12px] text-medium-gray font-semibold"
              />
            </template>
          </Label>
          <div class="flex justify-center mt-[24px]">
            <Button
              :preset="buttonState.preset"
              :text="buttonState.text"
              :is-disabled="buttonState.isDisable"
              @click="onRetry"
            />
          </div>
        </template>
      </Dialog>
      <Dialog
        v-model="isOpenQuitAlertDialog"
        :header-text="$t('IscnRegisterForm.quitAlertDialog.title')"
        :is-disabled-backdrop-click="true"
        :has-close-button="false"
      >
        <div
          v-t="'IscnRegisterForm.quitAlertDialog.content'"
          class="max-w-[336px] text-center text-medium-gray text-[16px] font-500"
        />
        <div
          class="mx-auto mt-[24px] grid grid-flow-col gap-x-[12px] text-center"
        >
          <Button
            preset="outline"
            class="text-red border-red hover:bg-red active:bg-red hover:bg-opacity-20 active:bg-opacity-30"
            :text="$t('IscnRegisterForm.quitAlertDialog.confirm')"
            @click="handleQuit"
          >
            <template #prepend>
              <IconBin v-if="isOpenQuitAlertDialog" class="w-[20px]" />
            </template>
          </Button>
          <Button
            preset="outline"
            :text="$t('IscnRegisterForm.quitAlertDialog.continue')"
            @click="handleContinue"
          />
        </div>
      </Dialog>
    </Card>
    <Snackbar v-model="shouldShowAlert" :text="errorMessage" preset="warn" />
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing'
import BigNumber from 'bignumber.js'
import debounce from 'lodash.debounce'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

import { Author } from '~/types/author'

import { signISCNTx } from '~/utils/cosmos/iscn'
import {
  estimateISCNTxGasAndFee,
  formatISCNTxPayload,
} from '~/utils/cosmos/iscn/sign'
import { ISCN_GAS_MULTIPLIER } from '~/constant'
import {
  getLikerIdMinApi,
  getUserInfoMinByAddress,
  API_POST_NUMBERS_PROTOCOL_ASSETS,
} from '~/constant/api'
import { getAccountBalance } from '~/utils/cosmos'
import { logTrackerEvent } from '~/utils/logger'

const walletModule = namespace('wallet')

export enum CharactersLimit {
  name = 100,
  description = 1600,
  tagContent = 35,
  tagNumber = 10,
  authorName = 100,
  authorDescription = 200,
  likerIdLeast = 7,
  likerId = 20,
  url = 2048,
  filename = 15,
}

export enum AuthorDialogType {
  author = 'author',
  stakeholder = 'stakeholder',
}

@Component
export default class IscnRegisterForm extends Vue {
  @Prop({ default: [] }) readonly fileRecords!: any[]
  @Prop({ default: [] }) readonly uploadArweaveList!: string[]
  @Prop() readonly epubMetadata!: any | null

  @Prop(String) readonly ipfsHash!: string
  @Prop(String) readonly arweaveId!: string
  @Prop(Number) readonly step: number | undefined

  @walletModule.Getter('getWalletAddress') address!: string
  @walletModule.Getter('getSigner') signer!: OfflineSigner | null
  @walletModule.Action('initIfNecessary') initIfNecessary!: () => Promise<any>

  typeOptions = [
    'Book',
    'Photo',
    'Image',
    'CreativeWork',
  ]

  fileTypeOptions = [
    'epub',
    'pdf',
    'audio',
    'jpg',
    'png',
  ]

  languageOptions = [
    'zh',
    'en',
  ]

  licenseMap: { [key: string]: string | null } = {
    'Copyright. All rights reserved.': 'All Rights Reserved',
    'CC BY-NC-ND': 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
    'CC BY-NC-SA': 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    'CC BY-NC': 'https://creativecommons.org/licenses/by-nc/4.0/',
    'CC BY-ND': 'https://creativecommons.org/licenses/by-nd/4.0/',
    'CC BY-SA': 'https://creativecommons.org/licenses/by-sa/4.0/',
    'CC BY': 'https://creativecommons.org/licenses/by/4.0/',
    'CC0 (Public Domain)': 'https://creativecommons.org/publicdomain/zero/1.0/',
    Other: null,
    'Not Specified': '',
  }

  author: Author = {
    name: '',
    url: [],
    wallet: [],
    likerId: '',
    authorDescription: '',
  }

  authors: Author[] = []
  name: string = ''
  description: string = ''
  tags: string[] = []
  sameAs: string[] = []
  url: string = ''
  isbn: string = ''
  license: string = this.licenseOptions[0]
  customLicense: string = ''
  thumbnailUrl: string = ''
  authorName: string = ''
  authorUrl: string[] = []
  authorWalletAddress: any[] = []
  sentArweaveTransactionHashes = new Map<
    string,
    { transactionHash?: string; arweaveId?: string }
  >()

  uploadStatus: string = ''
  error: string = ''
  likerId: string = ''
  likerIdsAddresses: string[] = []
  authorDescription: string = ''
  contentFingerprintInput: string = ''
  customContentFingerprints: string[] = []
  type: string = this.defaultType

  displayImageSrc: string = ''
  displayExifInfo: any = null

  arweaveFee = new BigNumber(0)
  iscnFee = new BigNumber(0)
  iscnGasFee = ''
  balance = new BigNumber(0)
  debouncedCalculateISCNFee = debounce(this.calculateISCNFee, 400)

  isRegisterNumbersProtocolAsset = false
  numbersProtocolAssetIds = new Map<string, string>()

  isOpenFileInfoDialog = false
  isOpenAuthorDialog = false
  isOpenWarningSnackbar = false
  isOpenWallet = true
  activeEditingAuthorIndex = -1

  isOpenSignDialog = false
  isOpenQuitAlertDialog = false
  isUploadingArweave = false
  signDialogError = ''
  shouldShowAlert = false
  errorMessage = ''

  checkedAuthorInfo = false
  isChecked = false
  charactersLimit = CharactersLimit

  currentAuthorDialogType: AuthorDialogType = AuthorDialogType.stakeholder
  sameAsList: any = []
  language: string = ''
  shouldShowMoreSettings: boolean = false

  get ipfsHashList() {
    const list = []
    if (this.ipfsHash) {
      list.push(this.ipfsHash)
    }
    list.push(...this.fileRecords.map((file) => file.ipfsHash))
    return list
  }

  get shouldShowContentFingerprintInput() {
    return !this.fileRecords.some((file) => file.fileData)
  }

  get tagsString(): string {
    return this.tags.join(',')
  }

  get authorNames() {
    return this.authors.map((a) => {
      if (a.name === this.$t('iscn.meta.stakeholders.name.placeholder')) {
        return 'ISCN Owner'
      }
      return a.name
    })
  }

  get authorUrls() {
    return this.authors.map((a) => a.url.map((b: any) => b.content))
  }

  get authorWalletAddresses() {
    return this.authors.map((a) =>
      a.wallet.map((b: any) => ({ address: b.content, type: b.type })),
    )
  }

  get likerIds() {
    return this.authors.map((a) => a.likerId)
  }

  get authorDescriptions() {
    return this.authors.map((a) => a.authorDescription)
  }

  get defaultType() {
    if (
      this.fileRecords.some(
        (file) =>
          file.fileType === 'application/pdf' ||
          file.fileType === 'application/epub+zip',
      )
    )
      return 'Book'
    if (
      this.fileRecords.some(
        (file) => file.exifInfo && file.exifInfo.ExifImageWidth,
      )
    )
      return 'Photo'
    if (this.fileRecords.some((file) => file.isFileImage)) return 'Image'
    return 'CreativeWork'
  }

  get defaultLanguage() {
    const containsOnlyASCII = (str: string) => /^[ -~]*$/.test(str)
    const epubLanguage = this.epubMetadata?.language;

    if (epubLanguage === 'zh' || epubLanguage === 'en') {
      return epubLanguage;
    }

    const titleContainsNonASCII = this.name && !containsOnlyASCII(this.name)
    const descriptionContainsNonASCII =
      this.description && !containsOnlyASCII(this.description)
    return titleContainsNonASCII || descriptionContainsNonASCII ? 'zh' : 'en'
  }

  get authorDialogTitle() {
    return this.currentAuthorDialogType === AuthorDialogType.author
      ? this.$t('IscnRegisterForm.title.editAuthor')
      : this.$t('IscnRegisterForm.title.editStakeholder')
  }

  get contentFingerprintLinks() {
    const array = []
    if (this.uploadArweaveIdList) {
      array.push(
        ...this.uploadArweaveIdList.map((id: string) => this.formatArweave(id)),
      )
    }
    if (this.ipfsHashList.length) {
      array.push(...this.ipfsHashList.map((ipfs) => this.formatIpfs(ipfs)))
    }
    if (this.customContentFingerprints.length) {
      array.push(...this.customContentFingerprints)
    }
    return array
  }

  get formattedSameAsList() {
    return this.sameAsList
      ?.filter((items: any) => items.filename && items.url)
      ?.map((sameAs: { filename: any; filetype: any; url: any }) => {
        if (sameAs.filename && sameAs.filetype) {
          return `${sameAs.url}?name=${sameAs.filename}.${sameAs.filetype}`
        }
        return ''
      })
  }

  get licenseOptions() {
    return Object.keys(this.licenseMap)
  }

  get formattedLicense() {
    return this.licenseMap[this.license] || this.customLicense
  }

  get errorMsg() {
    switch (this.error) {
      case 'INSUFFICIENT_BALANCE':
        return this.$t('IscnRegisterForm.error.insufficient_with_like', { like: this.totalFee })
      case 'MISSING_SIGNER':
        return this.$t('IscnRegisterForm.error.missingSigner')
      default:
        return ''
    }
  }

  get formattedUploadStatus() {
    switch (this.uploadStatus) {
      case 'loading':
        return this.$t('IscnRegisterForm.button.loading')

      case 'signing':
        return this.$t('IscnRegisterForm.button.signing')

      case 'uploading':
        return this.$t('IscnRegisterForm.button.uploading')

      case 'success':
        return this.$t('IscnRegisterForm.button.success')

      default:
        return this.$t('IscnRegisterForm.button.register')
    }
  }

  get formattedRegisterFee() {
    return this.$t('IscnRegisterForm.register.fee', { fee: this.totalFee })
  }

  get exif() {
    return this.fileRecords.map((file) => {
      const extension = file.fileType?.split('/')
      if (file.exifInfo) {
        return {
          ...file.exifInfo,
          Format: file.fileType,
          Size:
            file.exifInfo.ExifImageHeight && file.exifInfo.ExifImageWidth
              ? `${file.exifInfo.ExifImageHeight} x ${
                  file.exifInfo.ExifImageWidth
                } ${extension?.[extension.length - 1].toUpperCase()} (${
                  file.fileSize
                })`
              : file.fileSize,
        }
      }
      if (file.isFileImage || (file.exifInfo && file.exifInfo.ExifImageWidth)) {
        return {
          Format: file.fileType,
          Size: file.fileSize,
        }
      }
      return undefined
    })
  }

  get payload() {
    return {
      type: this.type,
      name: this.name,
      description: this.description,
      tagsString: this.tagsString,
      sameAs: this.formattedSameAsList,
      url: this.url,
      isbn: this.isbn,
      exifInfo: this.exif.filter((file) => file),
      license: this.formattedLicense,
      ipfsHash: this.ipfsHashList,
      arweaveId: this.uploadArweaveIdList,
      numbersProtocolAssetId: [...this.numbersProtocolAssetIds.values()],
      fileSHA256: this.fileRecords.map((file) => file.fileSHA256),
      author: this.author.name,
      authorNames: this.authorNames,
      authorUrls: this.authorUrls,
      authorWallets: this.authorWalletAddresses,
      likerIds: this.likerIds,
      likerIdsAddresses: this.likerIdsAddresses,
      authorDescriptions: this.authorDescriptions,
      contentFingerprints: this.customContentFingerprints,
      inLanguage: this.language,
      thumbnailUrl: this.thumbnailUrl,
    }
  }

  get totalFee() {
    return this.iscnFee
  }

  get currentSignStep() {
    if (this.arweaveFee.lte(0)) {
      return 1
    }
    return this.uploadArweaveIdList.length ? 2 : 1
  }

  get totalSignStep() {
    if (this.uploadArweaveIdList.length && this.arweaveFee.lte(0)) return 1
    return 2
  }

  get signDialogHeaderText() {
    if (this.isUploadingArweave)
      return this.$t('IscnRegisterForm.button.uploading')
    return `Sign (${this.currentSignStep}/${this.totalSignStep})`
  }

  get signDialogMessage() {
    if (this.isUploadingArweave) {
      return this.$t('IscnRegisterForm.signDialog.closeWarning')
    }
    if (this.uploadArweaveIdList.length) {
      return this.$t('IscnRegisterForm.signDialog.sign.iscn.register')
    }
    return this.$t('IscnRegisterForm.signDialog.sign.arweave.upload')
  }

  get signDialogFee() {
    return this.iscnFee
  }

  get buttonState() {
    return {
      preset: this.isOpenWallet ? 'tertiary' : 'outline',
      text: this.isOpenWallet
        ? this.$t('IscnRegisterForm.signDialog.wallet')
        : this.$t('IscnRegisterForm.signDialog.retry'),
      isDisable: this.isOpenWallet,
    }
  }

  get isMetadataReady() {
    return (
      this.name &&
      this.description &&
      this.name.length <= CharactersLimit.name &&
      this.description.length <= CharactersLimit.description
    )
  }

  get shouldShowUploadToNumbers() {
    return (
      this.type !== 'Book' &&
      this.fileRecords.some((file) => file.isFileImage || file.exifInfo)
    )
  }

  get uploadArweaveIdList() {
    let arweaveIdList: string[] = []
    if (this.uploadArweaveList && this.uploadArweaveList.length) {
      arweaveIdList = [...this.uploadArweaveList]
    }
    if (this.arweaveId) {
      arweaveIdList.push(this.arweaveId)
    }
    return arweaveIdList
  }

  get isBookType() {
    return this.type === 'Book'
  }

  @Watch('payload', { immediate: true, deep: true })
  change() {
    this.debouncedCalculateISCNFee()
  }

  @Watch('error')
  showWarning(errormsg: any) {
    if (errormsg) this.isOpenWarningSnackbar = true
  }

  @Watch('defaultLanguage', { immediate: true })
  setLanguageValue(value: any) {
    this.language = value
  }

  async mounted() {
    this.uploadStatus = 'loading'

    if (this.epubMetadata) {
      this.name = this.epubMetadata.title || ''
      this.description = this.extractText(this.epubMetadata.description)
      this.author.name = this.epubMetadata.author || ''
      this.author.authorDescription = 'Author'
      this.tags = this.epubMetadata.tags || []
      this.thumbnailUrl = this.formatArweave(
        this.epubMetadata.thumbnailArweaveId,
      ) as string
      if (this.author.name) {
        this.authors.push(this.author)
      }
    }

    if (this.address) {
      const iscnOwner = await this.fetchUserInfoByAddress(this.address)
      this.authors.push(iscnOwner)
    }
    // ISCN Fee needs Arweave fee to calculate
    await this.calculateISCNFee()
    this.uploadStatus = ''
  }

  async fetchUserInfoByAddress(address: any) {
    let userData: any = null
    try {
      ;({ data: userData } = await this.$axios.get(
        getUserInfoMinByAddress(address),
      ))
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
    return {
      name: userData?.displayName || address,
      wallet: [{ content: address, id: 1, type: 'like', isOpenOptions: false }],
      url: [],
      likerId: userData?.user || '',
      authorDescription: userData?.description || 'Publisher',
    }
  }

  addContentFingerprint() {
    this.customContentFingerprints.push(this.contentFingerprintInput)
    this.contentFingerprintInput = ''
  }

  handleOpenAuthorDialog({ type }: { type: AuthorDialogType }) {
    this.checkedAuthorInfo = false
    this.isOpenAuthorDialog = true
    this.initAuthorInfo()
    switch (type) {
      case AuthorDialogType.author:
        logTrackerEvent(this, 'ISCNCreate', 'OpenAuthorDialog', '', 1)
        this.currentAuthorDialogType = AuthorDialogType.author
        break

      case AuthorDialogType.stakeholder:
      default:
        logTrackerEvent(this, 'ISCNCreate', 'OpenStakeholderDialog', '', 1)
        this.currentAuthorDialogType = AuthorDialogType.stakeholder
        break
    }
  }

  editAuthor({
    type = AuthorDialogType.stakeholder,
    index,
  }: {
    type: AuthorDialogType
    index: any
  }) {
    this.isOpenAuthorDialog = true

    if (type === AuthorDialogType.author) {
      logTrackerEvent(this, 'ISCNCreate', 'EditAuthor', '', 1)
      const { name, wallet, url, likerId, authorDescription } = this.author
      this.authorName = name
      this.authorWalletAddress = wallet
      this.authorUrl = url
      this.likerId = likerId
      this.authorDescription = authorDescription
      this.activeEditingAuthorIndex = this.authors.findIndex(
        (author) => author.name === name,
      )
    } else {
      logTrackerEvent(
        this,
        'ISCNCreate',
        'EditStakeholder',
        index.toString(),
        1,
      )
      const { name, wallet, url, likerId, authorDescription } =
        this.authors[index]
      this.authorName = name
      this.authorWalletAddress = wallet
      this.authorUrl = url
      this.likerId = likerId
      this.authorDescription = authorDescription
      this.activeEditingAuthorIndex = index
    }
  }

  dismissAuthorDialog() {
    this.isOpenAuthorDialog = false
    this.activeEditingAuthorIndex = -1
    this.authorName = ''
    this.authorUrl = []
    this.authorWalletAddress = []
    this.likerId = ''
    this.authorDescription = ''
  }

  deleteAuthor() {
    this.authors.splice(this.activeEditingAuthorIndex, 1)
    this.dismissAuthorDialog()
  }

  confirmAuthorChange() {
    logTrackerEvent(this, 'ISCNCreate', 'ConfirmAuthorChange', '', 1)
    this.checkedAuthorInfo = true
    if (!this.authorName || this.authorName.length > CharactersLimit.authorName)
      return
    if (
      this.likerId &&
      (this.likerId.length < CharactersLimit.likerIdLeast ||
        this.likerId.length > CharactersLimit.likerId)
    )
      return
    this.authorWalletAddress.forEach((a: any, i: number) => {
      if (!a.content) {
        this.authorWalletAddress.splice(i, 1)
      }
    })
    const newAuthor = {
      name: this.authorName,
      wallet: this.authorWalletAddress,
      url: this.authorUrl,
      likerId: this.likerId,
      authorDescription: this.authorDescription,
    }
    if (this.currentAuthorDialogType === AuthorDialogType.author) {
      this.author = newAuthor
    }
    if (this.activeEditingAuthorIndex >= 0) {
      this.authors.splice(this.activeEditingAuthorIndex, 1, newAuthor)
    } else {
      this.authors.push(newAuthor)
    }
    this.dismissAuthorDialog()
  }

  initAuthorInfo() {
    this.authorName = ''
    this.authorWalletAddress = []
    this.authorUrl = []
    this.likerId = ''
    this.authorDescription = ''
    this.activeEditingAuthorIndex = -1
  }

  setAuthorName(value: string) {
    this.authorName = value
  }

  setType(value: string) {
    this.type = value
  }

  setLanguage(value: string) {
    this.language = value
  }

  setLicense(value: string) {
    this.license = value
  }

  formatIpfs(ipfsHash: string) {
    return this.$t('IscnRegisterForm.ipfs.link', { hash: ipfsHash })
  }

  formatArweave(arweaveId: string) {
    return this.$t('IscnRegisterForm.arweave.link', { arweaveId })
  }

  async getLikerIdsAddresses() {
    let likerIdsAddresses: any[] = []
    try {
      likerIdsAddresses = await Promise.all(
        this.likerIds.map((e) =>
          this.$axios
            .get(getLikerIdMinApi(e as string))
            .then((element: any) => element?.data?.likeWallet)
            .catch(() => {}),
        ),
      )
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
    }
    return likerIdsAddresses
  }

  async calculateISCNFee(): Promise<void> {
    const [
balance,
estimation,
] = await Promise.all([
      getAccountBalance(this.address),
      estimateISCNTxGasAndFee(formatISCNTxPayload(this.payload)),
    ])
    this.balance = new BigNumber(balance)
    const { iscnFee, gas: iscnGasEstimation } = estimation
    const iscnGasNanolike = new BigNumber(
      iscnGasEstimation.fee.amount[0].amount,
    ).times(ISCN_GAS_MULTIPLIER)
    const iscnFeeNanolike = iscnFee.amount
    this.iscnFee = new BigNumber(iscnFeeNanolike)
      .plus(iscnGasNanolike)
      .shiftedBy(-9)
    this.iscnGasFee = new BigNumber(iscnGasEstimation.fee.gas)
      .times(ISCN_GAS_MULTIPLIER)
      .toFixed(0)
  }

  handleSignDialogClose() {
    logTrackerEvent(this, 'ISCNCreate', 'CloseSignDialog', '', 1)
    this.isOpenQuitAlertDialog = true
  }

  handleContinue() {
    logTrackerEvent(this, 'ISCNCreate', 'ContinueDialog', '', 1)
    this.isOpenQuitAlertDialog = false
    this.isOpenSignDialog = true
    this.onRetry()
  }

  handleQuit() {
    logTrackerEvent(this, 'ISCNCreate', 'QuitDialog', '', 1)
    this.isOpenQuitAlertDialog = false
    this.uploadStatus = ''
    this.$emit('handleQuit')
  }

  onRetry(): Promise<void> {
    logTrackerEvent(this, 'ISCNCreate', 'RetryDialog', '', 1)
    this.shouldShowAlert = false
    this.signDialogError = ''
    this.onOpenKeplr()
    return this.onSubmit()
  }

  onOpenKeplr() {
    logTrackerEvent(this, 'ISCNCreate', 'OpenKeplr', '', 1)
    this.isOpenWallet = true
  }

  validateField(
    val: any,
    limit: number,
    required: boolean = false,
    least: number = 0,
  ) {
    if (required && !val && (this.isChecked || this.checkedAuthorInfo)) {
      return this.$t('IscnRegisterForm.error.requiredField')
    }
    if (val && val.length > limit) {
      return this.$t('IscnRegisterForm.warning.exceeded', {
        current: val.length,
        limit,
      })
    }
    if (val && least > 0 && val.length < least) {
      return this.$t('IscnRegisterForm.warning.shortage', {
        least,
      })
    }
    return undefined
  }

  async onSubmit(): Promise<void> {
    logTrackerEvent(this, 'ISCNCreate', 'ClickSubmit', '', 1)
    this.likerIdsAddresses = await this.getLikerIdsAddresses()
    this.$emit('handleSubmit')
    this.isChecked = true
    if (!this.isMetadataReady) return
    this.error = ''
    this.signDialogError = ''
    if (this.balance.lt(this.totalFee)) {
      this.error = 'INSUFFICIENT_BALANCE'
      this.isOpenWarningSnackbar = true
      this.uploadStatus = ''
      return
    }
    if (this.fileRecords.some((file) => file.fileBlob)) {
      try {
        this.isUploadingArweave = true
        this.uploadStatus = 'uploading'
        // eslint-disable-next-line no-restricted-syntax
        for (const record of this.fileRecords) {
          // eslint-disable-next-line no-await-in-loop
          if (
            this.isRegisterNumbersProtocolAsset &&
            !this.numbersProtocolAssetIds.has(record.ipfsHash)
          ) {
            // eslint-disable-next-line no-await-in-loop
            await this.submitToNumbers(record)
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error)
      } finally {
        this.isUploadingArweave = false
        this.uploadStatus = ''
      }
    }
    if (
      !this.fileRecords.some((file) => file.fileBlob) ||
      this.uploadArweaveIdList.length
    )
      await this.submitToISCN()
  }

  async submitToNumbers(record: any): Promise<void> {
    logTrackerEvent(this, 'ISCNCreate', 'SubmitToNumbers', '', 1)
    this.isOpenSignDialog = true
    try {
      this.uploadStatus = 'loading'
      const formData = new FormData()
      if (record.fileBlob) formData.append('file', record.fileBlob)
      const {
        numAssetIds: [numbersProtocolAssetId],
      } = await this.$axios.$post(
        `${API_POST_NUMBERS_PROTOCOL_ASSETS}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )
      this.numbersProtocolAssetIds.set(record.ipfsHash, numbersProtocolAssetId)
      this.$emit('numbers-protocol-registed', { numbersProtocolAssetId })
      this.isOpenSignDialog = false
    } catch (error) {
      this.shouldShowAlert = true
      this.errorMessage = (error as Error).toString()
      // eslint-disable-next-line no-console
      console.error(error)
    } finally {
      this.uploadStatus = ''
    }
  }

  async submitToISCN(): Promise<void> {
    logTrackerEvent(this, 'ISCNCreate', 'SubmitToISCN', '', 1)
    this.isOpenSignDialog = true
    this.uploadStatus = 'loading'
    this.onOpenKeplr()
    await this.initIfNecessary()
    await this.calculateISCNFee()
    if (this.balance.lt(this.iscnFee)) {
      this.error = 'INSUFFICIENT_BALANCE'
      this.uploadStatus = ''
      return
    }
    if (!this.signer) {
      this.error = 'MISSING_SIGNER'
      this.uploadStatus = ''
      return
    }
    try {
      this.uploadStatus = 'signing'
      const res = await signISCNTx(
        formatISCNTxPayload(this.payload),
        this.signer,
        this.address,
        { gas: this.iscnGasFee },
      )
      this.uploadStatus = 'success'
      this.$emit('txBroadcasted', res)
      this.isOpenSignDialog = false
    } catch (err) {
      this.signDialogError = err as string
      this.uploadStatus = ''
      // TODO: Handle error
      // eslint-disable-next-line no-console
      console.error(err)
    } finally {
      this.isOpenQuitAlertDialog = false
    }
  }

  handleClickExifInfo(index: number) {
    this.isOpenFileInfoDialog = true
    this.displayImageSrc = this.fileRecords[index].fileData
    this.displayExifInfo = this.fileRecords[index].exifInfo
  }

  // eslint-disable-next-line class-methods-use-this
  extractText(htmlString: string) {
    if (!htmlString) return ''
    const div = document.createElement('div')
    div.innerHTML = htmlString
    div.innerHTML = div.innerHTML.replace(/<br\s*[/]?>/gi, '\n')
    return div.textContent || div.innerText
  }
}
</script>
