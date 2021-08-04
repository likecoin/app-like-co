<template>
  <div>
    <img class="max-w-md" :src="fileData">
    <a :href="`https://ipfs.io/ipfs/${ipfsHash}`">{{ ipfsHash }}</a>
    {{ type }}
    <form class="space-y-4" @submit.prevent="onSubmit">
      <fieldset>
        <label for="title">title</label>
        <input
          id="title"
          v-model="title"
          placeholder="title"
          required
        >
        <br />
        <label for="description">description</label>
        <input
          id="description"
          v-model="description"
          placeholder="description"
        >
      </fieldset>
      <fieldset v-for="(author,index) in authors" :key="index">
        <label :for="`author_${index}_id`">Author Name</label>
        <input
          :id="`author_${index}_name`"
          v-model="author.name"
          placeholder="Author Name"
        >
        <br />
        <label :for="`author_${index}_url`">Author URL</label>
        <input
          :id="`author_${index}_url`"
          v-model="author.url"
          :placeholder="`Author_${index} URL`"
        >
      </fieldset>
      <a class="bg-green-400 p-2 rounded-lg" href="#" @click.prevent="onClickAddAuthor">Add Author</a>
      <fieldset>
        <label for="tagsString">tagsString</label>
        <input
          id="tagsString"
          v-model="tagsString"
          placeholder="tags (seperate by ,)"
        >
      </fieldset>
      <fieldset>
        <label for="url">url</label>
        <input
          id="url"
          v-model="url"
          placeholder="Content URL"
        >
        <br />
        <label for="license">license</label>
        <input
          id="license"
          v-model="license"
          placeholder="License URL"
        >
      </fieldset>
      <button type=submit class="bg-green-400 p-2 rounded-lg" :disabled="!!uploadStatus" >
        {{ uploadStatus || 'Submit' }}
      </button>
    </form>
  </div>
</template>

<script lang="ts">
import BigNumber from 'bignumber.js';
import { OfflineSigner } from '@cosmjs/proto-signing'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { namespace } from 'vuex-class'

import { Author } from '~/types/author';

import { signISCNTx, estimateISCNTxGas, estimateISCNTxFee } from '~/utils/cosmos/iscn/sign';
import { parseISCNTxInfoFromTxSuccess } from '~/utils/cosmos/iscn';
import IPFSClient from '~/utils/ipfs';
import { getAccountBalance } from '~/utils/cosmos';

const signerModule = namespace('signer')

@Component
export default class IscnRegisterForm extends Vue{
  @Prop({ default: false }) readonly isImage!: boolean
  @Prop({ default: null }) readonly exifInfo: any|null|undefined
  @Prop({ default: null }) readonly fileBlob: Blob|null|undefined
  @Prop({ default: null }) readonly fileData: string|null|undefined
  @Prop(String) readonly fileSHA256!: string
  @Prop({ default: false }) readonly isIPFSLink!: boolean
  @Prop(String) readonly ipfsHash!: string

  authors: Author[] = [];
  title: string = '';
  description: string = '';
  tagsString: string = '';
  url: string = '';
  license: string = '';
  authorName: string = '';
  authorUrl: string = '';
  uploadStatus: string = '';
  uploadIpfsHash: string = this.ipfsHash;

  @signerModule.Getter('getAddress') address!: string
  @signerModule.Getter('getSigner') signer!: OfflineSigner | null

  get tags(): string[] {
    return (this.tagsString as string).split(',');
  }

  get authorNames() {
    return this.authors.map(a => a.name);
  }

  get authorUrls() {
    return this.authors.map(a => a.url);
  }

  get isPhoto() {
    return this.exifInfo && this.exifInfo.ExifImageWidth;
  }

  get type() {
    if (this.isPhoto) return 'Photo';
    if (this.isImage) return 'Image';
    return 'CreativeWorks';
  }

  mounted() {
    this.uploadStatus = '';
  }

  onClickAddAuthor() {
    this.authors.push({ name: '', url: '' });
  }

  async onSubmit(): Promise<void> {
    if (!this.isIPFSLink) await this.submitToIPFS();
    await this.submitToISCN();
  }

  async submitToIPFS(): Promise<void> {
    if (!this.fileBlob) return
    this.uploadStatus = "Uploading";
    const res = await IPFSClient.add(this.fileBlob);
    if (res.path) this.uploadIpfsHash = res.path;
  }

  async submitToISCN(): Promise<void> {
    this.uploadStatus = "Loading";
    const payload = {
      type: this.type,
      title: this.title,
      description: this.description,
      tagsString: this.tagsString,
      url: this.url,
      license: this.license,
      ipfsHash: this.uploadIpfsHash || this.ipfsHash,
      fileSHA256: this.fileSHA256,
      authorNames: this.authorNames,
      authorUrls: this.authorUrls,
    };
    const [balance, iscnFeeNanolike] = await Promise.all([
      getAccountBalance(this.address),
      estimateISCNTxFee(payload),
    ]);
    const gasFee = estimateISCNTxGas();
    const totalFee = new BigNumber(iscnFeeNanolike).plus(gasFee.amount[0].amount).shiftedBy(-9);
    if (new BigNumber(balance).lt(totalFee)) {
      throw new Error('INSUFFICIENT_BALANCE');
    }
    if (!this.signer) throw new Error('MISSING_SIGNER');
    this.uploadStatus = "Waiting for signature";
    const tx = await signISCNTx(payload, this.signer, this.address);
    this.uploadStatus = "Success";
    this.$emit('txBroadcasted', parseISCNTxInfoFromTxSuccess(tx));
  }
}

</script>
