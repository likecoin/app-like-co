<template>
  <div
    :class="[
      'flex',
      'items-center',
    ]"
  >
    <div
      v-if="$slots.prepend"
      :class="prependWrapperClasses"
    ><slot name="prepend" /></div>
    <div
      v-if="$slots.default"
      :class="contentWrapperClasses"
    ><slot /></div>
    <div
      v-else
      :class="contentWrapperClasses"
    >{{ text }}</div>
    <div
      v-if="$slots.append"
      :class="appendWrapperClasses"
    >
      <slot name="append" />
    </div>
  </div>
</template>


<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Label extends Vue {
  // Text of the button
  @Prop(String) readonly text!: string

  // Class of the content wrapper
  @Prop([
    String,
    Array,
  ]) readonly contentClass!: string | [] | undefined

  // Class of the prepend wrapper
  @Prop([
    String,
    Array,
  ]) readonly prependClass!: string | [] | undefined

  // Class of the append wrapper
  @Prop([
    String,
    Array,
  ]) readonly appendClass!: string | [] | undefined

  get contentWrapperClasses(): any {
    return [
      'flex',
      'items-center',
      'justify-center',
      'flex-grow',
      this.contentClass,
    ]
  }

  get prependWrapperClasses(): any {
    return [
      'flex-shrink',
      'mr-[12px]',
      this.prependClass,
    ]
  }

  get appendWrapperClasses(): any {
    return [
      'flex-shrink',
      'ml-[12px]',
      this.appendClass,
    ]
  }
}
</script>
