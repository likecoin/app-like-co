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
    <div :class="['flex','flex-col','justify-center','items-center','w-full']">
      <form
        tag="form"
        :class="['hidden', 'w-full', 'max-w-[800px]', 'my-[64px]', 'lg:block']"
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
            v-model="url"
            class="flex-grow"
            :placeholder="$t('NFTProtal.placeholder.register')"
            :error-message="errorMessage"
          />
          <template #append>
            <Button :text="$t('NFTProtal.button.register')" preset="outline">
              <template #prepend>
                <IconAddToISCN class="w-[20px]" />
              </template>
            </Button>
          </template>
        </Label>
      </form>
      {{ iscnId }}
      <ProgressIndicator v-if="isLoading" class="my-[4px]" preset="thin" />
    </div>
  </Page>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing'
import { signISCNTx } from '~/utils/cosmos/iscn'
import { formatISCNTxPayload } from '~/utils/cosmos/iscn/sign'
import { ISCNRegisterPayload } from '~/utils/cosmos/iscn/iscn.type'

const signerModule = namespace('signer')

@Component
export default class FetchIndex extends Vue {
  @signerModule.Getter('getAddress') address!: string
  @signerModule.Getter('getSigner') signer!: OfflineSigner | null

  url = ''
  errorMessage = ''
  state = 'init'
  iscnId = ''
  isLoading = false

  async onSearch() {
    const { url } = this
    if (!url) {
      this.errorMessage = this.$t(
        'HomePage.search.errormessage.empty',
      ) as string
      return
    }
    this.errorMessage = ''
    const fetchData = {
      type: 'CreativeWork',
      // name: '如何一口氣註冊《唐詩三百首》到區塊鏈 - 黃牛山人 (@edmond)',
      name: 'test 03',
      description:
        '本篇教大家如何一次過為大量資料註冊 ISCN，程序含少量技術，但不用害怕，只要跟著一步步做便好，過程一定比填寫政府的稅單容易。',
      tagsString:
        'LikeCoin,DePub,去中心出版,ISCN,matters,matters.news,創作有價',
      url: 'https://matters.news/@edmond/177802-%E5%A6%82%E4%BD%95%E4%B8%80%E5%8F%A3%E6%B0%A3%E8%A8%BB%E5%86%8A-%E5%94%90%E8%A9%A9%E4%B8%89%E7%99%BE%E9%A6%96-%E5%88%B0%E5%8D%80%E5%A1%8A%E9%8F%88-bafyreiautxzy4r3axckcqkks4vlq7zd4rtehagsh3f4zdinlv6zbc3nuhy',
      exifInfo: {},
      license: '',
      ipfsHash: '',
      arweaveId: '',
      fileSHA256: '',
      authorNames: ['aurorahuang'],
      authorUrls: [['']],
      authorWallets: [[{
            address: this.address,
            type: 'like',
          }]],
      likerIds: [''],
      descriptions: [''],
      numbersProtocolAssetId: '',
    }
    this.state = 'register'
    await this.submitToISCN(fetchData)
  }

  async submitToISCN(data: ISCNRegisterPayload): Promise<void> {
    this.isLoading = true
    if (!this.signer) {
      this.errorMessage = 'MISSING_SIGNER'
      return
    }
    try {
      const res = await signISCNTx(
        formatISCNTxPayload(data),
        this.signer,
        this.address,
      )
      this.iscnId = res.iscnId
      if(res){
        this.$router.push(this.localeLocation(
          { name: 'nfttest-mint-iscnId', params: { iscnId: this.iscnId } },
        )!);
      }
    } catch (err) {
      // TODO: Handle error
      // eslint-disable-next-line no-console
      console.error(err)
    }
    this.isLoading = false
  }
}
</script>