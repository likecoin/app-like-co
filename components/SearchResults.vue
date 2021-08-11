<template>
  <div>
    <div v-for="record in records" :key="record.id">
      <div v-if="!record">
        {{ $t('general.loading') }}
      </div>
      <div v-else>
        <ul>
          <nuxt-link :to="localeLocation({ name: 'view-iscnId', params: { iscnId: record.id }})">{{ record.id }}</nuxt-link>
          <li>{{ $t('iscn.meta.content.fingerprints') }} {{ record.data.contentFingerprints }}</li>
        </ul>
        <ul>
          <li>{{ $t('iscn.meta.type') }} {{ record.data.contentMetadata['@type'] }}</li>
          <li>{{ $t('iscn.meta.title') }} {{ record.data.contentMetadata.title }}</li>
          <li>{{ $t('iscn.meta.description') }} {{ record.data.contentMetadata.description }}</li>
          <li>{{ $t('iscn.meta.url') }} {{ record.data.contentMetadata.url }}</li>
          <li>{{ $t('iscn.meta.keywords') }} {{ record.data.contentMetadata.keywords }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import { Vue, Component, Prop } from 'vue-property-decorator'

import { parsedISCNRecord } from '~/utils/cosmos/iscn';

@Component
export default class SearchResults extends Vue {
  @Prop(Array) readonly records!: parsedISCNRecord[]
}
</script>

