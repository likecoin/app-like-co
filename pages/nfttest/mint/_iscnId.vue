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
    <div>ISCN: {{ iscnId }}</div>
    <div>NFT Class: {{ classId }}</div>
    <template v-if="apiData">
      <div>Current Price: {{ apiData.currentPrice }} LIKE</div>
      <div>Count: {{ apiData.totalCount - apiData.soldCount }} / {{ apiData.totalCount }}</div>
    </template>
    <hr/>
    <Button @click="doAction">{{ buttonText }}</Button>
  </Page>
</template>

<script lang="ts">
import qs from 'querystring'
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing'
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
import { v4 as uuidv4 } from 'uuid'
import { DeliverTxResponse } from '@cosmjs/stargate'
import { formatMsgMintNFT, formatMsgSend } from '@likecoin/iscn-js/dist/messages/likenft'
import { API_LIKER_NFT_METADATA, API_LIKER_NFT_MINT } from '~/constant/api'
import { getSigningClient } from '~/utils/cosmos/iscn/sign'
import { ISCNRecordWithID } from '~/utils/cosmos/iscn/iscn.type'
import { LIKER_NFT_API_WALLET } from '~/constant'


const iscnModule = namespace('iscn')
const signerModule = namespace('signer')

@Component({
  fetch({ params, redirect }) {
    if (!params.iscnId) {
      redirect({ name: 'index' })
    }
  },
})
export default class NFTTestMintPage extends Vue {
  @signerModule.Getter('getAddress') address!: string
  @signerModule.Getter('getSigner') signer!: OfflineSigner | null
  @iscnModule.Getter getISCNById!: (arg0: string) => ISCNRecordWithID
  @iscnModule.Action fetchISCNById!: (arg0: string) => Promise<{
    records: ISCNRecordWithID[]
    owner: string
    latestVersion: Long.Long
  } | null>

  classId: string = '';
  iscnData: any = null;
  apiData: any = null;

  get iscnId(): string {
    const { iscnId } = this.$route.params
    return iscnId
  }

  get state(): string {
    if (this.apiData) return 'done';
    if (this.classId) return 'mint';
    return 'create';
  }

  get buttonText(): string {
    if (this.state === 'done') return 'go to purchase page';
    if (this.state === 'mint') return 'mint nft';
    return 'create nft';
  }

  async mounted() {
    await this.getMintInfo()
    await this.getISCNInfo()
  }

  async doAction() {
    /* eslint-disable no-fallthrough */
    switch(this.state) {
      case 'create':
        await this.createNftClass();
      case 'mint':
        await this.sendNFT();
        await this.postMintInfo();
        await this.getMintInfo();
        break;
      case 'done':
        this.$router.push(this.localeLocation(
          { name: 'nfttest-button-iscnId', params: { iscnId: this.iscnId } },
        )!);
      default:
    }
    /* eslint-enable no-fallthrough */
  }

  async getISCNInfo() {
    const res = await this.fetchISCNById(this.iscnId);
    if (res) {
      console.log(res);
      [this.iscnData] = res.records;
    }
  }

  async getMintInfo() {
    try {
      const { data } = await this.$axios.get(API_LIKER_NFT_MINT, {
        params: {
          iscn_id: this.iscnId,
        },
        paramsSerializer: params => qs.stringify(params),
      });
      this.classId = data.classId;
      this.apiData = data;
    } catch (err) {
      console.error(err);
    }
  }

  async postMintInfo() {
    const { data } = await this.$axios.post(API_LIKER_NFT_MINT, {
    }, {
      params: {
        iscn_id: this.iscnId,
        class_id: this.classId,
      },
      paramsSerializer: params => qs.stringify(params),
    });
    return data;
  }

  async createNftClass() {
    if (!this.signer) return;
    const signingClient = await getSigningClient();
    await signingClient.setSigner(this.signer);
    const res = await signingClient.createNFTClass(
       this.address,
       this.iscnId,
       { name: `Liker NFT - ${this.iscnData.name}` },
    );
    const rawLogs = JSON.parse((res as DeliverTxResponse).rawLog as string);
    const event = rawLogs[0].events.find((e: { type: string }) => e.type === 'likechain.likenft.EventNewClass');
    const attribute = event.attributes.find((a: { key: string }) => a.key === 'class_id');
    const classId = (attribute?.value || '').replace(/^"(.*)"$/, '$1');
    if (classId) this.classId = classId;
  }

  async sendNFT() {
    if (!this.signer) return;
    const signingClient = await getSigningClient();
    await signingClient.setSigner(this.signer);
    const { classId } = this;

    const nfts = [...Array(1000).keys()].map(_ => {
      const id = `liker-${uuidv4()}`;
      return {
        id,
        uri: `${API_LIKER_NFT_METADATA}?class_id=${encodeURIComponent(this.classId)}&nft_id=${encodeURIComponent(id)}`,
        metadata: {
          name: this.iscnData.name,
        },
      };
    })
    const mintMessages = nfts.map((i) => formatMsgMintNFT(
      this.address,
      classId,
      i,
    ))
    const sendMessages = nfts.map((i) => formatMsgSend(
      this.address,
      LIKER_NFT_API_WALLET,
      classId,
      i.id,
    ))
    const messages = mintMessages.concat(sendMessages);
    const sendRes = await signingClient.sendMessages(this.address, messages);
    console.log(sendRes);
  }
}
</script>
