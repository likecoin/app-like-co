<template>
  <div :class="['flex', 'flex-row', 'flex-wrap', 'items-center']">
    <div
      v-for="(chip, i) of chips"
      :key="chip"
      :class="[
        'flex',
        'flex-row',
        'items-center',
        'bg-like-cyan-light',
        'py-[6px]',
        'px-[20px]',
        'mr-[8px]',
        'mb-[4px]',
        'text-[12px]',
        'text-like-green',
        'font-semibold',
        'rounded-[16px]',
      ]"
      @mouseover="shouldShowClose = i"
      @mouseleave="shouldShowClose = null"
    >
      {{ chip }}
      <span
        v-if="shouldShowClose === i"
        :class="[
          'ml-1',
          'cursor-pointer',
        ]"
        @click="deleteChip(i)"
        ><IconClose
      /></span>
    </div>
    <button
      v-if="!shouldShowInput"
      type="button"
      :class="[
        'bg-like-cyan-light',
        'min-h-[30px]',
        'py-[6px]',
        'px-[20px]',
        'mr-[8px]',
        'mb-[4px]',
        'text-[12px]',
        'text-like-green',
        'font-semibold',
        'rounded-[16px]',
      ]"
      @click="showInput"
    >
      <IconAdd-mini />
    </button>
    <div class="relative">
      <input
        v-if="shouldShowInput"
        ref="input"
        v-model="currentInput"
        :class="[
          'absolute',
          'py-[6px]',
          'px-[20px]',
          'mb-[4px]',
          'text-[12px]',
          { 'text-transparent': currentInput.length },
          'bg-transparent',
          'outline-none',
        ]"
        @keypress.enter="saveChip"
        @keydown.delete="backspaceDelete"
        @blur="blurInput"
      />
      <div
        v-if="shouldShowInput"
        :class="[
          'top-0',
          'left-0',
          'min-h-[30px]',
          'bg-shade-gray',
          'py-[6px]',
          'px-[20px]',
          'mb-[4px]',
          'text-[12px]',
          'rounded-[16px]',
        ]"
      >
        {{ currentInput }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class InputChips extends Vue {
  // Text of the button

  chips: Array<String> = []
  currentInput: String = ''
  shouldShowInput: Boolean = false
  shouldShowClose: any = null

  $refs!: {
    input: HTMLInputElement
  }

  showInput() {
    this.shouldShowInput = true
    Vue.nextTick(() => this.$refs.input.focus())
  }

  blurInput() {
    this.currentInput.length ? this.saveChip() : (this.shouldShowInput = false)
  }

  saveChip() {
    const { chips, currentInput } = this
    chips.push(currentInput)
    this.currentInput = ''
  }

  deleteChip(index: number) {
    this.chips.splice(index, 1)
  }

  backspaceDelete() {
    this.currentInput === '' && this.chips.splice(this.chips.length - 1)
  }
}
</script>
