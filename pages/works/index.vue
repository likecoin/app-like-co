<template>
  <div class="mx-auto pt-[16px]">
    <template v-if="!records">
      {{ $t('general.loading') }}
    </template>
    <search-results v-else :records="records" />
  </div>
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
  records: parsedISCNRecord[] = []

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
