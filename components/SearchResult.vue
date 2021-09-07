<template>
  <div class="w-min">
    <ClientOnly>
      <IscnCard
        :record="record"
        class="mb-[16px]"
      />
    </ClientOnly>
    <Label
      class="w-min mb-[16px]"
      :text="metadata['@type']"
      tag="div"
      preset="p5"
      valign="middle"
      content-class="font-semibold whitespace-nowrap text-like-green"
      prepend-class="text-like-green"
    >
      <template #prepend>
        <ISCNTypeIcon :type="metadata['@type']" />
      </template>
    </Label>
    <FormField :label="$t('iscn.meta.name')">
      {{ name }}
    </FormField>
    <Tag
      v-for="item in keywords"
      :key="item.key"
      :text="item"
      class="mr-[8px] mb-[4px]"
    />
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class SearchResults extends Vue {
  @Prop() readonly record!: any

  get metadata() {
    return this.record.data.contentMetadata
  }

  get name() {
    return this.metadata.name || this.metadata.title
  }

  get keywords(): Array<String> {
    return this.metadata.keywords ? this.metadata.keywords.split(',') : []
  }
}
</script>

