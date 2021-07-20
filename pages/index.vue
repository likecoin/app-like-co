<template>
  <div class="container flex flex-col items-center mx-auto">
    <div class="my-4">
      <form @submit.prevent="onSearchISCN">
        <input v-model="searchISCNText" placeholder="Find ISCN by ID">
        <button class="mx-2">Search</button>
        <div v-if="isNotFound">No ISCN record found</div>
      </form>
    </div>
    <div class="my-4">
      <nuxt-link :to="{ name: 'new' }">Register iscn</nuxt-link>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { parsedISCNRecord } from '~/utils/cosmos/iscn'

const iscnModule = namespace('iscn')

@Component
export default class IndexPage extends Vue {
  @iscnModule.Action queryISCNByKeyword!: (arg0: string) => parsedISCNRecord[]|PromiseLike<parsedISCNRecord[]>
  searchISCNText = '';
  isNotFound =  false;

  async onSearchISCN() {
    this.isNotFound = false;
    const { searchISCNText } = this;
    const res: parsedISCNRecord[] = await this.queryISCNByKeyword(searchISCNText);
    if (!res.length) {
      this.isNotFound = true;
    } else if (res.length > 1) {
      const iscnIds = res.map((r) => r.id);
      this.$router.push({ name: 'search', params: { iscnIds: JSON.stringify(iscnIds) }});
    } else {
      const iscnId = res[0].id;
      this.$router.push({ name: 'view-iscnId', params: { iscnId }});
    }
  }
}
</script>
