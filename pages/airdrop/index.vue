<template>
  <ProgressIndicator />
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
// eslint-disable-next-line import/no-extraneous-dependencies
import { MetaInfo } from 'vue-meta'

@Component({
  head() {
    const title = this.$t('page.airdrop.title')
    const description = this.$t('page.airdrop.description')
    return {
      title,
      meta: [
        {
          hid: 'og:title',
          property: 'og:title',
          content: title,
        },
        {
          hid: 'description',
          name: 'description',
          content: description,
        },
        {
          hid: 'og:description',
          property: 'og:description',
          content: description,
        },
      ],
    } as MetaInfo
  },
  fetch({ redirect }) {
    redirect('airdrop/claim')
  },
})
export default class AirdropPage extends Vue {
}
</script>
