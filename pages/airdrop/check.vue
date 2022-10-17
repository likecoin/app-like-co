<template>
  <div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
// eslint-disable-next-line import/no-extraneous-dependencies
import { MetaInfo } from 'vue-meta'

@Component({
  head() {
    const title = this.$t('page.airdrop.checker.title')
    const description = this.$t('page.airdrop.checker.description')
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
    redirect('claim')
  },
})
export default class AirdropCheckPage extends Vue {
}
</script>
