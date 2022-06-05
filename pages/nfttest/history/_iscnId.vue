<template>
  <div>
    <table>
      <tr v-for="r in records" :key="r.txHash">
        <td>Price: {{r.price}} LIKE </td>
        <td>Buyer: {{r.toWallet}} </td>
        <td>Time: {{new Date(r.timestamp)}}</td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import qs from 'querystring'
import { Vue, Component } from 'vue-property-decorator'
import { API_LIKER_NFT_HISTORY } from '~/constant/api'

@Component({
  fetch({ params, redirect }) {
    if (!params.iscnId) {
      redirect({ name: 'index' })
    }
  },
})
export default class NFTTestHistoryPage extends Vue {
  get iscnId(): string {
    const { iscnId } = this.$route.params;
    return iscnId
  }

  records: any[] = []

  async mounted() {
    await this.getNFTHistory()
  }

  async getNFTHistory() {
    const { data } = await this.$axios.get(API_LIKER_NFT_HISTORY, {
      params: {
        iscn_id: this.iscnId,
      },
      paramsSerializer: params => qs.stringify(params),
    });
    this.records = data.list;
  }
}
</script>
