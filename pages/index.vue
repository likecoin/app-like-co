<template>
  <Page
    :class="[
      'flex',
      'flex-col',
      'relative',
      'items-center',
      'justify-center',
      'px-[20px]',
      'pt-[38px]',
      'lg:p-[16px]',
    ]"
  >
    <div
      :class="[
        'flex',
        'flex-col',
        'items-center',
        'justify-start',
        'lg:flex-row',
        'lg:items-stretch',
        'lg:h-[429px]',
      ]"
    >
      <IscnInfoCard
        :class="[
          'hidden',
          'h-full',
          'w-[696px]',
          'lg:block',
        ]"
      />
      <!-- phone version search bar -->
      <form
        tag="form"
        :class="[
          'flex',
          'flex-col',
          'items-center',
          'w-full',
          'max-w-[334px]',
          'mt-[18px]',
          'p-[16px]',
          'bg-white',
          'rounded-[24px]',
          'lg:hidden',
        ]"
        @submit.prevent="onSearch"
      >
        <Label :text="$t('HomePage.search.title')" preset="h3" />
        <TextField
          v-model="keyword"
          :class="[
            'w-full',
            'mt-[24px]',
            'mb-[16px]',
          ]"
          :placeholder="$t('HomePage.search.placeholder_sm')"
          :error-message="errorMessage"
        />
        <Button preset="secondary" :text="$t('HomePage.search.button')">
          <template #prepend>
            <IconSearch class="w-[20px]" />
          </template>
        </Button>
      </form>
    </div>
    <form
      tag="form"
      :class="[
        'hidden',
        'w-full',
        'max-w-[600px]',
        'my-[64px]',
        'lg:block',
      ]"
      @submit.prevent="onSearch"
    >
      <Label
        class="flex-wrap"
        align="center"
        valign="top"
        content-class="mt-[16px]"
        append-class="mt-[16px]"
      >
        <TextField
          v-model="keyword"
          class="flex-grow"
          :placeholder="$t('HomePage.search.placeholder')"
          :error-message="errorMessage"
        />
        <template #append>
          <Button :text="$t('HomePage.search.button')" preset="outline">
            <template #prepend>
              <IconSearch class="w-[20px]" />
            </template>
          </Button>
        </template>
      </Label>
    </form>
  </Page>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type'
import { logTrackerEvent } from '~/utils/logger'

const iscnModule = namespace('iscn')

@Component({
  fetch({ redirect, query, localeLocation }) {
    const { q } = query;
    if (q) redirect(localeLocation({ name: 'search-keyword', query })!);
  },
  layout: 'default',
})
export default class IndexPage extends Vue {
  @iscnModule.Action queryISCNByKeyword!: (
    arg0: string
  ) => ISCNRecordWithID[] | PromiseLike<ISCNRecordWithID[]>

  keyword = ''
  errorMessage = ''

  onSearch() {
    const { keyword } = this
    if (!keyword) {
      this.errorMessage = this.$t('HomePage.search.errormessage.empty') as string
      return
    }
    this.errorMessage = ''

    logTrackerEvent(this, 'ISCNSearch', 'ISCNSearch', keyword, 1)
    this.$router.push(
      this.localeLocation({ name: 'search-keyword', params: { keyword } })!,
    )
  }
}
</script>
