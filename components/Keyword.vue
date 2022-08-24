<template>
  <Tag
    :text="keyword"
    :to="localeLocation({ name: 'search-keyword', query: { keyword } })"
  />
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Keyword extends Vue {
  @Prop(String) readonly keyword: String | undefined
}
</script>