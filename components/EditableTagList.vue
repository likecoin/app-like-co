<template>
  <div :class="['flex', 'flex-row', 'flex-wrap', 'items-center']">
    <div
      v-for="(tag, i) of tags"
      :key="tag"
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
      @mouseleave="shouldShowClose = -1"
    >
      {{ tag }}
      <span
        v-if="shouldShowClose === i"
        :class="[
          'ml-1',
          'cursor-pointer',
        ]"
        @click="deleteChip(i)"
      ><IconCloseMini/></span>
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
      <IconAddMini />
    </button>
    <form class="relative" @submit.prevent="saveChip">
      <input
        v-if="shouldShowInput"
        ref="input"
        v-model="currentInput"
        type="text"
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
    </form>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Model, Watch } from 'vue-property-decorator'

@Component
export default class EditableTagList extends Vue {
  @Model('change', { type: Array, default: () => [] }) value!: Array<string>

  tags: Array<string> = []
  currentInput: string = ''
  shouldShowInput: boolean = false
  shouldShowClose: number = -1

  $refs!: {
    input: HTMLInputElement
  }

  created() {
    this.tags = this.value
  }

  @Watch('value')
  onValueChange() {
    this.tags = this.value
  }

  showInput() {
    this.shouldShowInput = true
    this.$nuxt.$nextTick(() => this.$refs.input.focus())
  }

  blurInput() {
    if (this.currentInput.length) {
      this.saveChip()
      this.$nuxt.$nextTick(() => this.$refs.input.focus())
    } else {
      this.shouldShowInput = false
    }
  }

  saveChip() {
    if (this.tags.includes(this.currentInput)) return
    this.tags.push(this.currentInput)
    this.emitChange()
    this.currentInput = ''
  }

  deleteChip(index: number) {
    this.tags.splice(index, 1)
    this.emitChange()
  }

  emitChange() {
    this.$emit('change', this.tags)
  }
}
</script>
