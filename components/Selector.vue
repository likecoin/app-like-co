<template>
  <div class="flex items-stretch border-[2px] border-medium-gray rounded-[12px] hover:bg-light-gray">
    <button :class="selectorWrapper" type="button" @blur.prevent="isOpenOptions = false">
      <div
        class="flex items-center justify-between whitespace-nowrap px-[12px]"
        @click.prevent="isOpenOptions = !isOpenOptions"
      >
        {{ currentValue }}
        <IconArrowDown />
      </div>
      <div
        v-if="isOpenOptions && options.length"
        class="
          absolute
          bg-white
          border-shade-gray border-[1px]
          rounded-[24px]
          text-dark-gray text-left
          mt-[8px]
          p-[12px]
          z-50
        "
      >
        <div
          v-for="(option, i) of options"
          :key="i"
          class="
            pt-[4px]
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
  </div>
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
  value: string = ''

  get selectorWrapper() {
    return [
      'w-[100%]',
      'block',
      'relative',
      'rounded-[12px]',
      {
        'text-left': this.placeholder,
      },
      'outline-none',
      'transition',
      'duration-150',
      'cursor-pointer',
    ]
  }

  get currentValue(){
    return this.value || this.placeholder
  }


  handleSelectValue(value: string) {
    this.isOpenOptions = false
    this.value = value
    this.$emit('input', value)

  }
}
</script>
