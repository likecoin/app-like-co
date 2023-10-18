<template>
  <div class="flex flex-col w-full">
    <div
      v-for="(item, i) in sameAsList"
      :key="item.id"
      class="flex items-center gap-[12px] p-[8px] rounded-[8px] border-2 border-shade-gray mb-[12px]"
    >
      <div class="flex flex-col flex-grow">
        <FormField :label="$t('IscnRegisterForm.label.url')">
          <div class="flex flex-col gap-[8px]">
            <TextField
              v-model="item.url"
              :placeholder="$t('IscnRegisterForm.placeholder.url')"
            />
          </div>
        </FormField>

        <div class="flex items-center justify-start gap-[8px]">
          <FormField :label="$t('IscnRegisterForm.label.fileName')">
            <TextField
              v-model="item.filename"
              :placeholder="$t('IscnRegisterForm.placeholder.fileName')"
            />
          </FormField>
          <FormField :label="$t('IscnRegisterForm.label.fileType')">
            <Selector
              class="h-[40px] w-[80px]"
              :options="filetypeOptions"
              :placeholder="item.filetype || filetypeOptions[0]"
              @input="(value) => handleSelectValue({ value, index: i })"
            />
          </FormField>
        </div>
      </div>
      <div
        v-if="sameAsList.length > 1"
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
      @click="addFields"
    >
      <template #prepend>
        <IconAddMini />
      </template>
    </Button>

    <Button
      class="ml-auto mt-[24px]"
      type="button"
      size="small"
      preset="secondary"
      content-class="font-semibold"
      :text="$t('IscnRegisterForm.button.confirm')"
      @click.prevent="confirmChange"
    />
  </div>
</template>


<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { FILE_TYPES } from '~/constant'

@Component
export default class WalletFieldList extends Vue {
  @Prop({
    default: () => [],
  })
  readonly urlOptions!: Array<any>

  @Prop({ default: () => [] }) readonly currentList!: Array<any>
  @Prop(String) readonly name!: string | undefined

  sameAsList: any = [{
      url: '',
      id: 1,
      filename: this.formatName,
      filetype: FILE_TYPES[0],
    }]

  // eslint-disable-next-line class-methods-use-this
  get filetypeOptions() {
    return FILE_TYPES
  }

  get formatName(){
    return this.name ? this.name.toUpperCase() : ''
  }

  mounted() {
    if (this.currentList.length) {
      this.sameAsList = this.currentList.map((list) => ({
        url: list.url,
        id: `${list.url}-${list.filename}`,
        filename: list.filename,
        filetype: list.filetype || FILE_TYPES[0],
      }))
    } else if (this.urlOptions.length) {
      this.sameAsList = this.urlOptions.map((url, index) => ({
        url,
        id: `${url}-${index}`,
        filename: this.formatName,
        filetype: FILE_TYPES[0],
      }))
    } else {
      this.sameAsList = [{
          url: '',
          id: 1,
          filename: this.formatName,
          filetype: FILE_TYPES[0],
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
      filetype: FILE_TYPES[0],
    })
  }

  deleteEmptyField() {
    if (this.sameAsList.length > 1) {
      this.sameAsList = this.sameAsList.filter(
        (items: any) => items.filename && items.url,
      )
    }
  }

  deleteField(index: number) {
    this.sameAsList.splice(index, 1)
  }

  confirmChange() {
    this.deleteEmptyField()
    this.$emit('onConfirm', this.sameAsList)
  }
}
</script>
