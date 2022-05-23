<template>
  <Page v-if="!pages || !pages.length" class="justify-center">
    <Card>
      <Label
        :text="$t(!pages ? 'general.loading' : 'SearchPage.empty.label')"
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
          @click="pageNumber = 0"
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
          @click="pageNumber = pages.length - 1"
        />
      </div>
    </nav>
    <div class="mb-[40px]">
      <Transition name="works-grid" mode="out-in">
        <SearchResults
          :key="pages[pageNumber][0].id"
          :records="pages[pageNumber]"
        />
      </Transition>
    </div>
  </Page>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type'
import { logTrackerEvent } from '~/utils/logger'

const iscnModule = namespace('iscn')

@Component({
  fetch({ params, redirect }) {
    if (!params.keyword) {
      redirect({ name: 'index' })
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

  pageNumber = 0
  closeWarning = false

  get keyword(): string {
    try {
      const { keyword } = this.$route.params
      return keyword
    } catch (err) {
      console.error(err)
    }
    return ''
  }

  get pages() {
    return this.recordChunks || []
  }

  get shouldShowError() {
    if(this.closeWarning) return false
    return !!this.errorMessage
  }

  async mounted() {
    logTrackerEvent(this, 'ISCNSearch', 'ISCNSearchResult', this.keyword, 1)
    await this.queryISCNByKeyword(this.keyword)
  }

  nextPage() {
    this.pageNumber = Math.min(this.pageNumber + 1, this.pages?.length || 1 - 1)
  }

  previousPage() {
    this.pageNumber = Math.max(this.pageNumber - 1, 0)
  }

  handleWarningClose() {
    this.closeWarning = true
  }
}
</script>
