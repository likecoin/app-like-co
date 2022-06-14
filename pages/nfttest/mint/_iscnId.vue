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
    <Card :class="['p-[32px]', 'w-full', 'max-w-[600px]']" :has-padding="false">
      <!-- header -->
      <div :class="['flex', 'justify-between', 'items-center']">
        <Label
          class="w-min"
          :text="labelText"
          tag="div"
          preset="p5"
          valign="middle"
          content-class="font-semibold whitespace-nowrap text-like-green"
          prepend-class="text-like-green"
        >
          <template #prepend>
            <IconRegister />
          </template>
        </Label>
        <div :class="['flex', 'flex-col', 'items-end']">
          <Stepper :step="step" :total-step="3" />
          <Label
            preset="p6"
            :text="$t('Registration.step', { step: step, total: 3 })"
            class="text-medium-gray"
          />
        </div>
      </div>
      <!-- guide text -->
      <!-- body -->
      <div
        :class="[
          'flex',
          'flex-col',
          'justify-center',
          'items-center',
          'w-full',
        ]"
      >
        <div
          :class="[
            'flex',
            'flex-col',
            'justify-center',
            'items-center',
            'w-full',
            'my-[64px]',
          ]"
        >
          <FormField label="ISCN :" class="mb-[12px]">
            <Label :text="iscnId" tag="div" preset="p6" />
          </FormField>
          <FormField v-if="classId" label="NFT Class ID :" class="mb-[12px]">
            <Label :text="classId" tag="div" preset="p6" />
          </FormField>
          <FormField
            v-if="state === 'done'"
            label="Embed NFT Widget :"
            class="mb-[12px]"
          >
            <code class="block w-full whitespace-normal bg-light-gray">{{
              code
            }}</code>
          </FormField>
        </div>
        <div class="flex flex-col self-end">
          <div v-if="isLoading" class="flex flex-col justify-center">
            <ProgressIndicator />
            <Label class="text-[8px] text-medium-gray text-center mt-[8px]" align="center">{{ loadingText }}</Label>
          </div>

          <Button v-else preset="outline" class="my-[12px]" @click="doAction">{{
            buttonText
          }}</Button>
        </div>
      </div>
    </Card>
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
import {
  formatMsgMintNFT,
  formatMsgSend,
} from '@likecoin/iscn-js/dist/messages/likenft'
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

  classId: string = ''
  iscnData: any = null
  apiData: any = null

  isLoading = false

  get iscnId(): string {
    const { iscnId } = this.$route.params
    return iscnId
  }

  get state(): string {
    if (this.apiData) return 'done'
    if (this.classId) return 'mint'
    return 'create'
  }

  get buttonText(): string {
    if (this.state === 'done') return 'Go to Doc'
    if (this.state === 'mint') return 'Mint NFT'
    return 'Mint NFT'
  }

  get labelText(): string {
    if (this.state === 'done') return 'Done'
    if (this.state === 'mint') return 'Mint NFT'
    return 'Mint NFT'
  }

  get step(): number {
    if (this.state === 'done') return 3
    if (this.state === 'mint') return 2
    return 2
  }

  // eslint-disable-next-line class-methods-use-this
  get code() {
    return `<div class="likecoin-embed likecoin-button" iscn_id="${this.iscnId}"></div>`
  }

  get loadingText(): string {
    if (this.state === 'done') return ''
    if (this.state === 'mint') return 'Minting NFT ...'
    return 'Creating NFT class ...'
  }

  async mounted() {
    await this.getMintInfo()
    await this.getISCNInfo()
  }

  async doAction() {
    /* eslint-disable no-fallthrough */
    switch (this.state) {
      case 'create':
        this.isLoading = true
        await this.createNftClass()
        await this.sendNFT()
        await this.postMintInfo()
        await this.getMintInfo()
        this.isLoading = false
        break
      case 'done':
        window.location.href = 'https://github.com/likecoin/likecoin-button-sdk'
      default:
    }
    /* eslint-enable no-fallthrough */
  }

  async getISCNInfo() {
    const res = await this.fetchISCNById(this.iscnId)
    if (res) {
      ;[this.iscnData] = res.records
    }
  }

  async getMintInfo() {
    try {
      const { data } = await this.$axios.get(API_LIKER_NFT_MINT, {
        params: {
          iscn_id: this.iscnId,
        },
        paramsSerializer: (params) => qs.stringify(params),
      })
      this.classId = data.classId
      this.apiData = data
    } catch (err) {
      console.error(err)
    }
  }

  async postMintInfo() {
    let fdata
    try {
      const { data } = await this.$axios.post(
        API_LIKER_NFT_MINT,
        {},
        {
          params: {
            iscn_id: this.iscnId,
            class_id: this.classId,
          },
          paramsSerializer: (params) => qs.stringify(params),
        },
      )
      fdata = data
    } catch (error) {
      console.error(error)
    }
    return fdata
  }

  async createNftClass() {
    if (!this.signer) return
    const signingClient = await getSigningClient()
    await signingClient.setSigner(this.signer)
    const res = await signingClient.createNFTClass(this.address, this.iscnId, {
      name: `Liker NFT - ${this.iscnData.name}`,
    })
    const rawLogs = JSON.parse((res as DeliverTxResponse).rawLog as string)
    const event = rawLogs[0].events.find(
      (e: { type: string }) => e.type === 'likechain.likenft.EventNewClass',
    )
    const attribute = event.attributes.find(
      (a: { key: string }) => a.key === 'class_id',
    )
    const classId = (attribute?.value || '').replace(/^"(.*)"$/, '$1')
    if (classId) this.classId = classId
  }

  async sendNFT() {
    if (!this.signer) return
    const signingClient = await getSigningClient()
    await signingClient.setSigner(this.signer)
    const { classId } = this

    const nfts = [...Array(1000).keys()].map((_) => {
      const id = `liker-${uuidv4()}`
      return {
        id,
        uri: `${API_LIKER_NFT_METADATA}?class_id=${encodeURIComponent(
          this.classId,
        )}&nft_id=${encodeURIComponent(id)}`,
        metadata: {
          name: this.iscnData.name,
        },
      }
    })
    const mintMessages = nfts.map((i) =>
      formatMsgMintNFT(this.address, classId, i),
    )
    const sendMessages = nfts.map((i) =>
      formatMsgSend(this.address, LIKER_NFT_API_WALLET, classId, i.id),
    )
    const messages = mintMessages.concat(sendMessages)
    const sendRes = await signingClient.sendMessages(this.address, messages)
    console.log(sendRes)
  }
}
</script>
