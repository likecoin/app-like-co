<template>
  <Page v-if="!pages || !pages.length" class="justify-center">
    <Card>
      <Label
        :text="$t(!pages ? 'general.loading' : 'SearchPage.empty.label')"
      />
    </Card>
  </Page>
  <!-- <Page v-else>
    <search-results :records="records" />
  </Page> -->
  <Page v-else>
    <nav
      :class="[
        'flex',
        'justify-between',
        'items-center',
        'w-full',
        'max-w-[952px]',
        'mb-[16px]'
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
      
      <ProgressIndicator v-if="isLoading" preset="thin" />
        
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
    <Transition
      name="works-grid"
      mode="out-in"
    >
      <SearchResults
        :key="pages[pageNumber][0].id"
        :records="pages[pageNumber]"
      />
    </Transition>
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

  @iscnModule.Getter('getISCNChunks') recordChunks!: ISCNRecordWithID[][]
  @iscnModule.Getter('getIsLoading') isLoading!: boolean

  @iscnModule.Action queryISCNByKeyword!: (
    arg0: string
  ) => ISCNRecordWithID[] | PromiseLike<ISCNRecordWithID[]>

  pageNumber = 0

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

  async mounted() {
    if (!this.keyword) {
      this.$router.push(this.localeLocation({ name: 'index' })!)
      return
    }
    
    logTrackerEvent(this, 'ISCNSearch', 'ISCNSearchResult', this.keyword, 1)
    await this.queryISCNByKeyword(this.keyword)
  }
  
  nextPage() {
    this.pageNumber = Math.min(this.pageNumber + 1, this.pages?.length || 1 - 1)
  }

  previousPage() {
    this.pageNumber = Math.max(this.pageNumber - 1, 0)
  }
  
}
</script>
