<template>
  <div>
    <div
      v-for="(field, i) in fields"
      :key="field.key"
      :class="[
        'flex',
        'flex-row',
        'items-center',
        'justify-center'
    ]"
    >
      <div v-if="$slots.prepend" class="mr-[4px]">
        <slot name="prepend" />
      </div>
      <TextField
        :size="40"
        :class="[
            'my-[4px]',
            'flex-grow',
        ]"
        :placeholder="placeholder"
      />
      <span 
        :class="[
            'ml-[12px]',
            'cursor-pointer',
         ]" 
        @click="deleteField(i)"
        ><IconClose />
      </span>
    </div>
    <Button
      class="mx-auto my-[4px]"
      preset="secondary"
      :text="text"
      size="mini"
      prepend-class="mr-[4px]"
      @click="AddFields"
    >
      <template #prepend>
        <IconAdd-mini />
      </template>
    </Button>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class InsertField extends Vue {
  @Prop(String) readonly text!: String
  @Prop(String) readonly placeholder!: String

  fields: any = [{ key: 0 }]

  AddFields() {
    this.fields.push({
      key: Date.now(),
    })
  }

  deleteField(index: number) {
    this.fields.splice(index, 1)
  }
}
</script>
