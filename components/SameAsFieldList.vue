<template>
  <div class="flex flex-col w-full">
    <div
      v-for="(item, i) in sameAsList"
      :key="item.id"
      class="flex flex-col items-center gap-[12px] p-[12px] rounded-[8px] border-2 border-shade-gray mb-[12px]"
    >
      <div class="flex flex-col flex-grow w-full">
        <div class="flex items-center justify-start gap-[8px]">
          <FormField
            class="w-[200px]"
            :label="$t('IscnRegisterForm.label.fileName')"
          >
            <TextField
              v-model="item.filename"
              :placeholder="$t('IscnRegisterForm.placeholder.fileName')"
            />
          </FormField>
          <FormField
            class="w-min"
            :label="$t('IscnRegisterForm.label.fileType')"
          >
            <Selector
              class="h-[40px] w-[80px]"
              :options="sameAsFiletypeOptions"
              :placeholder="item.filetype || sameAsFiletypeOptions[0]"
              @input="(value) => handleSelectValue({ value, index: i })"
            />
          </FormField>
        </div>
        <div class="flex justify-start items-center gap-[8px]">
          <FormField :label="$t('IscnRegisterForm.label.url')">
            <div
              v-if="item.shouldShowEditURL"
              class="flex justify-between items-center gap-[8px]"
            >
              <TextField
                v-model="item.url"
                :placeholder="$t('IscnRegisterForm.placeholder.url')"
                class="w-full"
                @blur="item.shouldShowEditURL = false"
              />
            </div>
            <div v-else class="flex items-center justify-start">
              <ContentFingerprintLink :item="item.url" />
              <Button
                preset="plain"
                @click.prevent="() => (item.shouldShowEditURL = true)"
              >
                <template #prepend>
                  <IconEdit />
                </template>
              </Button>
            </div>
          </FormField>
        </div>
      </div>
      <div
        class="self-center flex-shrink ml-auto cursor-pointer"
        @click="deleteField(i)"
      >
        <IconClose />
      </div>
    </div>
    <Button
      class="mx-auto my-[4px]"
      preset="secondary"
      text-preset="p6"
      size="mini"
      prepend-class="mr-[4px]"
      @click.prevent="addFields"
    >
      <template #prepend>
        <IconAddMini />
      </template>
    </Button>
  </div>
</template>


<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { SAME_AS_FILE_TYPES } from '~/constant'
import { LIKE_CO_API_ROOT } from '~/constant/api'

const FILE_TYPES = [
'epub',
'pdf',
]

@Component
export default class SameAsFieldList extends Vue {
  @Prop({
    default: () => [],
  })
  readonly urlOptions!: Array<any>

  @Prop({ default: () => [] }) readonly currentList!: Array<any>
  @Prop({ default: () => [] }) readonly fileRecords!: Array<any>
  @Prop(String) readonly name!: string | undefined

  sameAsList: any = [{
      url: '',
      id: 1,
      filename: this.formatName,
      filetype: SAME_AS_FILE_TYPES[0],
      shouldShowEditURL: !this.formatName,
    }]

  @Watch('sameAsList', { deep: true })
  onSameAsListChanged(newValue: Array<any>) {
    this.$emit('on-update', newValue)
  }

  @Watch('urlOptions', { deep: true })
  onUrlOptionsChanged(newValue: Array<any>) {
    console.log('urlOptions', newValue)
    this.setUrlList()
  }

  // eslint-disable-next-line class-methods-use-this
  get sameAsFiletypeOptions() {
    return SAME_AS_FILE_TYPES
  }

  get formatName() {
    if (!this.name) {
      return ''
    }
    if (/[\u4E00-\u9FA5]/.test(this.name)) {
      return this.name
    }
    return this.name
      .replace(/[.,!?;:'"(){}[\]<>]/g, '')
      .replace(/\s+/g, '_')
      .toUpperCase()
  }

  get filteredUrlOptions() {
    return this.urlOptions?.filter((url) => url.startsWith('ar://') || url.startsWith(LIKE_CO_API_ROOT))
  }

  mounted() {
    if (this.currentList.length) {
      this.sameAsList = this.currentList.map((list) => ({
        url: list.url,
        id: `${list.url}-${list.filename}`,
        filename: list.filename,
        filetype: list.filetype || SAME_AS_FILE_TYPES[0],
        shouldShowEditURL: !list.filename,
      }))
    } else {
      this.setUrlList();
    }
  }

  setUrlList() {
    if (this.filteredUrlOptions.length) {
      this.sameAsList = this.fileRecords
        ?.filter(
          (file) =>
            FILE_TYPES.includes(this.formatFileType(file.fileType)) &&
            (file.arweaveId || file.arweaveLink),
        )
        .map((file, index) => {
          const url = this.filteredUrlOptions.find((ar) =>
            ar.includes(file.arweaveId) || ar === file.arweaveLink,
          )
          const formattedFileType = this.formatFileType(file.fileType)
          return {
            url,
            id: `${url}-${index}`,
            filename: this.extractFilename(file.fileName),
            filetype: formattedFileType || SAME_AS_FILE_TYPES[0],
            shouldShowEditURL: !file.fileName,
          }
        })
    }
  }

  handleSelectValue({ value, index }: { value: string; index: number }) {
    this.sameAsList[index].filetype = value
  }

  addFields() {
    this.sameAsList.forEach((item: any) => {
      // eslint-disable-next-line no-param-reassign
      item.shouldShowEditURL = false
    })
    this.sameAsList.push({
      url: '',
      id: Date.now(),
      filename: '',
      filetype: SAME_AS_FILE_TYPES[0],
      shouldShowEditURL: true,
    })
  }

  deleteField(index: number) {
    this.sameAsList.splice(index, 1)
    this.sameAsList.forEach((item: any) => {
      // eslint-disable-next-line no-param-reassign
      item.shouldShowEditURL = false
    })
  }

  // eslint-disable-next-line class-methods-use-this
  extractFilename(fullFilename: string): string {
    if (!fullFilename) return '';
    const parts = fullFilename.split('.');
    if (parts.length === 1 || (parts[0] === '' && parts.length === 2)) {
        return fullFilename;
    }
    return parts.slice(0, -1).join('.');
}

  // eslint-disable-next-line class-methods-use-this
  formatFileType(fileType: string) {
    let formattedFileType = ''
    if (fileType) {
      switch (true) {
        case fileType.includes('jpg'):
        case fileType.includes('jpeg'):
          formattedFileType = 'jpg'
          break
        case fileType.includes('png'):
          formattedFileType = 'png'
          break
        case fileType.includes('audio'):
          // audio/ogg
          formattedFileType = 'audio'
          break
        case fileType.includes('pdf'):
          formattedFileType = 'pdf'
          break
        case fileType.includes('epub'):
          formattedFileType = 'epub'
          break
        default:
          formattedFileType = ''
          break
      }
    }
    return formattedFileType
  }
}
</script>
