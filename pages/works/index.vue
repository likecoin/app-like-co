<template>
  <Page
    v-if="!pages || !pages.length"
    class="justify-center"
  >
    <Card>
      <Label :text="$t(!pages ? 'general.loading' : 'WorksPage.empty.label')" />
    </Card>
  </Page>
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
import { Vue, Component, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type'

const signerModule = namespace('signer')
const iscnModule = namespace('iscn')

@Component({
  layout: 'wallet',
})
export default class WorksIndexPageextends extends Vue {
  pages: ISCNRecordWithID[][] | null = null
  pageNumber = 0

  @signerModule.Getter('getAddress') currentAddress!: string
  @iscnModule.Getter('getISCNChunks') recordChunks!: ISCNRecordWithID[][]
  @iscnModule.Getter('getIsLoading') isLoading!: boolean
  @iscnModule.Action queryISCNByAddress!: (
    arg0: string
  ) => ISCNRecordWithID[] | PromiseLike<ISCNRecordWithID[]>

  @Watch('currentAddress')
  onCurrentAddressChanged() {
    this.refreshWorks()
  }

  @Watch('recordChunks')
  onRecordChunksChanged() {
    this.pages = this.recordChunks
  }

  mounted() {
    this.refreshWorks()
  }

  refreshWorks() {
    if (!this.currentAddress) {
      this.pages = []
    } else {
      this.queryISCNByAddress(this.currentAddress)
      this.pages = this.recordChunks
    }
  }

  nextPage() {
    this.pageNumber = Math.min(this.pageNumber + 1, this.pages?.length || 1 - 1)
  }

  previousPage() {
    this.pageNumber = Math.max(this.pageNumber - 1, 0)
  }
}
</script>

<style>
.works-grid-enter-active,
.works-grid-leave-active {
  transition: opacity .1s ease-out;
}
.works-grid-enter,
.works-grid-leave-to {
  opacity: 0;
}
</style>
