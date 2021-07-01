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

export default Vue.extend({
  name: 'IscnRegisterForm',
  props: {
    fileData: {
      type: [String, ArrayBuffer],
      required: false,
      default: null,
    },
    ipfsHash: {
      type: String,
      required: true,
    },
  },
  data(): {
      title: string;
      description: string;
      tagsString: string;
      url: string;
      license: string;
  } {
    return {
      title: '',
      description: '',
      tagsString: '',
      url: '',
      license: '',
    };
  },
  computed: {
    tags(): string[] {
      return (this.tagsString as string).split(',');
    },
  },
  methods: {
    onSubmit() {
      const payload = {
        title: this.title,
        description: this.description,
        tagsString: this.tagsString,
        url: this.url,
        license: this.license,
      };
      console.log(payload);
    },
  }
})

</script>
