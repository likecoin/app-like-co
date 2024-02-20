<template>
  <div class="flex flex-col w-full">
    <div
      v-for="(item, i) in sameAsList"
      :key="item.id"
      class="flex items-center gap-[12px] p-[8px] rounded-[8px] border-2 border-shade-gray mb-[12px]"
    >
      <div class="flex flex-col flex-grow">
        <div class="flex items-center justify-start gap-[8px]">
          <FormField class="w-[200px]" :label="$t('IscnRegisterForm.label.fileName')">
            <TextField
              v-model="item.filename"
              :placeholder="$t('IscnRegisterForm.placeholder.fileName')"
            />
          </FormField>
          <FormField class="w-min" :label="$t('IscnRegisterForm.label.fileType')">
            <Selector
              class="h-[40px] w-[80px]"
              :options="sameAsFiletypeOptions"
              :placeholder="item.filetype || sameAsFiletypeOptions[0]"
              @input="(value) => handleSelectValue({ value, index: i })"
            />
          </FormField>
        </div>
         <FormField :label="$t('IscnRegisterForm.label.url')">
          <div class="flex flex-col gap-[8px]">
            <TextField
              v-model="item.url"
              :placeholder="$t('IscnRegisterForm.placeholder.url')"
            />
          </div>
        </FormField>
      </div>
      <div
        class="self-end flex-shrink ml-auto cursor-pointer"
        @click="deleteField(i)"
      >
        <IconDelete />
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
  }]

  @Watch('sameAsList', { deep: true })
  onSameAsListChanged(newValue: Array<any>) {
    this.$emit('on-update', newValue);
  }

  // eslint-disable-next-line class-methods-use-this
  get sameAsFiletypeOptions() {
    return SAME_AS_FILE_TYPES
  }

  get formatName() {
    if (!this.name) {
      return '';
    }
    if (/[\u4E00-\u9FA5]/.test(this.name)) {
      return this.name;
    }
      return this.name.replace(/[.,!?;:'"(){}[\]<>]/g, '').replace(/\s+/g, '_').toUpperCase();
  }

  get filteredUrlOptions() {
    return this.urlOptions?.filter(url => url.startsWith('ar://'))
  }

  mounted() {
    if (this.currentList.length) {
      this.sameAsList = this.currentList.map((list) => ({
        url: list.url,
        id: `${list.url}-${list.filename}`,
        filename: list.filename,
        filetype: list.filetype || SAME_AS_FILE_TYPES[0],
      }))
    } else if (this.filteredUrlOptions.length) {
      this.sameAsList = this.fileRecords
        ?.filter((file) => FILE_TYPES.includes(this.formatFileType(file.fileType)) && file.arweaveId)
        .map((file, index) => {
          const url = this.filteredUrlOptions.find((ar) => ar.includes(file.arweaveId));
          const formattedFileType = this.formatFileType(file.fileType);
          return {
            url,
            id: `${url}-${index}`,
            filename: this.extractFilename(file.fileName),
            filetype: formattedFileType || SAME_AS_FILE_TYPES[0],
          };
        });
    } else {
      this.sameAsList = [{
          url: '',
          id: 1,
          filename: this.formatName,
          filetype: SAME_AS_FILE_TYPES[0],
        }]
    }
  }

  handleSelectValue({ value, index }: { value: string; index: number }) {
    this.sameAsList[index].filetype = value
  }

  addFields() {
    this.sameAsList.push({
      url: '',
      id: Date.now(),
      filename: '',
      filetype: SAME_AS_FILE_TYPES[0],
    })
  }

  deleteField(index: number) {
    this.sameAsList.splice(index, 1)
  }

  // eslint-disable-next-line class-methods-use-this
  extractFilename(fullFilename: string) {
    if(!fullFilename) return ''
    const parts = fullFilename.split('.')
    if (parts.length === 1) {
      return fullFilename
    }
    return parts.slice(0, -1)
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
