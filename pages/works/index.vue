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
import { parsedISCNRecord } from '~/utils/cosmos/iscn'

const signerModule = namespace('signer')
const iscnModule = namespace('iscn')

@Component({
  layout: 'wallet',
  components: { SearchResults },
})
export default class WorksIndexPageextends extends Vue {
  records: parsedISCNRecord[] | null = null

  @signerModule.Getter('getAddress') currentAddress!: string
  @iscnModule.Action queryISCNByAddress!: (
    arg0: string
  ) => parsedISCNRecord[] | PromiseLike<parsedISCNRecord[]>

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
