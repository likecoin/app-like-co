<template>
  <div
    :class="[
      'flex',
      'flex-row',
      'flex-wrap',
      'items-start',
    ]"
  >
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
      >
        <IconCloseMini/>
      </span>
    </div>
    <button
      v-if="!shouldShowInput && isTagsLimitNotExceeded"
      type="button"
      :class="[
        '!bg-like-cyan-light',
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
    <form
      v-if="shouldShowInput && isTagsLimitNotExceeded"
      :class="[
        'flex',
        'flex-col',
        'relative',
        'mb-[4px]',
      ]"
      @submit.prevent="saveChip"
    >
      <input
        ref="input"
        v-model="currentInput"
        type="text"
        :class="[
          'absolute',
          'py-[6px]',
          'px-[20px]',
          'text-[12px]',
          { 'text-transparent': currentInput.length },
          'bg-transparent',
          'outline-none',
        ]"
        @keypress="
          (e) => {
            if (e.keyCode === 32) {
              e.returnValue = false
            }
          }"
        @blur="blurInput"
      />
      <div
        :class="[
          'flex',
          'justify-center',
          'items-center',
          'box-border',
          'top-0',
          'left-0',
          'h-[30px]',
          { 'border-[1px] border-red': errorMessage },
          'bg-shade-gray',
          'py-[6px]',
          'px-[20px]',
          'text-[12px]',
          'rounded-[16px]',
        ]"
      >
        {{ currentInput }}
      </div>
      <span
        v-if="errorMessage"
        :class="[
          'block',
          'self-end',
          'text-[red]',
          'text-[10px]'
        ]"
      >
        {{ errorMessage }}
      </span>
    </form>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Model, Watch, Prop } from 'vue-property-decorator'

@Component
export default class EditableTagList extends Vue {
  @Model('change', { type: Array, default: () => [] }) value!: Array<string>

  // Character limit for a tag
  @Prop({ default: 35 }) readonly charactersLimit!: number | undefined

  // Maximum number of tags
  @Prop(Number) readonly tagsLimit!: number | undefined

  tags: Array<string> = []
  currentInput: string = ''
  shouldShowInput: boolean = false
  shouldShowClose: number = -1

  $refs!: {
    input: HTMLInputElement
  }

  get errorMessage() {
    if (this.charactersLimit && this.currentInput.length > this.charactersLimit) {
      return this.$t('IscnRegisterForm.warning.exceeded', {
        current: this.currentInput.length,
        limit: this.charactersLimit,
      })
    }
    if (this.tags.includes(this.currentInput)) {
      return this.$t('IscnRegisterForm.warning.exist')
    }
    return undefined
  }

  get isTagsLimitNotExceeded() {
    if (this.tagsLimit) return this.tags.length < this.tagsLimit
    return true
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
    if (this.currentInput) {
      this.saveChip()
      if (this.isTagsLimitNotExceeded) {
        this.$nuxt.$nextTick(() => this.$refs.input.focus())
      }
    } else {
      this.shouldShowInput = false
    }
  }

  saveChip() {
    if (!this.currentInput || this.errorMessage) return
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
