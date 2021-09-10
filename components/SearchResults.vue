<template>
  <div class="grid grid-cols-4 gap-x-[24px] gap-y-[48px]">
    <div v-for="record in records" :key="record.id">
      <template v-if="!record">
        {{ $t('general.loading') }}
      </template>
      <NuxtLink
        v-else
        :to="localeLocation({
          name: 'view-iscnId',
          params: { iscnId: record.id },
        })"
      >
        <SearchResult :record="record" />
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import { Vue, Component, Prop } from 'vue-property-decorator'
import { ISCNRecord } from '@likecoin/iscn-js'

@Component
export default class SearchResults extends Vue {
  @Prop(Array) readonly records!: ISCNRecord[]
}
</script>

