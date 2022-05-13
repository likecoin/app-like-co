<template>
  <Page v-if="!records || !records.length" class="justify-center">
    <Card>
      <Label
        :text="$t(!records ? 'general.loading' : 'SearchPage.empty.label')"
      />
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
import { logTrackerEvent } from '~/utils/logger'

const iscnModule = namespace('iscn')

@Component
export default class SearchPage extends Vue {
  @iscnModule.Getter getISCNById!: (arg0: string) => ISCNRecordWithID
  @iscnModule.Action fetchISCNById!: (
    arg0: string
  ) => Promise<ISCNRecordWithID[]>
  
  @iscnModule.Action queryISCNByKeyword!: (
    arg0: string
  ) => ISCNRecordWithID[] | PromiseLike<ISCNRecordWithID[]>

  state = ''
  iscnIds: string[] = []

  get keyword(): string {
    try {
      const { keyword } = this.$route.params
      return keyword
    } catch (err) {
      console.error(err)
    }
    return ''
  }

  get records() {
    return (this.iscnIds as string[]).map((id) => this.getISCNById(id))
  }

  async mounted() {
    this.state = 'loading'
    if (!this.keyword) {
      this.$router.push(this.localeLocation({ name: 'index' })!)
      return
    }

    const res: ISCNRecordWithID[] = await this.queryISCNByKeyword(this.keyword)
    if (!res.length) {
      this.state = 'not-found'
      logTrackerEvent(this, 'ISCNSearch', 'ISCNSearchNotFound', this.keyword, 1)
    } else {
      this.state = 'loaded'
      logTrackerEvent(this, 'ISCNSearch', 'ISCNSearchResult', this.keyword, 1)
      this.iscnIds = res.map((r) => r.id)
    }

    const promises: Promise<ISCNRecordWithID[]>[] = []
    this.iscnIds.forEach((iscnId) => {
      if (!this.getISCNById(iscnId)) {
        promises.push(this.fetchISCNById(iscnId))
      }
    })
    await Promise.all(promises)
  }
}
</script>
