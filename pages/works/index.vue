<template>
  <Page v-if="!pages || !pages.length" class="justify-center">
    <Card>
      <Label
        :text="$t(!pages.length && !isLoading ? 'WorksPage.empty.label' : 'general.loading')"
      />
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
          @click="lastPage"
        />
      </div>
    </nav>
    <Transition
      name="works-grid"
      mode="out-in"
    >
      <SearchResults
        v-if="pages[pageNumber]"
        :key="pages[pageNumber][0].id"
        :records="pages[pageNumber]"
      />
    </Transition>
    <div
      class="mt-[24px]"
    >
      <a
        :class="['underline', 'text-[12px]']"
        :href="portfolioURL"
        target="_blank"
        rel="noopener"
      >
        {{ $t('WorksPage.label.portfolio') }}
      </a>
    </div>
  </Page>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { LIKER_LAND_URL } from '~/constant'
import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type'

const signerModule = namespace('signer')
const iscnModule = namespace('iscn')

@Component({
  layout: 'wallet',
})
export default class WorksIndexPageextends extends Vue {
  pageNumber = Number(this.$route.query.page) || 0

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

  @Watch('pageNumber')
  onPageNumberChanged() {
    this.$router.replace({
      query: { ...this.$route.query, page: this.pageNumber.toString() },
    });
  }

  mounted() {
    this.refreshWorks()
  }

  get pages() {
    return this.recordChunks || []
  }

  refreshWorks() {
    if (this.currentAddress) {
      this.queryISCNByAddress(this.currentAddress)
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

  get portfolioURL(): string {
    return `${LIKER_LAND_URL}/${this.currentAddress}`
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
