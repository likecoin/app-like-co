<template>
  <Page
    :class="[
      'flex',
      'flex-col',
      'relative',
      'items-center',
      'justify-center',
      'p-[16px]',
    ]"
  >
    <Card
      tag="form"
      :class="[
        'w-full',
        'max-w-[600px]',
      ]"
      @submit.prevent="onSearch"
    >
      <Label
        :text="$t('HomePage.search.title')"
        class="mb-[16px]"
        preset="h3"
        align="center"
      />
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
          <Button
            :text="$t('HomePage.search.button')"
            preset="secondary"
          >
            <template #prepend>
              <IconSearch class="w-[20px]" />
            </template>
          </Button>
        </template>
      </Label>
    </Card>

    <Button
      class="mt-[32px]"
      preset="outline"
      :text="$t('HomePage.register.button')"
      :to="localeLocation({ name: 'new' })"
      size="small"
    >
      <template #prepend>
        <IconAddToISCN class="w-[20px]" />
      </template>
    </Button>
    <div
      :class="[
        'absolute',
        'bottom-[24px]',
        'right-[24px]',
        'flex',
        'flex-nowrap',
        'w-min',
      ]"
    >
      <Label
        :class="[
          'whitespace-nowrap',
          'mr-[24px]',
        ]"
        :text="$t('HomePage.label.getToken')"
        preset="h6"
      />
      <Button
        class="mr-[24px]"
        preset="tertiary"
        text-preset="h6"
        size="mini"
        href="https://app.osmosis.zone/"
        :text="$t('HomePage.button.osmosis')"
      />
      <Button
        class="mr-[24px]"
        preset="tertiary"
        text-preset="h6"
        size="mini"
        href="https://app.liquid.com/exchange/LIKEUSDT"
        :text="$t('HomePage.button.liquid')"
      />
    </div>
  </Page>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type';

const iscnModule = namespace('iscn')

@Component
export default class IndexPage extends Vue {
  @iscnModule.Action queryISCNByKeyword!: (arg0: string) => ISCNRecordWithID[] | PromiseLike<ISCNRecordWithID[]>;

  keyword = '';
  state = 'idle';

  get errorMessage() {
    return this.state === 'not-found' ? this.$t('HomePage.search.results.empty') : '';
  }

  async onSearch() {
    this.state = 'loading';
    const { keyword } = this
    const res: ISCNRecordWithID[] = await this.queryISCNByKeyword(keyword);
    if (!res.length) {
      this.state = 'not-found';
    } else {
      this.state = 'loaded';
      if (res.length > 1) {
        const iscnIds = res.map((r) => r.id);
        this.$router.push(this.localeLocation({ name: 'search', params: { iscnIds: JSON.stringify(iscnIds) }})!);
      } else {
        const iscnId = res[0].id;
        this.$router.push(this.localeLocation({ name: 'view-iscnId', params: { iscnId }})!);
      }
    }
  }
}
</script>
