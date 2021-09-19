<template>
  <div>
    <div
      v-for="(items, i) in value"
      :key="items.id"
      class="flex flex-row items-center justify-center"
    >
      <button
        :class="[
          'h-[40px]',
          'w-min',
          'block',
          'relative',
          'px-[12px]',
          'mr-[4px]',
          'bg-shade-gray',
          'rounded-[12px]',
          'box-border',
          'outline-none',
          items.isOpenOptions ? 'bg-medium-gray' : 'hover:bg-light-gray',
          'transition',
          'duration-150',
          'cursor-pointer',
        ]"
        @blur="items.isOpenOptions = false"
      >
        <div
          class="
            h-[100%]
            w-[100%]
            flex flex-row
            items-center
            justify-center
          "
          @click="
            items.isOpenOptions = !items.isOpenOptions
            isSelecting = !isSelecting"
        >
          <div class="w-[20px] mx-[8px]">
            <IconLike v-if="items.type === 'cosmos'" />
            <IconEthereum v-if="items.type === 'eth'" />
          </div>
          <IconArrowDown />
        </div>
        <div
          v-if="items.isOpenOptions"
          class="
            w-[100%]
            absolute
            z-[2500]
            flex
            flex-col
            justify-center
            items-center
            buttom-0
            left-0
            p-[12px]
            mt-[4px]
            text-dark-gray
            text-left
            bg-shade-gray
            rounded-[12px]
            cursor-pointer
          "
        >
          <div
            :class="optionsClass"
            @click="handleSelectType('cosmos',i)"
          >
            <IconLike />
          </div>
          <div
            :class="optionsClass"
            @click="handleSelectType('eth',i)"
          >
            <IconEthereum />
          </div>
        </div>
      </button>
      <TextField
        v-model="items.content"
        :size="40"
        :class="['my-[4px]', 'flex-grow']"
        :placeholder="items.type === 'cosmos' ? 'comos....' : '0x.....'"
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
import { Vue, Component, Model } from 'vue-property-decorator'

@Component
export default class WalletFieldList extends Vue {
  @Model('type', { type: Array, default: () => [] }) value!: Array<any>

  isSelecting: boolean = false
  inputValue: any = [
    {
      content: '',
      id: 1,
      type: 'cosmos',
      isOpenOptions: false,
    },
  ]

  created() {
    this.inputValue.content = this.value
    if (!this.value.length) {
      this.value.push({
        content: '',
        id: 1,
        type: 'cosmos',
        isOpenOptions: false,
      })
    }
  }

  get optionsClass() {
    return [
      'w-[100%]',
      'flex',
      'items-center',
      'justify-center',
      'mb-[6px]',
      'pt-[10px]',
      'pb-[10px]',
      'rounded-[6px]',
      'hover:bg-light-gray',
      'active:bg-medium-gray',
      'transition',
      'duration-100',
      this.isSelecting,
    ]
  }

  handleSelectType(type: string, index: number) {
    this.value[index].type = type
    this.value[index].isOpenOptions = false
  }

  addFields() {
    this.value.push({
      content: '',
      id: Date.now(),
      type: 'cosmos',
      isOpenOptions: false,
    })
  }

  deleteEmptyField() {
    if (this.value.length > 1) {
      this.value.forEach((items: any, i: number) => {
        if (!items.content) {
          this.value.splice(i, 1)
        }
      })
    }
  }

  deleteField(index: number) {
    this.value.splice(index, 1)
  }
}
</script>
