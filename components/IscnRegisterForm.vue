<template>
  <div>
    <img class="max-w-md" :src="fileData">
    <a :href="`https://ipfs.io/${ipfsHash}`">{{ ipfsHash }}</a>
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
      <button type=submit class="bg-green-400 p-2 rounded-lg">submit</button>
    </form>
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';
// eslint-disable-next-line import/no-extraneous-dependencies
import { mapGetters } from 'vuex';
import { Author } from '~/types/author';

import { signISCNTx } from '~/utils/cosmos/iscn/sign';
import { parseISCNTxInfoFromTxSuccess } from '~/utils/cosmos/iscn';

export default Vue.extend({
  name: 'IscnRegisterForm',
  props: {
    fileData: {
      type: [String, ArrayBuffer],
      required: false,
      default: null,
    },
    fileSHA256: {
      type: String,
      required: true,
    },
    ipfsHash: {
      type: String,
      required: true,
    },
  },
  data(): {
      authors: Author[];
      title: string;
      description: string;
      tagsString: string;
      url: string;
      license: string;
      authorName: string;
      authorUrl: string;
  } {
    return {
      authors: [],
      title: '',
      description: '',
      tagsString: '',
      url: '',
      license: '',
      authorName: '',
      authorUrl: '',
    };
  },
  computed: {
    ...mapGetters('signer', {
      address: 'getAddress',
      signer: 'getSigner',
    }),
    tags(): string[] {
      return (this.tagsString as string).split(',');
    },
    authorNames() {
      return this.authors.map(a => a.name);
    },
    authorUrls() {
      return this.authors.map(a => a.url);
    },
  },
  methods: {
    onClickAddAuthor() {
      this.authors.push({ name: '', url: '' });
    },
    onSubmit() {
      this.submitToISCN();
    },
    async submitToISCN() {
      const payload = {
        title: this.title,
        description: this.description,
        tagsString: this.tagsString,
        url: this.url,
        license: this.license,
        ipfsHash: this.ipfsHash,
        fileSHA256: this.fileSHA256,
        authorNames: this.authorNames,
        authorUrls: this.authorUrls,
      };
      const tx = await signISCNTx(payload, this.signer, this.address);
      this.$emit('txBroadcasted', parseISCNTxInfoFromTxSuccess(tx));
    }
  }
})

</script>
