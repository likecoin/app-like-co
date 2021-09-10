<template>
  <Page
    v-if="!records || !records.length"
    class="justify-center"
  >
    <Card>
      <Label :text="$t(!records ? 'general.loading' : 'SearchPage.empty.label')" />
    </Card>
  </Page>
  <Page v-else>
    <search-results :records="records" />
  </Page>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type'

const iscnModule = namespace('iscn')

@Component
export default class SearchIndexPage extends Vue {
  @iscnModule.Getter getISCNById!: (arg0: string) => ISCNRecordWithID
  @iscnModule.Action fetchISCNById!: (arg0: string) => Promise<ISCNRecordWithID[]>
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
      this.$router.push(this.localeLocation({ name: 'index' })!);
      return;
    }
    const promises: Promise<ISCNRecordWithID[]>[] = [];
    iscnIds.forEach((iscnId) => {
      if (!this.getISCNById(iscnId)) {
        promises.push(this.fetchISCNById(iscnId));
      }
    })
    await Promise.all(promises);
  }
}
</script>
