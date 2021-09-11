<template>
  <Page
    v-if="!records || !records.length"
    class="justify-center"
  >
    <Card>
      <Label :text="$t(!records ? 'general.loading' : 'WorksPage.empty.label')" />
    </Card>
  </Page>
  <Page v-else>
    <SearchResults :records="records" />
  </Page>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import SearchResults from '~/components/SearchResults.vue'
import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type'

const signerModule = namespace('signer')
const iscnModule = namespace('iscn')

@Component({
  layout: 'wallet',
  components: { SearchResults },
})
export default class WorksIndexPageextends extends Vue {
  records: ISCNRecordWithID[] | null = null

  @signerModule.Getter('getAddress') currentAddress!: string
  @iscnModule.Action queryISCNByAddress!: (
    arg0: string
  ) => ISCNRecordWithID[] | PromiseLike<ISCNRecordWithID[]>

  @Watch('currentAddress')
  onCurrentAddressChanged() {
    this.refreshWorks()
  }

  mounted() {
    this.refreshWorks()
  }

  async refreshWorks() {
    if (!this.currentAddress) {
      this.records = []
      return
    }
    this.records = await this.queryISCNByAddress(this.currentAddress)
  }
}
</script>
