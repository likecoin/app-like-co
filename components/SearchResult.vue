<template>
  <div class="w-min mx-[12px] mb-[48px]">
    <div
      class="
        flex
        w-[220px]
        h-[440px]
        justify-center
        items-center
        mb-[16px]
        rounded-[24px]
        bg-shade-gray
        text-white
      "
    >
      ISCN Card
    </div>
    <Label
      class="w-min mb-[16px]"
      :text="record.data.contentMetadata['@type']"
      tag="div"
      preset="p5"
      valign="middle"
      content-class="font-semibold whitespace-nowrap text-like-green"
      prepend-class="text-like-green"
    >
      <template #prepend>
        <ISCNTypeIcon :type="record.data.contentMetadata['@type']" />
      </template>
    </Label>
    <FormField :label="$t('iscn.meta.name')">
      {{
        record.data.contentMetadata.name || record.data.contentMetadata.title
      }}
    </FormField>
    <Tag
      v-for="item in record.data.contentMetadata.keywords &&
      record.data.contentMetadata.keywords.split(',')"
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
  @Prop(Object) readonly record!: {}
}
</script>

