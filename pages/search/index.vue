<template>
  <div class="container flex flex-col items-center mx-auto">
    <div v-if="!records">
      {{ $t('general.loading') }}
    </div>
    <search-results v-else :records="records"/>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

import { parsedISCNRecord } from '~/utils/cosmos/iscn';

const iscnModule = namespace('iscn')

@Component
export default class SearchIndexPage extends Vue {
  @iscnModule.Getter getISCNById!: (arg0: string) => parsedISCNRecord
  @iscnModule.Action fetchISCNById!: (arg0: string) => Promise<parsedISCNRecord[]>
  get iscnIds(): string[] {
    try {
      const ids = JSON.parse(this.$route.params.iscnIds);
      return ids;
    } catch (err) {
      console.error(err);
    }
    return [];
  }

  get records() {
    return (this.iscnIds as string []).map(id => this.getISCNById(id));
  }

  async mounted() {
    const iscnIds: string[] = this.iscnIds as string[] ;
    if (!iscnIds.length) {
      this.$router.push({ name: 'index' });
      return;
    }
    const promises: Promise<parsedISCNRecord[]>[] = [];
    iscnIds.forEach((iscnId) => {
      if (!this.getISCNById(iscnId)) {
        promises.push(this.fetchISCNById(iscnId));
      }
    })
    await Promise.all(promises);
  }
}
</script>
