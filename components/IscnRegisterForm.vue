<template>
  <div>
    <img :src="fileData">
    <a :href="`https://ipfs.io/${ipfsHash}`">{{ ipfsHash }}</a>
    <form @submit.prevent="onSubmit">
      <fieldset>
        <input
          id="title"
          v-model="title"
          required
        >
        <label for="title">title</label>
        <input
          id="description"
          v-model="description"
        >
        <label for="description">description</label>
      </fieldset>
      <fieldset v-for="(author,index) in authors" :key="index">
        <input
          :id="`author_${index}_name`"
          v-model="author.name"
        >
        <label :for="`author_${index}_id`">Author Name</label>
        <input
          :id="`author_${index}_url`"
          v-model="author.url"
        >
        <label :for="`author_${index}_url`">Author URL</label>
      </fieldset>
      <button @click.prevent="onClickAddAuthor">Add Author</button>
      <fieldset>
        <input
          id="tagsString"
          v-model="tagsString"
        >
        <label for="tagsString">tagsString</label>
      </fieldset>
      <fieldset>
        <input
          id="url"
          v-model="url"
        >
        <label for="url">url</label>
        <input
          id="license"
          v-model="license"
        >
        <label for="url">license</label>
      </fieldset>
      <button type=submit>submit</button>
    </form>
  </div>
</template>

<script lang="ts">
// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';
// eslint-disable-next-line import/no-extraneous-dependencies
import { mapGetters } from 'vuex';
import { Author } from '~/types/author';

import { signISCNTx } from '~/utils/cosmos';

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
    async onSubmit() {
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
      console.log(payload);
      const tx = await signISCNTx(payload, this.signer, this.address);
      console.log(tx);
    },
  }
})

</script>
