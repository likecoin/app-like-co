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
          text="Convert Article to ISCN"
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
          <Stepper :step="1" :total-step="3" />
          <Label
            preset="p6"
            :text="$t('Registration.step', { step: 1, total: 3 })"
            class="text-medium-gray"
          />
        </div>
      </div>
      <!-- guide text -->
      <!-- body -->
      <div v-if="ownerWallet">
        <img v-if="avatar" :src="avatar">
        Please use {{ ownerWallet }} to sign this transaction.
      </div>
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
          :class="['flex', 'flex-col', 'justify-center', 'w-full', 'my-[64px]']"
          @submit.prevent="onSubmit"
        >
          <TextField
            v-model="url"
            class="flex flex-col"
            :placeholder="$t('NFTProtal.placeholder.register')"
            :error-message="errorMessage"
          />
          {{ iscnId }}
        </div>
        <!-- <ProgressIndicator v-if="isLoading" class="my-[4px]" preset="thin" /> -->
        <div class="flex flex-row self-end">
          <ProgressIndicator v-if="isLoading"/>
          <Button
            v-else
            :text="$t('NFTProtal.button.register')"
            preset="outline"
            @click="onSubmit"
          >
            <template #prepend>
              <IconAddToISCN class="w-[20px]" />
            </template>
          </Button>
        </div>
      </div>
    </Card>
  </Page>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { namespace } from 'vuex-class'
// eslint-disable-next-line import/no-extraneous-dependencies
import { OfflineSigner } from '@cosmjs/proto-signing'
import BigNumber from 'bignumber.js'

import { signISCNTx } from '~/utils/cosmos/iscn'
import { sendLIKE } from '~/utils/cosmos/sign';
import { formatISCNTxPayload } from '~/utils/cosmos/iscn/sign'
import { ISCNRegisterPayload } from '~/utils/cosmos/iscn/iscn.type'
import { getLikerIdMinApi, getAddressLikerIdMinApi , API_POST_ARWEAVE_ESTIMATE, API_POST_ARWEAVE_UPLOAD } from '~/constant/api'


const signerModule = namespace('signer')

@Component
export default class FetchIndex extends Vue {
  @signerModule.Getter('getAddress') address!: string
  @signerModule.Getter('getSigner') signer!: OfflineSigner | null

  url = this.$route.query.url as string || ''
  ownerWallet = ''
  errorMessage = ''
  body: Blob | null | undefined
  uploadArweaveId = ''
  arweaveFeeTargetAddress = ''
  arweaveFee = new BigNumber(0)
  memo = ''
  iscnId = ''
  isLoading = false
  avatar = null;

  async mounted() {
    if (this.iscnId) {
      this.$router.push(
        this.localeLocation({
          name: 'nft-iscn-iscnId',
          params: { iscnId: this.iscnId },
        })!,
      )
    }
    const { liker_id: likerId, wallet } = this.$route.query;
    if (wallet) {
      this.ownerWallet = wallet as string;
      try {
        const { data } = await this.$axios.get(getAddressLikerIdMinApi(wallet as string));
        this.avatar = data.avatar;
      } catch (err) {
        console.error(err);
      }
    } else if (likerId) {
      try {
        const { data } = await this.$axios.get(getLikerIdMinApi(likerId as string));
        this.ownerWallet = data.likeWallet;
        this.avatar = data.avatar;
      } catch (err) {
        console.error(err);
      }
    }

  }

  async onSubmit() {
    if (this.ownerWallet && this.address !== this.ownerWallet) {
      this.errorMessage = 'PLEASE_USE_OWNER_WALLET_TO_SIGN'
      return
    }
    const { url } = this
    if (!url) {
      this.errorMessage = this.$t(
        'HomePage.search.errormessage.empty',
      ) as string
      return
    }
    this.errorMessage = ''
    // eslint-disable-next-line no-restricted-globals
    const { data } = await this.$axios.get(`/crawler/?url=${encodeURIComponent(url)}`)
    this.body = new Blob([data.body], {type: "text/html"});
    await this.estimateArweaveFee();
    await this.submitToArweave();

    const description = this.truncate(data.description, 200)
    const fetchData = {
      type: 'CreativeWork',
      name: data.title,
      description,
      tagsString: data.keywords,
      url,
      exifInfo: {},
      license: '',
      ipfsHash: '',
      arweaveId: '',
      fileSHA256: '',
      authorNames: ['Author'],
      authorUrls: [['']],
      authorWallets: [[{
            address: this.address,
            type: 'like',
          }]],
      likerIds: [''],
      descriptions: [''],
      numbersProtocolAssetId: '',
    }
    await this.submitToISCN(fetchData)
  }

  // eslint-disable-next-line class-methods-use-this
  truncate(string: string, limit: number) {
    if (string.length > limit) {
      return `${string.substring(0, limit)}...`
    }
    return string
  }

  async estimateArweaveFee(): Promise<void> {
    const formData = new FormData();
    if (this.body) formData.append('file', this.body);
    try {
      const { address, arweaveId, LIKE, memo } = await this.$axios.$post(
        API_POST_ARWEAVE_ESTIMATE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      this.uploadArweaveId = arweaveId;
      if (LIKE) this.arweaveFee = new BigNumber(LIKE);
      this.arweaveFeeTargetAddress = address;
      this.memo = memo;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }

  async sendArweaveFeeTx(): Promise<string> {
    if (!this.signer) throw new Error('SIGNER_NOT_INITED');
    if (!this.arweaveFeeTargetAddress) throw new Error('TARGET_ADDRESS_NOT_SET');
    try {
      const { transactionHash } = await sendLIKE(this.address, this.arweaveFeeTargetAddress, this.arweaveFee.toFixed(), this.signer, this.memo);
      return transactionHash;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
    return '';
  }

  async submitToArweave(): Promise<void> {
    if (this.uploadArweaveId) return;
    const transactionHash = await this.sendArweaveFeeTx();
    const formData = new FormData();
    if (this.body) formData.append('file', this.body);
    try {
      const {
        arweaveId,
      } = await this.$axios.$post(
        `${API_POST_ARWEAVE_UPLOAD}?txHash=${transactionHash}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )
      this.uploadArweaveId = arweaveId
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
    }
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
      if (res) {
        this.$router.push(
          this.localeLocation({
            name: 'nft-iscn-iscnId',
            params: { iscnId: this.iscnId },
          })!,
        )
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
    }
    this.isLoading = false
  }
}
</script>