<template>
  <Page v-if="!pages || !pages.length" class="justify-center">
    <Card>
      <Label
        :text="$t(!pages.length && !isLoading ? 'SearchPage.empty.label' : 'general.loading')"
      />
    </Card>
    <Snackbar
      :open="shouldShowError"
      class="mx-auto"
      :text="$t('SearchPage.error')"
      preset="warn"
      @close="handleWarningClose"
    />
  </Page>
  <Page v-else>
    <nav
      :class="[
        'flex',
        'justify-between',
        'items-center',
        'w-full',
        'max-w-[952px]',
        'mt-[12px]',
        'mb-[32px]',
      ]"
    >
      <div
        :class="[
          'grid',
          'grid-flow-col',
          'gap-[8px]'
        ]"
      >
        <Button
          class="text-dark-gray"
          preset="tertiary"
          size="small"
          :text="$t('WorksPage.pagination.button.first')"
          :is-disabled="pageNumber === 0"
          @click="firstPage"
        />
        <Button
          class="text-dark-gray"
          preset="tertiary"
          size="small"
          :text="$t('WorksPage.pagination.button.previous')"
          :is-disabled="pageNumber === 0"
          @click="previousPage"
        >
          <template #prepend>
            <IconArrowLeft />
          </template>
        </Button>
      </div>

      <div :class="['flex', 'flex-col', 'items-center', 'flex-shrink']">
        <Label preset="h6" :text="$t('WorksPage.label.search.result')" />
        <Label class="text-center" preset="h5" align="center">{{
          keyword
        }}</Label>
      </div>

      <div
        :class="[
          'grid',
          'grid-flow-col',
          'gap-[8px]'
        ]"
      >
        <Button
          class="text-dark-gray"
          preset="tertiary"
          size="small"
          :text="$t('WorksPage.pagination.button.next')"
          :is-disabled="pageNumber >= pages.length - 1"
          @click="nextPage"
        >
          <template #append>
            <IconArrowRight />
          </template>
        </Button>
        <Button
          class="text-dark-gray"
          preset="tertiary"
          size="small"
          :text="$t('WorksPage.pagination.button.last')"
          :is-disabled="pageNumber >= pages.length - 1"
          @click="lastPage"
        />
      </div>
    </nav>
    <div class="mb-[40px]">
      <Transition name="works-grid" mode="out-in">
        <SearchResults
          v-if="pages[pageNumber]"
          :key="pages[pageNumber][0].id"
          :records="pages[pageNumber]"
        />
      </Transition>
    </div>
  </Page>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type'
import { logTrackerEvent } from '~/utils/logger'

const iscnModule = namespace('iscn')

@Component({
  fetch({ route, params, redirect, query }) {
    if (params.keyword) {
      const { name } = route
      redirect({ name: name as string, query: { q: params.keyword, ...query } });
    } else if (!Object.keys(query).length) {
      redirect({ name: 'index' });
    }
  },
})
export default class SearchPage extends Vue {
  @iscnModule.Getter getISCNById!: (arg0: string) => ISCNRecordWithID
  @iscnModule.Action fetchISCNById!: (
    arg0: string
  ) => Promise<ISCNRecordWithID[]>

  @iscnModule.Getter('getISCNChunks') recordChunks!: ISCNRecordWithID[][]
  @iscnModule.Getter('getErrorMessage') errorMessage!: ISCNRecordWithID[][]
  @iscnModule.Getter('getIsLoading') isLoading!: boolean

  @iscnModule.Action queryISCNByKeyword!: (
    arg0: string
  ) => ISCNRecordWithID[] | PromiseLike<ISCNRecordWithID[]>

  @iscnModule.Action queryISCNByField!: (
    arg0: { 
      iscnId?: string,
      owner?: string,
      contentFingerprint?: string,
      stakeholderId?: string,
      stakeholderName?: string,
      keyword?: string, 
  }) => ISCNRecordWithID[] | PromiseLike<ISCNRecordWithID[]>

  pageNumber = Number(this.$route.query.page) || 0
  closeWarning = false

  get queryAllTerm(): string {
    const { q } = this.$route.query
    return q as string;
  }

  get pages() {
    return this.recordChunks || []
  }

  get shouldShowError() {
    if(this.closeWarning) return false
    return !!this.errorMessage
  }

  mounted() {
    this.search()
  }

  @Watch('$route.query')
  onQueryChange() {
    this.search()
  }

  @Watch('pageNumber')
  onPageNumberChanged() {
    this.$router.replace({
      query: { ...this.$route.query, page: this.pageNumber.toString() },
    });
  }

  async search(){
    logTrackerEvent(this, 'ISCNSearch', 'ISCNSearchResult', this.queryAllTerm, 1)
    if (this.queryAllTerm)  {
      await this.queryISCNByKeyword(this.queryAllTerm)
    } else {
      const { 
        iscnId,
        owner,
        content_fingerprint: contentFingerprint,
        stakeholder_id: stakeholderId,
        stakeholder_name: stakeholderName, 
        keyword,
      } = this.$route.query;
      const searchObject = {
        iscnId: iscnId as string,
        owner: owner as string,
        contentFingerprint: contentFingerprint as string,
        stakeholderId: stakeholderId as string,
        stakeholderName: stakeholderName as string,
        keyword: keyword as string,
      };
      if (Object.keys(searchObject).filter(k => !!k).length) {
        await this.queryISCNByField(searchObject)
      } else {
        this.$router.replace({ name: 'index' })
      }
    }
  }

  nextPage() {
    this.pageNumber = Math.min(this.pageNumber + 1, this.pages?.length || 1 - 1)
  }

  previousPage() {
    this.pageNumber = Math.max(this.pageNumber - 1, 0)
  }

  firstPage() {
    this.pageNumber = 0
  }

  lastPage() {
    this.pageNumber = this.pages.length - 1
  }

  handleWarningClose() {
    this.closeWarning = true
  }
}
</script>
