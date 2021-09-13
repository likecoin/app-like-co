<template>
  <div>
    <div
      v-for="(items, i) in value"
      :key="items.key"
      :class="['flex', 'flex-row', 'items-center', 'justify-center']"
    >
      <div v-if="$slots.prepend" class="mr-[4px]">
        <slot name="prepend" />
      </div>
      <TextField
        v-model="items.content"
        :size="40"
        :class="['my-[4px]', 'flex-grow']"
        :placeholder="placeholder"
        @delete-empty-field="deleteEmptyField"
      />
      <span
        v-if="value.length > 1"
        :class="['ml-[12px]', 'cursor-pointer']"
        @click="deleteField(i)"
        ><IconCloseMini
      /></span>
    </div>
    <Button
      class="mx-auto my-[4px]"
      preset="secondary"
      text-preset="p6"
      :text="text"
      size="mini"
      prepend-class="mr-[4px]"
      @click="addFields"
    >
      <template #prepend>
        <IconAddMini />
      </template>
    </Button>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Model, Watch } from 'vue-property-decorator'

@Component
export default class TextFieldList extends Vue {
  @Prop(String) readonly text!: String
  @Prop(String) readonly placeholder!: String
  @Prop(String) readonly textPreset!: String
  @Prop(String) readonly labelTag!: String
  @Prop({default:false}) readonly confirm!: boolean

  @Model('change', { type: Array, default: () => [] }) value!: Array<object>

  created() {
    this.inputValue = this.value
    if(!this.value.length){
      this.value.push({
      content: '',
    })
    }
  }

  @Watch('authorUrl')
  onValueChange() {
    this.inputValue = this.value
  }

  inputValue: any = [{content: ''}]

  addFields() {
    this.deleteEmptyField()
    this.value.push({
      content: '',
    })
    console.log(this.value)
  }

  deleteEmptyField() {
    if (this.value.length > 1) {
      this.value.forEach((items: any, i: number) => {
        if (!items.content) {
          this.value.splice(i, 1)
        }
      })
    }
    this.emitChange()
  }

  deleteField(index: number) {
    this.value.splice(index, 1)
    this.emitChange()
  }

  emitChange() {
    this.$emit('change', this.value)
  }
}
</script>
