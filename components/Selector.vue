<template>
  <button :class="selectorWapper" @blur="isOpenOptions = false">
    <div
      class="h-[100%] w-[100%] flex flex-row items-center justify-center"
      @click="isOpenOptions = !isOpenOptions"
    >
      {{ placeholder }}
      <IconArrowDown />
    </div>
    <div
      v-if="isOpenOptions && options.length"
      class="
        w-[280px]
        absolute
        buttom-0
        bg-white
        border-shade-gray border-[1px]
        rounded-[24px]
        text-dark-gray text-left
        mt-[8px]
        p-[24px]
      "
    >
      <div
        v-for="(option, i) of options"
        :key="i"
        class="
          pt-[4px]
          pl-[4px]
          pr-[4px]
          transition
          duration-100
          cursor-pointer
          hover:bg-light-gray
          active:bg-shade-gray
        "
        @click="handleSelectValue(option)"
      >
        <div class="py-[8px]">{{ option }}</div>
        <IconDiver v-if="i !== options.length - 1" />
      </div>
    </div>
  </button>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Selector extends Vue {
  @Prop({ default: () => [] }) readonly options: Array<string> | undefined

  @Prop(String) readonly placeholder: string | undefined

  @Prop([
    String,
    Array,
  ]) readonly contentClass!: string | [] | undefined

  isOpenOptions: boolean = false
  selected: string = ''

  get selectorWapper() {
    return [
      'block',
      'relative',
      'bg-shade-gray',
      'rounded-[12px]',
      {
        'text-left': this.placeholder,
      },
      this.isOpenOptions ? 'bg-medium-gray' : 'hover:bg-light-gray',
      'outline-none',
      'transition',
      'duration-150',
      'cursor-pointer',
    ]
  }

  handleSelectValue(value: string) {
    this.isOpenOptions = false
    this.$emit('input', value)
  }
}
</script>
